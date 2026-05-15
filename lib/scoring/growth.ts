/**
 * lib/scoring/growth.ts  — Growth factor (weight ~20%)
 *
 * Formula
 * ───────
 * Three sub-scores combined with weights:
 *   Revenue 3yr CAGR        40%
 *   EPS 3yr CAGR            35%
 *   Quarterly YoY revenue   25%  (proxy for forward momentum)
 *
 * Scoring scale for each (% annual growth):
 *   > 20%  → 95
 *   > 15%  → 85
 *   > 10%  → 72
 *   > 5%   → 58
 *   > 0%   → 45
 *   > -5%  → 30
 *   ≤ -5%  → 15
 *
 * Note: Finnhub reports `revenueGrowthQuarterlyYoy` in %, already annualised basis.
 * Extreme values (> 200%) are capped — acquisitions can spike this non-organically.
 */

import type { FinnhubMetrics } from "./finnhub-metrics";
import type { FactorScore } from "@/lib/types";

function growthScore(pct: number): number {
  const capped = Math.min(pct, 200);
  if (capped > 20)  return 95;
  if (capped > 15)  return 85;
  if (capped > 10)  return 72;
  if (capped > 5)   return 58;
  if (capped > 0)   return 45;
  if (capped > -5)  return 30;
  return 15;
}

export function computeGrowth(metrics: FinnhubMetrics): FactorScore {
  const rev3Y    = metrics.revenueGrowth3Y;
  const eps3Y    = metrics.epsGrowth3Y;
  const revQYoy  = metrics.revenueGrowthQuarterlyYoy;

  const available = [rev3Y, eps3Y, revQYoy].filter(
    (v) => v != null && isFinite(v)
  ).length;

  if (available === 0) {
    return { value: null, label: "N/A", insufficient: true, overridden: false };
  }

  const scores:  number[] = [];
  const weights: number[] = [];

  if (rev3Y != null && isFinite(rev3Y))   { scores.push(growthScore(rev3Y));   weights.push(0.40); }
  if (eps3Y != null && isFinite(eps3Y))   { scores.push(growthScore(eps3Y));   weights.push(0.35); }
  if (revQYoy != null && isFinite(revQYoy)) { scores.push(growthScore(revQYoy)); weights.push(0.25); }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weighted    = scores.reduce((sum, s, i) => sum + s * weights[i], 0) / totalWeight;
  const final       = Math.round(weighted);

  return { value: final, label: String(final), insufficient: false, overridden: false };
}
