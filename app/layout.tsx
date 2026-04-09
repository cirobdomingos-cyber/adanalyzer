import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AdAnalyzer — AI-Powered Ad Creative Analysis",
  description:
    "Analyze your Meta Ads, Google Ads, TikTok, and LinkedIn ad creatives with AI. Get a creative scorecard, industry benchmarks, and actionable recommendations in seconds.",
  openGraph: {
    title: "AdAnalyzer — AI-Powered Ad Creative Analysis",
    description:
      "Upload your ad creative + campaign metrics. Get a diagnostic report with scores, benchmarks, and specific recommendations to improve performance.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
