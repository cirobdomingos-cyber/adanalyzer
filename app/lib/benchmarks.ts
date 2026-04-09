// ---------------------------------------------------------------------------
// Real benchmark data by platform × objective × industry
// Sources: WordStream 2025, Triple Whale 2025, EvenDigit 2026, Enrich Labs 2026
// ---------------------------------------------------------------------------

interface BenchmarkEntry {
  ctr: { avg: number; top25: number };
  cpc: { avg: number; top25: number };
  cpm: { avg: number; top25: number };
  conversionRate: { avg: number; top25: number };
  cpa: { avg: number; top25: number };
  roas: { avg: number; top25: number };
}

type BenchmarkKey = `${string}|${string}|${string}`;

// Key format: "platform|objective|industry"
// "any" can be used as a wildcard for fallback matching
const BENCHMARK_DB: Record<string, BenchmarkEntry> = {
  // -----------------------------------------------------------------------
  // Meta Ads benchmarks
  // -----------------------------------------------------------------------
  "Meta Ads|Conversions|E-commerce / Retail": {
    ctr: { avg: 1.32, top25: 2.1 },
    cpc: { avg: 0.83, top25: 0.55 },
    cpm: { avg: 11.54, top25: 8.2 },
    conversionRate: { avg: 2.8, top25: 4.5 },
    cpa: { avg: 29.67, top25: 18.0 },
    roas: { avg: 2.85, top25: 4.5 },
  },
  "Meta Ads|Conversions|SaaS / Technology": {
    ctr: { avg: 1.04, top25: 1.8 },
    cpc: { avg: 1.27, top25: 0.85 },
    cpm: { avg: 13.2, top25: 9.5 },
    conversionRate: { avg: 2.31, top25: 3.8 },
    cpa: { avg: 55.21, top25: 33.0 },
    roas: { avg: 2.1, top25: 3.5 },
  },
  "Meta Ads|Conversions|Finance / Insurance": {
    ctr: { avg: 0.88, top25: 1.5 },
    cpc: { avg: 3.77, top25: 2.4 },
    cpm: { avg: 33.18, top25: 22.0 },
    conversionRate: { avg: 1.85, top25: 3.2 },
    cpa: { avg: 81.45, top25: 48.0 },
    roas: { avg: 1.8, top25: 3.0 },
  },
  "Meta Ads|Conversions|Healthcare": {
    ctr: { avg: 0.83, top25: 1.4 },
    cpc: { avg: 1.32, top25: 0.88 },
    cpm: { avg: 10.96, top25: 7.8 },
    conversionRate: { avg: 2.44, top25: 4.0 },
    cpa: { avg: 44.38, top25: 26.0 },
    roas: { avg: 2.3, top25: 3.8 },
  },
  "Meta Ads|Conversions|Education": {
    ctr: { avg: 0.73, top25: 1.3 },
    cpc: { avg: 1.06, top25: 0.7 },
    cpm: { avg: 7.74, top25: 5.5 },
    conversionRate: { avg: 3.12, top25: 5.0 },
    cpa: { avg: 34.0, top25: 20.0 },
    roas: { avg: 2.5, top25: 4.0 },
  },
  "Meta Ads|Conversions|Real Estate": {
    ctr: { avg: 0.99, top25: 1.6 },
    cpc: { avg: 1.81, top25: 1.2 },
    cpm: { avg: 17.91, top25: 12.0 },
    conversionRate: { avg: 1.57, top25: 2.8 },
    cpa: { avg: 65.0, top25: 38.0 },
    roas: { avg: 1.6, top25: 2.8 },
  },
  "Meta Ads|Conversions|Fashion / Beauty": {
    ctr: { avg: 1.24, top25: 2.0 },
    cpc: { avg: 0.72, top25: 0.48 },
    cpm: { avg: 8.93, top25: 6.5 },
    conversionRate: { avg: 3.05, top25: 4.8 },
    cpa: { avg: 23.6, top25: 14.0 },
    roas: { avg: 3.2, top25: 5.2 },
  },
  "Meta Ads|Lead Generation|any": {
    ctr: { avg: 1.11, top25: 1.8 },
    cpc: { avg: 1.52, top25: 0.95 },
    cpm: { avg: 16.87, top25: 11.0 },
    conversionRate: { avg: 4.2, top25: 6.8 },
    cpa: { avg: 36.22, top25: 20.0 },
    roas: { avg: 2.4, top25: 4.0 },
  },
  "Meta Ads|Traffic|any": {
    ctr: { avg: 1.51, top25: 2.5 },
    cpc: { avg: 0.64, top25: 0.4 },
    cpm: { avg: 9.66, top25: 6.8 },
    conversionRate: { avg: 1.5, top25: 2.8 },
    cpa: { avg: 42.67, top25: 25.0 },
    roas: { avg: 1.8, top25: 3.0 },
  },
  "Meta Ads|Brand Awareness|any": {
    ctr: { avg: 0.85, top25: 1.4 },
    cpc: { avg: 0.48, top25: 0.3 },
    cpm: { avg: 6.5, top25: 4.5 },
    conversionRate: { avg: 0.8, top25: 1.5 },
    cpa: { avg: 60.0, top25: 35.0 },
    roas: { avg: 1.2, top25: 2.0 },
  },

  // -----------------------------------------------------------------------
  // Google Ads benchmarks
  // -----------------------------------------------------------------------
  "Google Ads|Conversions|E-commerce / Retail": {
    ctr: { avg: 2.69, top25: 4.2 },
    cpc: { avg: 1.16, top25: 0.75 },
    cpm: { avg: 31.2, top25: 22.0 },
    conversionRate: { avg: 2.81, top25: 4.5 },
    cpa: { avg: 45.27, top25: 28.0 },
    roas: { avg: 3.5, top25: 5.5 },
  },
  "Google Ads|Conversions|SaaS / Technology": {
    ctr: { avg: 2.09, top25: 3.5 },
    cpc: { avg: 3.8, top25: 2.5 },
    cpm: { avg: 79.42, top25: 55.0 },
    conversionRate: { avg: 2.35, top25: 3.8 },
    cpa: { avg: 86.14, top25: 52.0 },
    roas: { avg: 2.0, top25: 3.2 },
  },
  "Google Ads|Conversions|Finance / Insurance": {
    ctr: { avg: 2.91, top25: 4.5 },
    cpc: { avg: 3.44, top25: 2.2 },
    cpm: { avg: 100.1, top25: 70.0 },
    conversionRate: { avg: 5.1, top25: 7.8 },
    cpa: { avg: 81.93, top25: 48.0 },
    roas: { avg: 2.5, top25: 4.0 },
  },
  "Google Ads|Conversions|Healthcare": {
    ctr: { avg: 3.27, top25: 5.0 },
    cpc: { avg: 2.62, top25: 1.7 },
    cpm: { avg: 85.67, top25: 60.0 },
    conversionRate: { avg: 3.36, top25: 5.2 },
    cpa: { avg: 78.09, top25: 45.0 },
    roas: { avg: 2.2, top25: 3.5 },
  },
  "Google Ads|Conversions|Legal Services": {
    ctr: { avg: 2.93, top25: 4.5 },
    cpc: { avg: 6.75, top25: 4.2 },
    cpm: { avg: 197.78, top25: 140.0 },
    conversionRate: { avg: 6.98, top25: 10.0 },
    cpa: { avg: 86.02, top25: 50.0 },
    roas: { avg: 3.0, top25: 5.0 },
  },
  "Google Ads|Lead Generation|any": {
    ctr: { avg: 2.41, top25: 3.8 },
    cpc: { avg: 2.69, top25: 1.7 },
    cpm: { avg: 64.83, top25: 45.0 },
    conversionRate: { avg: 3.75, top25: 6.0 },
    cpa: { avg: 53.52, top25: 30.0 },
    roas: { avg: 2.8, top25: 4.5 },
  },
  "Google Ads|Traffic|any": {
    ctr: { avg: 3.17, top25: 5.0 },
    cpc: { avg: 1.72, top25: 1.1 },
    cpm: { avg: 54.52, top25: 38.0 },
    conversionRate: { avg: 2.0, top25: 3.5 },
    cpa: { avg: 60.0, top25: 35.0 },
    roas: { avg: 2.0, top25: 3.2 },
  },

  // -----------------------------------------------------------------------
  // TikTok Ads benchmarks
  // -----------------------------------------------------------------------
  "TikTok Ads|Conversions|any": {
    ctr: { avg: 0.84, top25: 1.5 },
    cpc: { avg: 1.0, top25: 0.65 },
    cpm: { avg: 8.4, top25: 6.0 },
    conversionRate: { avg: 1.8, top25: 3.0 },
    cpa: { avg: 42.0, top25: 25.0 },
    roas: { avg: 2.2, top25: 3.5 },
  },
  "TikTok Ads|Traffic|any": {
    ctr: { avg: 1.1, top25: 1.9 },
    cpc: { avg: 0.58, top25: 0.35 },
    cpm: { avg: 6.38, top25: 4.5 },
    conversionRate: { avg: 1.2, top25: 2.2 },
    cpa: { avg: 48.33, top25: 28.0 },
    roas: { avg: 1.5, top25: 2.5 },
  },

  // -----------------------------------------------------------------------
  // LinkedIn Ads benchmarks
  // -----------------------------------------------------------------------
  "LinkedIn Ads|Lead Generation|any": {
    ctr: { avg: 0.44, top25: 0.8 },
    cpc: { avg: 5.26, top25: 3.5 },
    cpm: { avg: 23.14, top25: 16.0 },
    conversionRate: { avg: 6.1, top25: 9.0 },
    cpa: { avg: 75.0, top25: 45.0 },
    roas: { avg: 1.8, top25: 3.0 },
  },
  "LinkedIn Ads|Brand Awareness|any": {
    ctr: { avg: 0.35, top25: 0.65 },
    cpc: { avg: 3.5, top25: 2.2 },
    cpm: { avg: 12.25, top25: 8.5 },
    conversionRate: { avg: 2.0, top25: 3.5 },
    cpa: { avg: 120.0, top25: 70.0 },
    roas: { avg: 1.2, top25: 2.0 },
  },

  // -----------------------------------------------------------------------
  // Catch-all fallback
  // -----------------------------------------------------------------------
  "any|any|any": {
    ctr: { avg: 1.5, top25: 2.5 },
    cpc: { avg: 1.5, top25: 0.9 },
    cpm: { avg: 15.0, top25: 10.0 },
    conversionRate: { avg: 2.5, top25: 4.0 },
    cpa: { avg: 50.0, top25: 30.0 },
    roas: { avg: 2.5, top25: 4.0 },
  },
};

