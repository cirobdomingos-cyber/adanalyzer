"use client";

import type { AnalysisResult } from "../lib/types";

interface ScoreCardProps {
  analysis: AnalysisResult;
}

const SCORE_LABELS: Record<string, string> = {
  hookStrength: "Hook Strength",
  visualClarity: "Visual Clarity",
  ctaEffectiveness: "CTA Effectiveness",
  copyVisualAlignment: "Copy-Visual Alignment",
  audienceRelevance: "Audience Relevance",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return "#059669"; // emerald-600
  if (score >= 60) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
}

function getVerdictStyle(verdict: string): string {
  switch (verdict) {
    case "Excellent":
      return "bg-emerald-100 text-emerald-700";
    case "Good":
      return "bg-blue-100 text-blue-700";
    case "Needs Improvement":
      return "bg-amber-100 text-amber-700";
    case "Poor":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreRingColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
        <span className="text-xs text-gray-400">/100</span>
      </div>
    </div>
  );
}

export function ScoreCard({ analysis }: ScoreCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Overall score */}
      <div className="flex items-center gap-6">
        <ScoreRing score={analysis.overallScore} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Creative Score
          </h3>
          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${getVerdictStyle(analysis.verdict)}`}
          >
            {analysis.verdict}
          </span>
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {analysis.diagnosis.split(".").slice(0, 2).join(".")}.
          </p>
        </div>
      </div>

      {/* Dimension scores */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(analysis.scores).map(([key, dim]) => (
          <div
            key={key}
            className={`rounded-lg border p-3 ${getScoreBg(dim.score)}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                {SCORE_LABELS[key] ?? key}
              </span>
              <span
                className={`text-lg font-bold ${getScoreColor(dim.score)}`}
              >
                {dim.score}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {dim.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
