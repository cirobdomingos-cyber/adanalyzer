import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { METRIC_LABELS, type Metrics } from "../../lib/types";
import { getBenchmarks } from "../../lib/benchmarks";
import { rateLimit } from "../../lib/rate-limit";

export const maxDuration = 60;

const client = new Anthropic();

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_METRIC_KEYS = new Set(Object.keys(METRIC_LABELS));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function validateMetrics(raw: unknown): { ok: true; data: Record<string, string> } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "Metrics must be a JSON object" };
  }

  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length > ALLOWED_METRIC_KEYS.size + 5) {
    return { ok: false, error: "Too many metric fields" };
  }

  const cleaned: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (!ALLOWED_METRIC_KEYS.has(key)) continue; // silently skip unknown keys
    if (typeof value !== "string") {
      return { ok: false, error: `Invalid value for ${key}` };
    }
    const maxLen = key === "adContext" ? 2000 : 100;
    if (value.length > maxLen) {
      return { ok: false, error: `Value for ${key} is too long` };
    }
    cleaned[key] = value.trim();
  }

  // Check required fields
  const required = ["platform", "objective", "industry", "investment", "impressions", "clicks"];
  for (const field of required) {
    if (!cleaned[field]) {
      return { ok: false, error: `Missing required field: ${field}` };
    }
  }

  return { ok: true, data: cleaned };
}

function formatMetrics(metrics: Record<string, string>): string {
  return Object.entries(metrics)
    .filter(([key, value]) => value !== "" && key !== "platform" && key !== "objective" && key !== "industry" && key !== "adContext")
    .map(([key, value]) => `- ${METRIC_LABELS[key as keyof Metrics] ?? key}: ${value}`)
    .join("\n");
}

function formatBenchmarks(platform: string, objective: string, industry: string): string {
  const b = getBenchmarks(platform, objective, industry);
  return `
Industry benchmarks for ${platform} / ${objective} / ${industry}:
- CTR: avg ${b.ctr.avg}%, top 25% ${b.ctr.top25}%
- CPC: avg $${b.cpc.avg}, top 25% $${b.cpc.top25}
- CPM: avg $${b.cpm.avg}, top 25% $${b.cpm.top25}
- Conversion Rate: avg ${b.conversionRate.avg}%, top 25% ${b.conversionRate.top25}%
- CPA: avg $${b.cpa.avg}, top 25% $${b.cpa.top25}
- ROAS: avg ${b.roas.avg}x, top 25% ${b.roas.top25}x
`.trim();
}

function buildPrompt(metricsText: string, benchmarksText: string, adContext?: string): string {
  return `Analyze this paid media ad creative along with the campaign metrics and industry benchmarks below. Return your analysis as a valid JSON object matching this exact structure — no markdown, no code fences, ONLY the JSON:

{
  "overallScore": <number 0-100>,
  "verdict": "<Excellent|Good|Needs Improvement|Poor>",
  "scores": {
    "hookStrength": { "score": <0-100>, "summary": "<1-2 sentences>" },
    "visualClarity": { "score": <0-100>, "summary": "<1-2 sentences>" },
    "ctaEffectiveness": { "score": <0-100>, "summary": "<1-2 sentences>" },
    "copyVisualAlignment": { "score": <0-100>, "summary": "<1-2 sentences>" },
    "audienceRelevance": { "score": <0-100>, "summary": "<1-2 sentences>" }
  },
  "diagnosis": "<2-3 paragraph overall diagnosis>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "visualAnalysis": "<detailed analysis of the image: composition, colors, text, faces, product visibility, emotional tone>",
  "variations": [
    { "title": "<variation name>", "description": "<specific actionable description of what to change in the creative>" },
    { "title": "<variation name>", "description": "<...>" },
    { "title": "<variation name>", "description": "<...>" }
  ],
  "benchmarks": [
    { "metric": "CTR", "yours": <number|null>, "industryAvg": <number>, "top25": <number>, "verdict": "<above|at|below>" },
    { "metric": "CPC", "yours": <number|null>, "industryAvg": <number>, "top25": <number>, "verdict": "<above|at|below>" },
    { "metric": "CPM", "yours": <number|null>, "industryAvg": <number>, "top25": <number>, "verdict": "<above|at|below>" },
    { "metric": "CPA", "yours": <number|null>, "industryAvg": <number>, "top25": <number>, "verdict": "<above|at|below>" },
    { "metric": "ROAS", "yours": <number|null>, "industryAvg": <number>, "top25": <number>, "verdict": "<above|at|below>" }
  ]
}

Scoring rules:
- overallScore is a weighted average: hookStrength 25%, visualClarity 20%, ctaEffectiveness 25%, copyVisualAlignment 15%, audienceRelevance 15%
- "above" = better than industry avg, "at" = within 15% of avg, "below" = worse than avg
- For CPC and CPA, LOWER is better (so yours < avg = "above")
- For CTR and ROAS, HIGHER is better
- If a metric is not provided by the user, set "yours" to null

Be direct, specific, and actionable. No fluff. Every recommendation must describe exactly what to change and why.

---
${adContext ? `**Ad context provided by the advertiser:**\n${adContext}\n\n` : ""}**Campaign metrics:**
${metricsText}

**${benchmarksText}**`;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  // Rate limiting: 15 requests per minute per IP
  const ip = getClientIp(request);
  const limit = rateLimit(ip, { maxRequests: 15, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.resetMs / 1000)) } }
    );
  }

  // Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const imageFile = formData.get("image") as File | null;
  const metricsJson = formData.get("metrics") as string | null;

  if (!imageFile || !metricsJson) {
    return NextResponse.json({ error: "Image and metrics are required" }, { status: 400 });
  }

  // Validate image type
  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    return NextResponse.json({ error: "Image must be JPEG, PNG, WebP or GIF" }, { status: 400 });
  }

  // Validate image size
  if (imageFile.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image must be under 10MB" }, { status: 413 });
  }

  // Validate and sanitize metrics
  let parsedMetrics: unknown;
  try {
    parsedMetrics = JSON.parse(metricsJson);
  } catch {
    return NextResponse.json({ error: "Invalid metrics JSON" }, { status: 400 });
  }

  const validation = validateMetrics(parsedMetrics);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const metrics = validation.data;

  // Encode image
  const imageBuffer = await imageFile.arrayBuffer();
  const imageBase64 = Buffer.from(imageBuffer).toString("base64");
  const mediaType = imageFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  // Build prompt with real benchmarks
  const metricsText = formatMetrics(metrics);
  const benchmarksText = formatBenchmarks(metrics.platform, metrics.objective, metrics.industry);
  const userPrompt = buildPrompt(metricsText, benchmarksText, metrics.adContext || undefined);

  // Stream response from Claude
  try {
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "You are a senior paid media strategist with 10+ years of experience across Meta Ads, Google Ads, TikTok Ads, and LinkedIn Ads. You analyze ad creatives by examining the visual elements, copy, and campaign metrics to produce structured, actionable insights. You always respond with valid JSON — no markdown, no explanations outside the JSON. Be blunt and specific.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 },
            },
            { type: "text", text: userPrompt },
          ],
        },
      ],
    });

    // Stream text chunks to the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(JSON.stringify({ error: msg })));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : "Error calling Anthropic API";
    return NextResponse.json({ error: errMessage }, { status: 502 });
  }
}
