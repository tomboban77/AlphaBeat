/**
 * lib/scoring/quality.ts  — Quality factor (weight ~20%)
 *
 * Formula
 * ───────
 * Four sub-scores combined with weights:
 *   ROE (return on equity)         30%
 *   ROIC (return on inv. capital)  30%
 *   Debt/equity ratio              20%  — banks capped (structural leverage)
 *   Net profit margin              20%
 *
 * ROE / ROIC scoring (%):
 *   > 25%  → 95
 *   > 18%  → 82
 *   > 12%  → 68
 *   > 6%   → 50
 *   > 0%   → 32
 *   ≤ 0%   → 12
 *
 * Debt/Equity scoring:
 *   For non-banks:
 *     < 0.3  → 95  < 0.5  → 82  < 1.0  → 65  < 2.0  → 45  ≥ 2.0  → 25
 *   For sectorLabels containing "Bank" or "Financial":
 *     < 5    → 70  < 10   → 55  < 15   → 40  ≥ 15   → 30
 *   (Banks structurally lever deposits — high D/E is normal, not a red flag)
 *
 * Net profit margin (%):
 *   > 25%  → 95
 *   > 15%  → 80
 *   > 8%   → 65
 *   > 3%   → 48
 *   > 0%   → 32
 *   ≤ 0%   → 12
 */

import type { FinnhubMetrics } from "./finnhub-metrics";
import type { FactorScore } from "@/lib/types";

function roScore(pct: number): number {
  if (pct > 25) return 95;
  if (pct > 18) return 82;
  if (pct > 12) return 68;
  if (pct > 6)  return 50;
  if (pct > 0)  return 32;
  return 12;
}

function deScore(de: number, isBank: boolean): number {
  if (isBank) {
    if (de < 5)  return 70;
    if (de < 10) return 55;
    if (de < 15) return 40;
    return 30;
  }
  if (de < 0.3) return 95;
  if (de < 0.5) return 82;
  if (de < 1.0) return 65;
  if (de < 2.0) return 45;
  return 25;
}

function marginScore(pct: number): number {
  if (pct > 25) return 95;
  if (pct > 15) return 80;
  if (pct > 8)  return 65;
  if (pct > 3)  return 48;
  if (pct > 0)  return 32;
  return 12;
}

export function computeQuality(
  metrics: FinnhubMetrics,
  sectorLabel: string
): FactorScore {
  const roe    = metrics.roeTTM;
  const roic   = metrics.roiTTM;
  const de     = metrics["totalDebt/totalEquityAnnual"] ?? metrics["totalDebt/totalEquityQuarterly"];
  const margin = metrics.netProfitMarginTTM ?? metrics.grossMarginTTM;

  const available = [roe, roic, de, margin].filter(
    (v) => v != null && isFinite(v)
  ).length;

  if (available === 0) {
    return { value: null, label: "N/A", insufficient: true, overridden: false };
  }

  const isBank = /bank|financial/i.test(sectorLabel);
  const scores:  number[] = [];
  const weights: number[] = [];

  if (roe  != null && isFinite(roe))    { scores.push(roScore(roe));           weights.push(0.30); }
  if (roic != null && isFinite(roic))   { scores.push(roScore(roic));          weights.push(0.30); }
  if (de   != null && isFinite(de) && de >= 0) { scores.push(deScore(de, isBank)); weights.push(0.20); }
  if (margin != null && isFinite(margin)) { scores.push(marginScore(margin));  weights.push(0.20); }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weighted    = scores.reduce((sum, s, i) => sum + s * weights[i], 0) / totalWeight;
  const final       = Math.round(weighted);

  return { value: final, label: String(final), insufficient: false, overridden: false };
}
