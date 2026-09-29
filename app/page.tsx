"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUpload } from "./components/ImageUpload";
import { MetricsForm } from "./components/MetricsForm";
import { AnalysisReport } from "./components/AnalysisReport";
import { AnalysisLoading } from "./components/AnalysisLoading";
import { HistoryPanel } from "./components/HistoryPanel";
import {
  EMPTY_METRICS,
  REQUIRED_METRIC_KEYS,
  type AnalysisHistoryEntry,
  type AnalysisResult,
  type Metrics,
} from "./lib/types";
import {
  clearHistory,
  deleteAnalysis,
  generateThumbnail,
  getHistory,
  saveAnalysis,
} from "./lib/history";

// ---------------------------------------------------------------------------
// Demo presets — realistic scenarios for testing without an API key
// ---------------------------------------------------------------------------
const DEMO_PRESETS = [
  {
    label: "Meta Ads — E-commerce with low CTR",
    metrics: {
      platform: "Meta Ads",
      objective: "Conversions",
      industry: "E-commerce / Retail",
      investment: "2500",
      impressions: "85000",
      clicks: "1020",
      ctr: "1.20",
      cpc: "2.45",
      cpm: "29.41",
      conversions: "18",
      cpa: "138.89",
      roas: "2.1",
      adContext: "",
    } satisfies Metrics,
    bgColor: "#C0392B",
    accentColor: "#E74C3C",
    headline: "50% OFF — Today Only!",
    subtext: "Free shipping over $99",
    cta: "Shop Now",
  },
  {
    label: "Google Ads — Lead gen with good performance",
    metrics: {
      platform: "Google Ads",
      objective: "Lead Generation",
      industry: "B2B Services",
      investment: "4200",
      impressions: "62000",
      clicks: "3100",
      ctr: "5.00",
      cpc: "1.35",
      cpm: "67.74",
      conversions: "186",
      cpa: "22.58",
      roas: "5.8",
      adContext: "",
    } satisfies Metrics,
    bgColor: "#1A73E8",
    accentColor: "#4285F4",
    headline: "Free Quote",
    subtext: "Talk to an expert today",
    cta: "Get Started",
  },
  {
    label: "Meta Ads — Brand awareness with high CPM",
    metrics: {
      platform: "Meta Ads",
      objective: "Brand Awareness",
      industry: "Fashion / Beauty",
      investment: "800",
      impressions: "42000",
      clicks: "588",
      ctr: "1.40",
      cpc: "1.36",
      cpm: "19.05",
      conversions: "",
      cpa: "",
      roas: "",
      adContext: "",
    } satisfies Metrics,
    bgColor: "#5B21B6",
    accentColor: "#7C3AED",
    headline: "New Collection 2025",
    subtext: "Discover what's new",
    cta: "Explore",
  },
];

function createDemoImage(
  bgColor: string,
  accentColor: string,
  headline: string,
  subtext: string,
  cta: string
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 628;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(new File([new Uint8Array(0)], "demo-ad.png", { type: "image/png" }));
      return;
    }

    const bg = ctx.createLinearGradient(0, 0, 800, 628);
    bg.addColorStop(0, bgColor);
    bg.addColorStop(1, accentColor);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 800, 628);

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(680, 100, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 540, 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, 800, 628);
    ctx.fillStyle = "rgba(255,255,0,0.85)";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "left";
    ctx.fillText("DEMO — auto-generated image", 14, 22);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 8;
    ctx.fillText(headline, 400, 260);

    ctx.font = "26px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.shadowBlur = 4;
    ctx.fillText(subtext, 400, 320);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#FFFFFF";
    const pillX = 280, pillY = 388, pillW = 240, pillH = 56, r = 28;
    ctx.beginPath();
    ctx.moveTo(pillX + r, pillY);
    ctx.lineTo(pillX + pillW - r, pillY);
    ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
    ctx.lineTo(pillX + pillW, pillY + pillH - r);
    ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
    ctx.lineTo(pillX + r, pillY + pillH);
    ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
    ctx.lineTo(pillX, pillY + r);
    ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = bgColor;
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(cta, 400, 424);

    canvas.toBlob((blob) => {
      resolve(new File([blob!], "demo-ad.png", { type: "image/png" }));
    }, "image/png");
  });
}

