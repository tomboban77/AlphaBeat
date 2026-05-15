/**
 * lib/scoring/finnhub-metrics.ts
 *
 * Fetches the full Finnhub /stock/metric?metric=all payload for a given symbol
 * and exposes a typed subset of the fields the scoring engine uses.
 *
 * Called from scripts/score.mjs (not from Next.js server routes — scores are
 * pre-computed and cached as scoreSnapshot documents in Sanity).
 */

const BASE = "https://finnhub.io/api/v1";

export interface FinnhubMetrics {
  // Value
  peNormalizedAnnual?: number;
  pbAnnual?: number;
  evEbitdaTTM?: number;
  pfcfShareTTM?: number;
  pfcfShareAnnual?: number;

  // Growth
  revenueGrowth3Y?: number;
  epsGrowth3Y?: number;
  revenueGrowthQuarterlyYoy?: number;
  epsGrowthQuarterlyYoy?: number;

  // Quality
  roeTTM?: number;
  roiTTM?: number;
  grossMarginTTM?: number;
  netProfitMarginTTM?: number;
  "totalDebt/totalEquityAnnual"?: number;
  "totalDebt/totalEquityQuarterly"?: number;

  // Dividend Safety
  payoutRatioAnnual?: number;
  payoutRatioTTM?: number;
  dividendYieldIndicatedAnnual?: number;
  currentDividendYieldTTM?: number;
  dividendGrowthRate5Y?: number;
  dividendIndicatedAnnual?: number;
  dividendPerShareAnnual?: number;

  // Momentum (returns in %)
  "13WeekPriceReturnDaily"?: number;
  "26WeekPriceReturnDaily"?: number;
  "52WeekPriceReturnDaily"?: number;
  beta?: number;

  // Used for context
  marketCapitalization?: number;
}

interface MetricResponse {
  metric?: Record<string, number | null>;
  symbol?: string;
}

export async function fetchFinnhubMetrics(
  symbol: string,
  apiKey: string
): Promise<FinnhubMetrics | null> {
  const url = `${BASE}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as MetricResponse;
    if (!data.metric) return null;
    // Cast the raw record to our typed interface (extra fields are ignored)
    return data.metric as unknown as FinnhubMetrics;
  } catch {
    return null;
  }
}

/** Fetch 1Y daily candles — used for 50/200 DMA computation in momentum. */
export interface Candle { t: number; c: number }

interface CandleResponse { s: string; t?: number[]; c?: number[] }

export async function fetchDailyCandles(
  symbol: string,
  apiKey: string,
  daysBack = 400
): Promise<Candle[]> {
  const now  = Math.floor(Date.now() / 1000);
  const from = now - daysBack * 86400;
  const url  = `${BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${now}&token=${encodeURIComponent(apiKey)}`;
  try {
    const res  = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = (await res.json()) as CandleResponse;
    if (data.s !== "ok" || !data.t?.length || !data.c?.length) return [];
    return data.t.map((t, i) => ({ t, c: data.c![i] }));
  } catch {
    return [];
  }
}
