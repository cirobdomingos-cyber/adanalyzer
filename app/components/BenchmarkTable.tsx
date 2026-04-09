"use client";

import type { BenchmarkComparison } from "../lib/types";

interface BenchmarkTableProps {
  benchmarks: BenchmarkComparison[];
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const styles: Record<string, string> = {
    above: "bg-emerald-100 text-emerald-700",
    at: "bg-blue-100 text-blue-700",
    below: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    above: "Above Avg",
    at: "At Avg",
    below: "Below Avg",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[verdict] ?? "bg-gray-100 text-gray-600"}`}
    >
      {labels[verdict] ?? verdict}
    </span>
  );
}

function formatValue(metric: string, value: number | null): string {
  if (value === null) return "—";
  if (metric === "CTR") return `${value}%`;
  if (metric === "ROAS") return `${value}x`;
  return `$${value.toFixed(2)}`;
}

export function BenchmarkTable({ benchmarks }: BenchmarkTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">
          Benchmark Comparison
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Your metrics vs. industry averages and top 25% performers
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3">Metric</th>
              <th className="px-5 py-3">Yours</th>
              <th className="px-5 py-3">Avg</th>
              <th className="px-5 py-3">Top 25%</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {benchmarks.map((b) => (
              <tr key={b.metric} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900">
                  {b.metric}
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {formatValue(b.metric, b.yours)}
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {formatValue(b.metric, b.industryAvg)}
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {formatValue(b.metric, b.top25)}
                </td>
                <td className="px-5 py-3">
                  <VerdictBadge verdict={b.verdict} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
