/**
 * lib/scoring/value.ts  — Value factor (weight ~20%)
 *
 * Formula
 * ───────
 * Four sub-scores, each 0-100, combined with weights:
 *   PE ratio vs sector median  35%
 *   Price/Book (PB)            25%
 *   EV/EBITDA                  25%
 *   FCF yield (1/PFCF)         15%
 *
 * PE scoring: ratio = PE / sectorMedianPE
 *   ≤ 0.6  → 95   (trading at deep discount to sector)
 *   ≤ 0.8  → 80
 *   ≤ 1.0  → 65   (in-line with sector)
 *   ≤ 1.25 → 45
 *   ≤ 1.5  → 30
 *   > 1.5  → 15   (significant premium)
 *
 * PB scoring:
 *   < 1    → 90
 *   < 2    → 75
 *   < 3    → 60
 *   < 5    → 40
 *   ≥ 5    → 20
 *
 * EV/EBITDA scoring:
 *   < 8    → 90
 *   < 12   → 75
 *   < 18   → 55
 *   < 25   → 35
 *   ≥ 25   → 15
 *
 * FCF yield = 1 / PFCF × 100 (%)
 *   > 10%  → 90
 *   > 7%   → 75
 *   > 5%   → 60
 *   > 3%   → 40
 *   ≤ 3%   → 20
 */

import type { FinnhubMetrics } from "./finnhub-metrics";
import type { FactorScore } from "@/lib/types";

// Sector P/E medians — conservative Canadian market estimates
const SECTOR_PE: Record<string, number> = {
  "Canadian Banks":          12,
  "Canadian Energy":         14,
  "Canadian Telecom":        16,
  "Utilities":               17,
  "Canadian Utilities":      17,
  "Canadian REITs":          22,
  "REITs":                   22,
  "Precious Metals":         28,
  "Technology":              32,
  "Consumer Discretionary":  20,
  "Healthcare":              24,
  "Industrials":             19,
  "Materials":               16,
  "Financials":              14,
};
const DEFAULT_PE = 18;

function sectorMedianPE(sectorLabel: string): number {
  for (const [key, median] of Object.entries(SECTOR_PE)) {
    if (sectorLabel.toLowerCase().includes(key.toLowerCase())) return median;
  }
  return DEFAULT_PE;
}

function piecewise(value: number, thresholds: [number, number][]): number {
  for (const [threshold, score] of thresholds) {
    if (value <= threshold) return score;
  }
  return thresholds[thresholds.length - 1][1];
}

export function computeValue(
  metrics: FinnhubMetrics,
  sectorLabel: string
): FactorScore {
  const pe      = metrics.peNormalizedAnnual;
  const pb      = metrics.pbAnnual;
  const evEbitda = metrics.evEbitdaTTM;
  const pfcf    = metrics.pfcfShareTTM ?? metrics.pfcfShareAnnual;

  const available = [pe, pb, evEbitda, pfcf].filter(
    (v) => v != null && v > 0 && isFinite(v)
  ).length;

  if (available === 0) {
    return { value: null, label: "N/A", insufficient: true, overridden: false };
  }

  const scores: number[] = [];
  const weights: number[] = [];

  if (pe != null && pe > 0 && isFinite(pe)) {
    const median = sectorMedianPE(sectorLabel);
    const ratio  = pe / median;
    const s = piecewise(ratio, [[0.6, 95],[0.8, 80],[1.0, 65],[1.25, 45],[1.5, 30],[Infinity, 15]]);
    scores.push(s); weights.push(0.35);
  }

  if (pb != null && pb > 0 && isFinite(pb)) {
    const s = piecewise(pb, [[1, 90],[2, 75],[3, 60],[5, 40],[Infinity, 20]]);
    scores.push(s); weights.push(0.25);
  }

  if (evEbitda != null && evEbitda > 0 && isFinite(evEbitda)) {
    const s = piecewise(evEbitda, [[8, 90],[12, 75],[18, 55],[25, 35],[Infinity, 15]]);
    scores.push(s); weights.push(0.25);
  }

  if (pfcf != null && pfcf > 0 && isFinite(pfcf)) {
    const fcfYield = (1 / pfcf) * 100;
    const s = piecewise(-fcfYield, [[-10, 90],[-7, 75],[-5, 60],[-3, 40],[Infinity, 20]]);
    scores.push(s); weights.push(0.15);
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weighted    = scores.reduce((sum, s, i) => sum + s * weights[i], 0) / totalWeight;
  const final       = Math.round(weighted);

  return { value: final, label: String(final), insufficient: false, overridden: false };
}
