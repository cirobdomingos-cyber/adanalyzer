// ---------------------------------------------------------------------------
// Shared types used across client and server
// ---------------------------------------------------------------------------

export interface Metrics {
  platform: string;
  objective: string;
  industry: string;
  investment: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
  conversions: string;
  cpa: string;
  roas: string;
  adContext: string;
}

export const EMPTY_METRICS: Metrics = {
  platform: "",
  objective: "",
  industry: "",
  investment: "",
  impressions: "",
  clicks: "",
  ctr: "",
  cpc: "",
  cpm: "",
  conversions: "",
  cpa: "",
  roas: "",
  adContext: "",
};

export const METRIC_LABELS: Record<keyof Metrics, string> = {
  platform: "Platform",
  objective: "Campaign Objective",
  industry: "Industry / Vertical",
  investment: "Total Spend (USD)",
  impressions: "Impressions",
  clicks: "Clicks",
  ctr: "CTR (%)",
  cpc: "CPC (USD)",
  cpm: "CPM (USD)",
  conversions: "Conversions",
  cpa: "CPA (USD)",
  roas: "ROAS",
  adContext: "Ad Context",
};

// Required fields for form validation
export const REQUIRED_METRIC_KEYS: (keyof Metrics)[] = [
  "platform",
  "objective",
  "industry",
  "investment",
  "impressions",
  "clicks",
];

// ---------------------------------------------------------------------------
// Platform & objective options
// ---------------------------------------------------------------------------

export const PLATFORMS = ["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads"] as const;

export const OBJECTIVES = [
  "Traffic",
  "Conversions",
  "Lead Generation",
  "Brand Awareness",
  "Catalog Sales",
  "App Installs",
  "Video Views",
] as const;

export const INDUSTRIES = [
  "E-commerce / Retail",
  "SaaS / Technology",
  "Finance / Insurance",
  "Healthcare",
  "Education",
  "Real Estate",
  "Travel / Hospitality",
  "Food & Beverage",
  "Automotive",
  "B2B Services",
  "Fashion / Beauty",
  "Entertainment / Media",
  "Legal Services",
  "Home Services",
  "Fitness / Wellness",
  "Other",
] as const;

// ---------------------------------------------------------------------------
// Structured analysis output from Claude
// ---------------------------------------------------------------------------

export interface ScoreDimension {
  score: number; // 0-100
  summary: string;
}

export interface BenchmarkComparison {
  metric: string;
  yours: number | null;
  industryAvg: number;
  top25: number;
  verdict: "above" | "at" | "below";
}

export interface CreativeVariation {
  title: string;
  description: string;
}

export interface AnalysisResult {
  overallScore: number;
  verdict: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  scores: {
    hookStrength: ScoreDimension;
    visualClarity: ScoreDimension;
    ctaEffectiveness: ScoreDimension;
    copyVisualAlignment: ScoreDimension;
    audienceRelevance: ScoreDimension;
  };
  diagnosis: string;
  strengths: string[];
  weaknesses: string[];
  visualAnalysis: string;
  variations: CreativeVariation[];
  benchmarks: BenchmarkComparison[];
}

// ---------------------------------------------------------------------------
// Analysis history
// ---------------------------------------------------------------------------

export interface AnalysisHistoryEntry {
  id: string;
  timestamp: number;
  platform: string;
  objective: string;
  industry: string;
  overallScore: number;
  verdict: string;
  metrics: Partial<Metrics>;
  analysis: AnalysisResult;
  imagePreviewDataUrl?: string; // small thumbnail stored as data URL
}