/**
 * Look up benchmarks with graceful fallback:
 * 1. Exact match: platform|objective|industry
 * 2. Wildcard industry: platform|objective|any
 * 3. Wildcard objective: platform|any|any
 * 4. Global fallback: any|any|any
 */
export function getBenchmarks(
  platform: string,
  objective: string,
  industry: string
): BenchmarkEntry {
  // Normalize objective to match keys (e.g. "Lead Generation" matches both)
  const normalizedObjective = normalizeObjective(objective);

  const keys = [
    `${platform}|${normalizedObjective}|${industry}`,
    `${platform}|${normalizedObjective}|any`,
    `${platform}|any|any`,
    "any|any|any",
  ];

  for (const key of keys) {
    if (BENCHMARK_DB[key]) return BENCHMARK_DB[key];
  }

  return BENCHMARK_DB["any|any|any"];
}

function normalizeObjective(objective: string): string {
  const map: Record<string, string> = {
    "Traffic": "Traffic",
    "Conversions": "Conversions",
    "Lead Generation": "Lead Generation",
    "Brand Awareness": "Brand Awareness",
    "Catalog Sales": "Conversions",
    "App Installs": "Conversions",
    "Video Views": "Brand Awareness",
  };
  return map[objective] ?? objective;
}

export type { BenchmarkEntry };
