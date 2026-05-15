/**
 * lib/rankings/auto-rank.ts
 *
 * Given a category and account focus, returns Stock Files sorted by
 * the factors most relevant to that category — giving Tom a starting
 * rank order that he can override in the Studio.
 *
 * Factor weights by category:
 *   dividend-stocks  → Dividend Safety 40%, Tax Efficiency 25%, Value 20%, Quality 15%
 *   growth-stocks    → Growth 40%, Momentum 30%, Quality 20%, Value 10%
 *   bank-stocks      → Quality 35%, Dividend Safety 30%, Value 25%, Growth 10%
 *   precious-metals  → Momentum 40%, Tax Efficiency 30%, Value 20%, Quality 10%
 *   reit-stocks      → Dividend Safety 40%, Tax Efficiency 30%, Value 20%, Quality 10%
 *   etfs             → Not scored (ETFs skip the score engine)
 *   under-20         → Growth 35%, Momentum 30%, Value 25%, Quality 10%
 *   under-40         → Growth 35%, Momentum 25%, Value 25%, Quality 15%
 */

import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";
import type { RankedListCategory } from "@/lib/types";

interface StockWithScores {
  _id: string;
  ticker: string;
  companyName: string;
  sectorLabel: string;
  slug: { current: string };
  snapshot?: {
    scores?: {
      value?: number | null;
      growth?: number | null;
      quality?: number | null;
      dividendSafety?: number | null;
      momentum?: number | null;
      taxEfficiency?: number | null;
      overall?: number | null;
    };
  };
  compositeScore?: number;
}

type FactorKey = "value" | "growth" | "quality" | "dividendSafety" | "momentum" | "taxEfficiency";

const CATEGORY_WEIGHTS: Record<RankedListCategory, Partial<Record<FactorKey, number>>> = {
  "dividend-stocks": { dividendSafety: 0.40, taxEfficiency: 0.25, value: 0.20, quality: 0.15 },
  "growth-stocks":   { growth: 0.40, momentum: 0.30, quality: 0.20, value: 0.10 },
  "bank-stocks":     { quality: 0.35, dividendSafety: 0.30, value: 0.25, growth: 0.10 },
  "precious-metals": { momentum: 0.40, taxEfficiency: 0.30, value: 0.20, quality: 0.10 },
  "reit-stocks":     { dividendSafety: 0.40, taxEfficiency: 0.30, value: 0.20, quality: 0.10 },
  "etfs":            {},
  "under-20":        { growth: 0.35, momentum: 0.30, value: 0.25, quality: 0.10 },
  "under-40":        { growth: 0.35, momentum: 0.25, value: 0.25, quality: 0.15 },
};

const stocksWithSnapshotsQuery = groq`
  *[_type == "stockFile"] {
    _id, ticker, companyName, sectorLabel, slug,
    "snapshot": *[_type == "scoreSnapshot" && ticker == ^.ticker] | order(computedAt desc)[0] {
      scores { value, growth, quality, dividendSafety, momentum, taxEfficiency, overall }
    }
  }
`;

/**
 * Returns up to `limit` Stock Files sorted by composite score for the given category.
 * Stocks without snapshot data fall to the bottom (score = 0).
 */
export async function autoRank(
  category: RankedListCategory,
  limit = 10
): Promise<StockWithScores[]> {
  const weights = CATEGORY_WEIGHTS[category];
  if (!Object.keys(weights).length) return []; // ETFs — no scoring

  const stocks = await client
    .fetch<StockWithScores[]>(stocksWithSnapshotsQuery)
    .catch(() => [] as StockWithScores[]);

  const scored = stocks.map((s) => {
    const scores = s.snapshot?.scores;
    if (!scores) return { ...s, compositeScore: 0 };

    let wSum = 0, wUsed = 0;
    for (const [k, w] of Object.entries(weights) as [FactorKey, number][]) {
      const v = scores[k];
      if (v != null && isFinite(v)) { wSum += v * w; wUsed += w; }
    }

    return { ...s, compositeScore: wUsed > 0 ? Math.round(wSum / wUsed) : 0 };
  });

  return scored
    .sort((a, b) => (b.compositeScore ?? 0) - (a.compositeScore ?? 0))
    .slice(0, limit);
}
