/**
 * lib/scoring/dividend-safety.ts  — Dividend Safety factor (weight ~15%)
 *
 * Formula
 * ───────
 * Three sub-scores + one penalty, combined with weights:
 *   Payout ratio               35%
 *   Dividend growth rate (5Y)  35%
 *   FCF coverage (1/PFCF)      30%
 *
 * Plus: yield-too-high penalty — if indicated annual yield > 10%, subtract 20
 * from the final score (capped at 0). Signals potential dividend trap.
 *
 * If no dividend is paid: return 50 neutral (neither good nor bad).
 *
 * Payout ratio (%):
 *   20–50% → 95  (sustainable, room to grow)
 *   50–65% → 78  (moderate, still healthy)
 *   65–80% → 55  (elevated, watchlist territory)
 *   80–90% → 35  (high risk of cut)
 *   > 90%  → 15  (danger zone)
 *   0%     → 50  (no dividend)
 *
 * Dividend growth 5Y (% per year):
 *   > 10%  → 95
 *   > 7%   → 82
 *   > 5%   → 70
 *   > 3%   → 57
 *   > 0%   → 44
 *   ≤ 0%   → 22  (cut or flat)
 *
 * FCF coverage: score based on FCF yield (1/PFCF × 100):
 *   > 10% FCF yield → 95  (strong FCF support)
 *   > 7%            → 80
 *   > 5%            → 65
 *   > 3%            → 45
 *   ≤ 3%            → 25
 */

import type { FinnhubMetrics } from "./finnhub-metrics";
import type { FactorScore } from "@/lib/types";

function payoutScore(ratio: number): number {
  if (ratio === 0)  return 50;
  if (ratio <= 50)  return 95;
  if (ratio <= 65)  return 78;
  if (ratio <= 80)  return 55;
  if (ratio <= 90)  return 35;
  return 15;
}

function growthScore(pct: number): number {
  if (pct > 10) return 95;
  if (pct > 7)  return 82;
  if (pct > 5)  return 70;
  if (pct > 3)  return 57;
  if (pct > 0)  return 44;
  return 22;
}

function fcfCoverageScore(pfcf: number): number {
  const fcfYield = (1 / pfcf) * 100;
  if (fcfYield > 10) return 95;
  if (fcfYield > 7)  return 80;
  if (fcfYield > 5)  return 65;
  if (fcfYield > 3)  return 45;
  return 25;
}

export function computeDividendSafety(metrics: FinnhubMetrics): FactorScore {
  const yield_  = metrics.dividendYieldIndicatedAnnual ?? metrics.currentDividendYieldTTM ?? 0;
  const payout  = metrics.payoutRatioAnnual ?? metrics.payoutRatioTTM;
  const growth5Y = metrics.dividendGrowthRate5Y;
  const pfcf    = metrics.pfcfShareTTM ?? metrics.pfcfShareAnnual;

  // No dividend — neutral score
  if (!yield_ || yield_ <= 0) {
    return { value: 50, label: "50", insufficient: false, overridden: false };
  }

  const available = [payout, growth5Y, pfcf].filter(
    (v) => v != null && isFinite(v)
  ).length;

  if (available === 0) {
    return { value: null, label: "N/A", insufficient: true, overridden: false };
  }

  const scores:  number[] = [];
  const weights: number[] = [];

  if (payout != null && isFinite(payout) && payout >= 0) {
    scores.push(payoutScore(payout)); weights.push(0.35);
  }
  if (growth5Y != null && isFinite(growth5Y)) {
    scores.push(growthScore(growth5Y)); weights.push(0.35);
  }
  if (pfcf != null && isFinite(pfcf) && pfcf > 0) {
    scores.push(fcfCoverageScore(pfcf)); weights.push(0.30);
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let weighted = scores.reduce((sum, s, i) => sum + s * weights[i], 0) / totalWeight;

  // Yield-too-high penalty
  if (yield_ > 10) weighted = Math.max(0, weighted - 20);

  const final = Math.round(weighted);
  return { value: final, label: String(final), insufficient: false, overridden: false };
}
