/**
 * lib/scoring/momentum.ts  — Momentum factor (weight ~10%)
 *
 * Formula
 * ───────
 * Three sub-scores combined with weights:
 *   6-month price return vs benchmark   35%
 *   12-month price return vs benchmark  35%
 *   50/200 DMA position                 30%
 *
 * Benchmark: TSX Composite (^GSPTSE) actual return from candle data.
 * Fallback if GSPTSE candles unavailable: 4% 6M / 8% 12M (TSX long-run avg).
 *
 * Excess-return scoring (stock return minus benchmark return, in %):
 *   > +15pp → 95
 *   > +8pp  → 82
 *   > +3pp  → 68
 *   > 0pp   → 55  (in-line)
 *   > -5pp  → 42
 *   > -10pp → 28
 *   ≤ -10pp → 15
 *
 * DMA position scoring:
 *   Price > 50DMA  AND  50DMA > 200DMA  → 90  (confirmed uptrend)
 *   Price > 50DMA  AND  50DMA ≤ 200DMA  → 60  (recent bounce in downtrend)
 *   Price ≤ 50DMA  AND  price > 200DMA  → 45  (short-term weakness)
 *   Price ≤ 50DMA  AND  price ≤ 200DMA  → 20  (confirmed downtrend)
 *   Insufficient candle data            → null
 */

import type { FinnhubMetrics } from "./finnhub-metrics";
import type { Candle } from "./finnhub-metrics";
import type { FactorScore } from "@/lib/types";

const FALLBACK_BENCHMARK_6M  =  4;  // % TSX 6-month approximation
const FALLBACK_BENCHMARK_12M =  8;  // % TSX 12-month approximation

function sma(candles: Candle[], period: number): number | null {
  if (candles.length < period) return null;
  const slice = candles.slice(-period);
  return slice.reduce((s, c) => s + c.c, 0) / period;
}

function candleReturn(candles: Candle[], daysBack: number): number | null {
  if (candles.length < daysBack + 1) return null;
  const recent = candles[candles.length - 1].c;
  const past   = candles[candles.length - 1 - daysBack]?.c;
  if (!past || past === 0) return null;
  return ((recent - past) / past) * 100;
}

function excessReturnScore(excess: number): number {
  if (excess > 15)  return 95;
  if (excess > 8)   return 82;
  if (excess > 3)   return 68;
  if (excess > 0)   return 55;
  if (excess > -5)  return 42;
  if (excess > -10) return 28;
  return 15;
}

function dmaScore(candles: Candle[]): number | null {
  const sma50  = sma(candles, 50);
  const sma200 = sma(candles, 200);
  if (!sma50 || !sma200 || candles.length === 0) return null;
  const price = candles[candles.length - 1].c;
  if (price > sma50  && sma50  > sma200) return 90;
  if (price > sma50  && sma50 <= sma200) return 60;
  if (price <= sma50 && price  > sma200) return 45;
  return 20;
}

export function computeMomentum(
  metrics: FinnhubMetrics,
  stockCandles: Candle[],
  indexCandles: Candle[]  // ^GSPTSE daily candles, may be empty
): FactorScore {
  const ret6M  = metrics["26WeekPriceReturnDaily"];
  const ret12M = metrics["52WeekPriceReturnDaily"];

  // Compute benchmark returns from candles or use fallback
  const benchmark6M  = candleReturn(indexCandles, 126) ?? FALLBACK_BENCHMARK_6M;
  const benchmark12M = candleReturn(indexCandles, 252) ?? FALLBACK_BENCHMARK_12M;

  const dma = dmaScore(stockCandles);

  const available = [ret6M, ret12M].filter(
    (v) => v != null && isFinite(v)
  ).length;

  if (available === 0 && dma === null) {
    return { value: null, label: "N/A", insufficient: true, overridden: false };
  }

  const scores:  number[] = [];
  const weights: number[] = [];

  if (ret6M  != null && isFinite(ret6M))  {
    scores.push(excessReturnScore(ret6M  - benchmark6M));  weights.push(0.35);
  }
  if (ret12M != null && isFinite(ret12M)) {
    scores.push(excessReturnScore(ret12M - benchmark12M)); weights.push(0.35);
  }
  if (dma !== null) { scores.push(dma); weights.push(0.30); }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weighted    = scores.reduce((sum, s, i) => sum + s * weights[i], 0) / totalWeight;
  const final       = Math.round(weighted);

  return { value: final, label: String(final), insufficient: false, overridden: false };
}
