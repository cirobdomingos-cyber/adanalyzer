# AdAnalyzer

**AI-powered ad creative diagnostics.** Upload your ad creative image + campaign metrics, get a structured analysis with scores, industry benchmarks, and specific recommendations to improve performance.

## The Problem

Paid media professionals spend thousands per day on ads but lack a fast, systematic way to diagnose **why** a creative is underperforming. Platform dashboards show numbers — they don't explain the creative.

Every competitor either analyzes metrics without looking at the ad (Motion), saves other people's ads for inspiration (Foreplay), or generates new creatives without diagnosing yours (AdCreative.ai).

**AdAnalyzer is the creative doctor.** It actually looks at your image, reads the copy, evaluates the CTA, and correlates everything with your metrics against real industry benchmarks.

## What You Get

| Section | What It Tells You |
|---|---|
| **Creative Scorecard** | Overall score (0–100) + 5 dimension scores: Hook Strength, Visual Clarity, CTA Effectiveness, Copy-Visual Alignment, Audience Relevance |
| **Benchmark Comparison** | Your CTR, CPC, CPM, CPA, ROAS vs. industry averages and top 25% performers — by platform, objective, and vertical |
| **Strengths & Weaknesses** | Specific bullet points on what to keep and what to fix |
| **Visual Analysis** | What the image communicates: composition, colors, text density, emotional tone, product visibility |
| **Creative Variations** | 3 concrete new creative concepts to test — not vague advice, specific changes |
| **Full Diagnosis** | 2–3 paragraph expert assessment connecting the creative to the metrics |

## Stack

- **Next.js 15** (App Router) — full-stack React framework
- **TypeScript** — end-to-end type safety
- **Tailwind CSS** — utility-first styling with custom design tokens
- **Claude Sonnet** with vision (Anthropic API) — multimodal creative analysis
- **Streaming responses** — progressive loading, not a 30-second spinner
- **Real benchmark database** — sourced from WordStream, Triple Whale, EvenDigit (2025–2026)

## Supported Platforms

- Meta Ads
- Google Ads
- TikTok Ads
- LinkedIn Ads

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

```bash
cp .env.example .env.local
```

Add your Anthropic API key to `.env.local`. Get one at [console.anthropic.com](https://console.anthropic.com/).

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### No API key?

Click **Load demo** to explore the UI with pre-built test scenarios. No API calls needed.

## Architecture

```
app/
├── api/analyze/route.ts    # API route: streaming Claude Vision + benchmark engine
├── components/
│   ├── AnalysisLoading.tsx  # Animated progress steps during analysis
│   ├── AnalysisReport.tsx   # Full report layout (score card + sections)
│   ├── BenchmarkTable.tsx   # Industry benchmark comparison table
│   ├── HistoryPanel.tsx     # Collapsible recent analyses panel
│   ├── ImageUpload.tsx      # Drag-and-drop image upload
│   ├── MetricsForm.tsx      # Campaign metrics input form
│   └── ScoreCard.tsx        # Visual score ring + dimension breakdown
├── lib/
│   ├── benchmarks.ts        # Real benchmark data by platform × objective × industry
│   ├── history.ts           # localStorage persistence for analysis history
│   ├── rate-limit.ts        # In-memory sliding window rate limiter
│   └── types.ts             # Shared types, constants, interfaces
├── globals.css
├── layout.tsx
└── page.tsx                 # Main app: form → analysis → report flow
```

## Security

- Server-side API key — never exposed to the client
- Rate limiting: 15 requests/minute per IP
- Server-side file size validation (10MB max)
- Metrics schema validation (whitelist keys, cap lengths)
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

## Deploy (Vercel)

```bash
vercel deploy
```

Add `ANTHROPIC_API_KEY` to your Vercel project environment variables.

## License

MIT
