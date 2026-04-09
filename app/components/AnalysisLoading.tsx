"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Reading your ad creative...",
  "Analyzing visual elements...",
  "Evaluating copy and CTA...",
  "Comparing against benchmarks...",
  "Generating recommendations...",
  "Building your report...",
];

export function AnalysisLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-primary/30 bg-primary-light p-10 text-center"
    >
      {/* Animated spinner */}
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-primary"
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
      </div>

      {/* Progress steps */}
      <div className="space-y-2">
        <p className="font-medium text-primary text-sm">
          Analyzing your creative...
        </p>
        <div className="space-y-1">
          {STEPS.map((label, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-xs transition-all duration-500 ${
                i < step
                  ? "text-emerald-600"
                  : i === step
                    ? "text-primary font-medium"
                    : "text-gray-400"
              }`}
            >
              {i < step ? (
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : i === step ? (
                <div className="h-3.5 w-3.5 shrink-0 flex items-center justify-center">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                </div>
              ) : (
                <div className="h-3.5 w-3.5 shrink-0 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                </div>
              )}
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
