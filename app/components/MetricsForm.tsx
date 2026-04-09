"use client";

import {
  type Metrics,
  PLATFORMS,
  OBJECTIVES,
  INDUSTRIES,
} from "../lib/types";

interface MetricsFormProps {
  metrics: Metrics;
  onChange: (updated: Metrics) => void;
}

export function MetricsForm({ metrics, onChange }: MetricsFormProps) {
  const set =
    (key: keyof Metrics) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onChange({ ...metrics, [key]: e.target.value });

  return (
    <div className="space-y-4">
      {/* Platform + Objective */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="metric-platform" className="label">
            Platform *
          </label>
          <select
            id="metric-platform"
            className="input-field"
            value={metrics.platform}
            onChange={set("platform")}
          >
            <option value="">Select</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="metric-objective" className="label">
            Objective *
          </label>
          <select
            id="metric-objective"
            className="input-field"
            value={metrics.objective}
            onChange={set("objective")}
          >
            <option value="">Select</option>
            {OBJECTIVES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="metric-industry" className="label">
          Industry / Vertical *
        </label>
        <select
          id="metric-industry"
          className="input-field"
          value={metrics.industry}
          onChange={set("industry")}
        >
          <option value="">Select</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* Investment + Impressions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="metric-investment" className="label">
            Total Spend (USD) *
          </label>
          <input
            id="metric-investment"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1500.00"
            className="input-field"
            value={metrics.investment}
            onChange={set("investment")}
          />
        </div>
        <div>
          <label htmlFor="metric-impressions" className="label">
            Impressions *
          </label>
          <input
            id="metric-impressions"
            type="number"
            min="0"
            placeholder="e.g. 120000"
            className="input-field"
            value={metrics.impressions}
            onChange={set("impressions")}
          />
        </div>
      </div>

      {/* Clicks + CTR */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="metric-clicks" className="label">
            Clicks *
          </label>
          <input
            id="metric-clicks"
            type="number"
            min="0"
            placeholder="e.g. 1800"
            className="input-field"
            value={metrics.clicks}
            onChange={set("clicks")}
          />
        </div>
        <div>
          <label htmlFor="metric-ctr" className="label">
            CTR (%)
          </label>
          <input
            id="metric-ctr"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1.50"
            className="input-field"
            value={metrics.ctr}
            onChange={set("ctr")}
          />
        </div>
      </div>

      {/* CPC + CPM */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="metric-cpc" className="label">
            CPC (USD)
          </label>
          <input
            id="metric-cpc"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 0.83"
            className="input-field"
            value={metrics.cpc}
            onChange={set("cpc")}
          />
        </div>
        <div>
          <label htmlFor="metric-cpm" className="label">
            CPM (USD)
          </label>
          <input
            id="metric-cpm"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 12.50"
            className="input-field"
            value={metrics.cpm}
            onChange={set("cpm")}
          />
        </div>
      </div>

      {/* Conversions + CPA */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="metric-conversions" className="label">
            Conversions
          </label>
          <input
            id="metric-conversions"
            type="number"
            min="0"
            placeholder="e.g. 45"
            className="input-field"
            value={metrics.conversions}
            onChange={set("conversions")}
          />
        </div>
        <div>
          <label htmlFor="metric-cpa" className="label">
            CPA (USD)
          </label>
          <input
            id="metric-cpa"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 33.33"
            className="input-field"
            value={metrics.cpa}
            onChange={set("cpa")}
          />
        </div>
      </div>

      {/* ROAS */}
      <div>
        <label htmlFor="metric-roas" className="label">
          ROAS{" "}
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="metric-roas"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 3.20"
          className="input-field"
          value={metrics.roas}
          onChange={set("roas")}
        />
      </div>

      {/* Ad Context */}
      <div>
        <label htmlFor="metric-adContext" className="label">
          Ad Context{" "}
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="metric-adContext"
          rows={4}
          placeholder="Describe the campaign goal, target audience, product/service, and any key message you want the ad to convey. This helps the AI give more relevant recommendations."
          className="input-field resize-none"
          value={metrics.adContext ?? ""}
          onChange={set("adContext")}
          maxLength={2000}
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {(metrics.adContext ?? "").length}/2000
        </p>
      </div>
    </div>
  );
}
