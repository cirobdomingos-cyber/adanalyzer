"use client";

import { useState } from "react";
import type { AnalysisResult } from "../lib/types";
import { ScoreCard } from "./ScoreCard";
import { BenchmarkTable } from "./BenchmarkTable";

interface AnalysisReportProps {
  analysis: AnalysisResult;
  imageFile?: File | null;
  onReset: () => void;
  onExportPdf: () => void;
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BulletList({
  items,
  color = "gray",
}: {
  items: string[];
  color?: "green" | "red" | "gray";
}) {
  const dotColors = {
    green: "bg-emerald-400",
    red: "bg-red-400",
    gray: "bg-gray-400",
  };
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-gray-700">
          <div
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColors[color]}`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function AnalysisReport({
  analysis,
  imageFile,
  onReset,
  onExportPdf,
}: AnalysisReportProps) {
  const [genState, setGenState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [genError, setGenError] = useState("");

  async function handleGenerateImproved() {
    if (!imageFile) return;
    setGenState("loading");
    setGenError("");
    setGeneratedImage(null);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("analysis", JSON.stringify(analysis));

    try {
      const res = await fetch("/api/generate-improved", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setGeneratedImage(`data:${data.mimeType};base64,${data.imageBase64}`);
      setGenState("done");
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Generation failed. Please try again.");
      setGenState("error");
    }
  }

  return (
    <div className="space-y-6" id="analysis-report">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Analysis Report
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={onReset}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>

      {/* Score card — hero section */}
      <ScoreCard analysis={analysis} />

      {/* Two-column grid for strengths/weaknesses */}
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="What's Working"
          icon={
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          }
        >
          <BulletList items={analysis.strengths} color="green" />
        </SectionCard>

        <SectionCard
          title="What Needs Improvement"
          icon={
            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        >
          <BulletList items={analysis.weaknesses} color="red" />
        </SectionCard>
      </div>

      {/* Visual analysis */}
      <SectionCard
        title="Visual Analysis"
        icon={
          <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          {analysis.visualAnalysis}
        </p>
      </SectionCard>

      {/* Benchmarks */}
      <BenchmarkTable benchmarks={analysis.benchmarks} />

      {/* Creative variations to test */}
      <SectionCard
        title="Creative Variations to Test"
        icon={
          <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        }
      >
        <div className="space-y-4">
          {analysis.variations.map((variation, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                  {i + 1}
                </span>
                <h4 className="text-sm font-semibold text-gray-900">
                  {variation.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 ml-7">
                {variation.description}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Full diagnosis */}
      <SectionCard
        title="Full Diagnosis"
        icon={
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        }
      >
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {analysis.diagnosis}
        </p>
      </SectionCard>

      {/* Generate Improved Version */}
      {imageFile && (
        <SectionCard
          title="Generate Improved Version"
          icon={
            <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
        >
          <p className="text-sm text-gray-500 mb-4">
            AI will generate a revised version of your ad applying the top improvements identified above — powered by Gemini 2.0 Flash.
          </p>

          {genState === "idle" && (
            <button
              onClick={handleGenerateImproved}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate Improved Ad
            </button>
          )}

          {genState === "loading" && (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <svg className="h-5 w-5 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating improved ad — this may take 15–30 seconds…
            </div>
          )}

          {genState === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-red-600">{genError}</p>
              <button
                onClick={handleGenerateImproved}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {genState === "done" && generatedImage && (
            <div className="space-y-3">
              <img
                src={generatedImage}
                alt="AI-generated improved ad"
                className="w-full rounded-lg border border-gray-200 shadow-sm"
              />
              <div className="flex items-center gap-3">
                <a
                  href={generatedImage}
                  download="improved-ad.png"
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </a>
                <button
                  onClick={() => { setGenState("idle"); setGeneratedImage(null); }}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
