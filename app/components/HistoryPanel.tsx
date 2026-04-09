"use client";

import { useState } from "react";
import type { AnalysisHistoryEntry } from "../lib/types";

interface HistoryPanelProps {
  history: AnalysisHistoryEntry[];
  onSelect: (entry: AnalysisHistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-50";
  if (score >= 60) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

export function HistoryPanel({
  history,
  onSelect,
  onDelete,
  onClearAll,
}: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">
            Recent Analyses
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {history.length}
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100">
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {history.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors group"
              >
                {entry.imagePreviewDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.imagePreviewDataUrl}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {entry.platform} — {entry.objective}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${getScoreColor(entry.overallScore)}`}
                    >
                      {entry.overallScore}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {entry.industry} — {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all shrink-0"
                  aria-label="Delete analysis"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 px-5 py-2">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Clear all history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
