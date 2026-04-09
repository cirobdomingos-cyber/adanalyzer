import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "../../lib/rate-limit";
import type { AnalysisResult } from "../../lib/types";

export const maxDuration = 60;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function buildImprovementPrompt(analysis: AnalysisResult): string {
  const weaknesses = analysis.weaknesses.slice(0, 3).join("\n- ");
  const topVariation = analysis.variations[0];

  return `You are a senior ad creative designer. This is an existing paid media ad creative with identified performance issues.

Weaknesses to fix:
- ${weaknesses}

Primary creative improvement to apply:
${topVariation ? `"${topVariation.title}": ${topVariation.description}` : "Improve visual clarity and call-to-action prominence."}

Generate an improved version of this ad creative that:
1. Fixes the weaknesses listed above
2. Applies the primary creative improvement
3. Maintains the same overall format, aspect ratio, and brand direction
4. Looks like a finished, production-ready ad — not a mockup or wireframe

Return ONLY the improved image. No text explanation.`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Rate limiting: 5 requests per minute (image gen is expensive)
  const ip = getClientIp(request);
  const limit = rateLimit(`imggen:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.resetMs / 1000)) } }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const imageFile = formData.get("image") as File | null;
  const analysisJson = formData.get("analysis") as string | null;

  if (!imageFile || !analysisJson) {
    return NextResponse.json({ error: "Image and analysis are required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    return NextResponse.json({ error: "Image must be JPEG, PNG, WebP or GIF" }, { status: 400 });
  }

  if (imageFile.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image must be under 10MB" }, { status: 413 });
  }

  let analysis: AnalysisResult;
  try {
    analysis = JSON.parse(analysisJson) as AnalysisResult;
  } catch {
    return NextResponse.json({ error: "Invalid analysis JSON" }, { status: 400 });
  }

  const imageBuffer = await imageFile.arrayBuffer();
  const imageBase64 = Buffer.from(imageBuffer).toString("base64");
  const mediaType = imageFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  const prompt = buildImprovementPrompt(analysis);

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: mediaType, data: imageBase64 } },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      return NextResponse.json({ error: "No response from image generation model" }, { status: 502 });
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return NextResponse.json({
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType ?? "image/png",
        });
      }
    }

    return NextResponse.json({ error: "Model did not return an image" }, { status: 502 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