// ---------------------------------------------------------------------------
// Parse streamed JSON (handles leading/trailing whitespace and code fences)
// and normalize the shape so the UI never crashes on a missing field.
// Claude's streamed output can be truncated or omit fields; the UI assumes
// arrays and score dims always exist, so we fill them in defensively here.
// ---------------------------------------------------------------------------
function parseAnalysisJson(raw: string): AnalysisResult {
  let cleaned = raw.trim();
  // Strip markdown code fences if Claude wrapped the JSON
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  const parsed = JSON.parse(cleaned) as Partial<AnalysisResult>;

  // Detect API error responses that parsed as valid JSON but aren't analysis
  if ("error" in (parsed as Record<string, unknown>)) {
    const msg = (parsed as Record<string, unknown>).error;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  const emptyDim = { score: 0, summary: "" };
  const scores = parsed.scores ?? ({} as Partial<AnalysisResult["scores"]>);

  return {
    overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : 0,
    verdict: parsed.verdict ?? "Needs Improvement",
    scores: {
      hookStrength: scores.hookStrength ?? emptyDim,
      visualClarity: scores.visualClarity ?? emptyDim,
      ctaEffectiveness: scores.ctaEffectiveness ?? emptyDim,
      copyVisualAlignment: scores.copyVisualAlignment ?? emptyDim,
      audienceRelevance: scores.audienceRelevance ?? emptyDim,
    },
    diagnosis: parsed.diagnosis ?? "",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    visualAnalysis: parsed.visualAnalysis ?? "",
    variations: Array.isArray(parsed.variations) ? parsed.variations : [],
    benchmarks: Array.isArray(parsed.benchmarks) ? parsed.benchmarks : [],
  };
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
type AppState = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [appState, setAppState] = useState<AppState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [demoIndex, setDemoIndex] = useState(0);
  const [demoLabel, setDemoLabel] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  async function loadDemoData() {
    const preset = DEMO_PRESETS[demoIndex % DEMO_PRESETS.length];
    setDemoIndex((i) => i + 1);

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    const file = await createDemoImage(
      preset.bgColor,
      preset.accentColor,
      preset.headline,
      preset.subtext,
      preset.cta
    );
    const preview = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);
    setMetrics(preset.metrics);
    setDemoLabel(preset.label);
    setAppState("idle");
    setAnalysis(null);
    setErrorMessage("");
  }

  function handleFileChange(file: File, preview: string) {
    setImageFile(file);
    setImagePreview(preview);
  }

  function handleClearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  function handleReset() {
    if (abortRef.current) abortRef.current.abort();
    handleClearImage();
    setMetrics(EMPTY_METRICS);
    setAnalysis(null);
    setAppState("idle");
    setErrorMessage("");
    setDemoLabel(null);
  }

  function isFormValid(): boolean {
    return (
      imageFile !== null &&
      REQUIRED_METRIC_KEYS.every((key) => metrics[key] !== "")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile || !isFormValid()) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAppState("loading");
    setErrorMessage("");
    setAnalysis(null);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("metrics", JSON.stringify(metrics));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error ?? `Error ${response.status}`);
      }

      // Read streamed response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      // Parse the complete JSON
      const result = parseAnalysisJson(fullText);
      setAnalysis(result);
      setAppState("done");

      // Save to history
      const thumbnail = await generateThumbnail(imageFile);
      const entry: AnalysisHistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        platform: metrics.platform,
        objective: metrics.objective,
        industry: metrics.industry,
        overallScore: result.overallScore,
        verdict: result.verdict,
        metrics: { ...metrics },
        analysis: result,
        imagePreviewDataUrl: thumbnail,
      };
      saveAnalysis(entry);
      setHistory(getHistory());
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setErrorMessage(
        err instanceof Error ? err.message : "Unexpected error. Please try again."
      );
      setAppState("error");
    }
  }

  function handleHistorySelect(entry: AnalysisHistoryEntry) {
    setAnalysis(entry.analysis);
    setAppState("done");
    setDemoLabel(null);
  }

  function handleHistoryDelete(id: string) {
    deleteAnalysis(id);
    setHistory(getHistory());
  }

  function handleHistoryClear() {
    clearHistory();
    setHistory([]);
  }

  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                AdAnalyzer
              </h1>
              <p className="text-xs text-gray-500">
                AI-Powered Ad Creative Analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="hidden sm:inline">Powered by Claude Vision</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {appState === "done" && analysis ? (
          <AnalysisReport
            analysis={analysis}
            imageFile={imageFile}
            onReset={handleReset}
            onExportPdf={handleExportPdf}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left column: form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* History */}
              <HistoryPanel
                history={history}
                onSelect={handleHistorySelect}
                onDelete={handleHistoryDelete}
                onClearAll={handleHistoryClear}
              />

              {/* Demo loader */}
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3">
                <div className="shrink-0">
                  <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.607L5 14.5m14.8.5l-1.15 4.502a2.25 2.25 0 01-2.185 1.718H7.535a2.25 2.25 0 01-2.185-1.718L4.2 15" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  {demoLabel ? (
                    <p className="text-xs text-indigo-700 truncate">
                      <span className="font-semibold">Active scenario:</span>{" "}
                      {demoLabel}
                    </p>
                  ) : (
                    <p className="text-xs text-indigo-600">
                      No API key? Load a test scenario to preview the layout.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={loadDemoData}
                  className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  {demoLabel ? "Next scenario" : "Load demo"}
                </button>
              </div>

              {/* Upload */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="section-title">Ad Creative</p>
                <ImageUpload
                  file={imageFile}
                  preview={imagePreview}
                  onFileChange={handleFileChange}
                  onClear={handleClearImage}
                />
              </div>

              {/* Metrics */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="section-title">Campaign Metrics</p>
                <MetricsForm metrics={metrics} onChange={setMetrics} />
              </div>

              {/* Error */}
              {appState === "error" && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isFormValid() || appState === "loading"}
                className="
                  w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white
                  transition-all hover:bg-primary-hover
                  disabled:cursor-not-allowed disabled:opacity-50
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                "
              >
                {appState === "loading"
                  ? "Analyzing your creative..."
                  : "Analyze Creative"}
              </button>

              {/* Mobile loading indicator */}
              {appState === "loading" && (
                <div className="lg:hidden">
                  <AnalysisLoading />
                </div>
              )}
            </form>

            {/* Right column: placeholder / loading */}
            <div className="hidden lg:block">
              {appState === "loading" ? (
                <AnalysisLoading />
              ) : (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Your report will appear here
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Upload your creative, fill in the metrics, and click Analyze
                    </p>
                  </div>
                  <div className="mt-4 space-y-1.5 text-left w-full max-w-xs">
                    {[
                      "Creative Scorecard (0–100)",
                      "What's working vs. what needs fixing",
                      "Visual element analysis",
                      "Industry benchmark comparison",
                      "3 specific creative variations to test",
                      "Actionable next steps",
                    ].map((section) => (
                      <div
                        key={section}
                        className="flex items-center gap-2 text-xs text-gray-400"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                        {section}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white print:hidden">
        <div className="mx-auto max-w-6xl px-6 py-4 text-center text-xs text-gray-400">
          AdAnalyzer — AI-powered ad creative diagnostics. Not affiliated with
          Meta, Google, TikTok, or LinkedIn.
        </div>
      </footer>
    </div>
  );
}
