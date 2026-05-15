/**
 * lib/scoring/index.ts
 *
 * Two entry points:
 *
 *   computeScore(stockFile, metrics, stockCandles, indexCandles)
 *     Full computation from Finnhub data — used by scripts/score.mjs.
 *
 *   buildScore(overrides?, snapshot?)
 *     Lightweight version for the Next.js page — reads the pre-computed
 *     scoreSnapshot from Sanity (Phase 3 caching) and overlays any
 *     editor overrides on top.
 */

import type { ScoreOverrides, StockScore, FactorScore } from "@/lib/types";
import type { FinnhubMetrics, Candle } from "./finnhub-metrics";
import { computeValue }          from "./value";
import { computeGrowth }         from "./growth";
import { computeQuality }        from "./quality";
import { computeDividendSafety } from "./dividend-safety";
import { computeMomentum }       from "./momentum";
import { computeTaxEfficiency }  from "./tax-efficiency";

export type { FinnhubMetrics, Candle };

// ---------------------------------------------------------------------------
// Weights
// ---------------------------------------------------------------------------

const WEIGHTS = {
  value:          0.20,
  growth:         0.20,
  quality:        0.20,
  dividendSafety: 0.15,
  momentum:       0.10,
  taxEfficiency:  0.15,
} as const;

type FactorKey = keyof typeof WEIGHTS;
const FACTOR_KEYS = Object.keys(WEIGHTS) as FactorKey[];

// ---------------------------------------------------------------------------
// Overall score from factor scores
// ---------------------------------------------------------------------------

function overallFromFactors(factors: StockScore["factors"]): number | null {
  let weightedSum = 0;
  let weightUsed  = 0;
  for (const k of FACTOR_KEYS) {
    const f = factors[k];
    if (!f.insufficient && f.value !== null) {
      weightedSum += f.value * WEIGHTS[k];
      weightUsed  += WEIGHTS[k];
    }
  }
  return weightUsed > 0 ? Math.round(weightedSum / weightUsed) : null;
}

// ---------------------------------------------------------------------------
// computeScore — called by scripts/score.mjs only
// ---------------------------------------------------------------------------

interface TaxInputs {
  exchange: string;
  sectorLabel: string;
  dividendYield?: number;
}

export function computeScore(
  taxInputs: TaxInputs,
  metrics: FinnhubMetrics,
  stockCandles: Candle[],
  indexCandles: Candle[]
): StockScore {
  const factors: StockScore["factors"] = {
    value:          computeValue(metrics, taxInputs.sectorLabel),
    growth:         computeGrowth(metrics),
    quality:        computeQuality(metrics, taxInputs.sectorLabel),
    dividendSafety: computeDividendSafety(metrics),
    momentum:       computeMomentum(metrics, stockCandles, indexCandles),
    taxEfficiency:  computeTaxEfficiency({
      exchange:      taxInputs.exchange,
      sectorLabel:   taxInputs.sectorLabel,
      dividendYield: metrics.dividendYieldIndicatedAnnual ?? metrics.currentDividendYieldTTM,
    }),
  };

  const overall     = overallFromFactors(factors);
  const insufficient = FACTOR_KEYS.some((k) => factors[k].insufficient);

  return { overall, insufficient, factors };
}

// ---------------------------------------------------------------------------
// buildScore — called by Next.js pages
// Merges a cached snapshot with any editor overrides.
// ---------------------------------------------------------------------------

interface SnapshotScores {
  value?: number | null;
  growth?: number | null;
  quality?: number | null;
  dividendSafety?: number | null;
  momentum?: number | null;
  taxEfficiency?: number | null;
}

interface SnapshotInsufficient {
  value?: boolean;
  growth?: boolean;
  quality?: boolean;
  dividendSafety?: boolean;
  momentum?: boolean;
}

export function buildScore(
  overrides?: ScoreOverrides,
  snapshot?: { scores?: SnapshotScores; insufficient?: SnapshotInsufficient }
): StockScore {
  function resolve(key: FactorKey): FactorScore {
    const ov = overrides?.[key as keyof ScoreOverrides];
    if (ov !== undefined && ov !== null) {
      return { value: ov, label: String(Math.round(ov)), insufficient: false, overridden: true };
    }
    const snap      = snapshot?.scores?.[key as keyof SnapshotScores];
    const insuf     = snapshot?.insufficient?.[key as keyof SnapshotInsufficient] ?? true;
    if (snap !== undefined && snap !== null && isFinite(snap)) {
      return { value: Math.round(snap), label: String(Math.round(snap)), insufficient: false, overridden: false };
    }
    return { value: null, label: "N/A", insufficient: insuf, overridden: false };
  }

  const factors: StockScore["factors"] = {
    value:          resolve("value"),
    growth:         resolve("growth"),
    quality:        resolve("quality"),
    dividendSafety: resolve("dividendSafety"),
    momentum:       resolve("momentum"),
    taxEfficiency:  resolve("taxEfficiency"),
  };

  const overall     = overallFromFactors(factors);
  const insufficient = FACTOR_KEYS.some((k) => factors[k].insufficient);

  return { overall, insufficient, factors };
}
