import "server-only";
import type { CandlePoint, CompanyProfile, MarketQuote } from "@/lib/types";
import { currencyForSymbol, normalizeFinnhubSymbol } from "./symbols";

/**
 * Server-side Finnhub wrapper.
 *
 * Free-tier rules:
 *  - 60 calls / minute (we cache to stay well under that)
 *  - quote()                 → /api/v1/quote?symbol=...
 *  - profile2()              → /api/v1/stock/profile2?symbol=... (limited coverage on free tier)
 *  - candles()               → /api/v1/stock/candle (US only on free tier; we degrade gracefully)
 *  - searchSymbol()          → /api/v1/search?q=...
 *
 * Cache strategy via Next.js `fetch` `next.revalidate`:
 *  - quote        : 60 s
 *  - candles      : 1 h
 *  - profile      : 24 h
 *  - search       : 1 h
 *
 * If FINNHUB_API_KEY is missing we return mock-but-typed data so the site still renders
 * during local development without exposing a "broken" experience.
 */

const BASE = "https://finnhub.io/api/v1";

function getKey(): string | null {
  const k = process.env.FINNHUB_API_KEY?.trim();
  return k ? k : null;
}

function withKey(url: string, key: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}token=${encodeURIComponent(key)}`;
}

async function fhFetch<T>(
  pathWithQuery: string,
  revalidate: number
): Promise<T | null> {
  const key = getKey();
  if (!key) return null;
  const url = withKey(`${BASE}${pathWithQuery}`, key);
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Quote
// ---------------------------------------------------------------------------

interface FinnhubQuoteResponse {
  c: number; // current
  d: number; // change
  dp: number; // change %
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // prev close
  t: number; // unix
}

/**
 * Get a real-time-ish quote for a single symbol. Cache: 60s.
 */
export async function getQuote(symbolInput: string): Promise<MarketQuote> {
  const symbol = normalizeFinnhubSymbol(symbolInput);
  const data = await fhFetch<FinnhubQuoteResponse>(
    `/quote?symbol=${encodeURIComponent(symbol)}`,
    60
  );
  const currency = currencyForSymbol(symbol);

  if (!data || (data.c === 0 && data.pc === 0)) {
    return mockQuote(symbol, currency, true);
  }

  return {
    symbol,
    price: data.c,
    change: data.d ?? 0,
    changePercent: data.dp ?? 0,
    high: data.h ?? undefined,
    low: data.l ?? undefined,
    open: data.o ?? undefined,
    prevClose: data.pc ?? undefined,
    asOf: data.t ?? undefined,
    currency,
    stale: false,
  };
}

/**
 * Fetch many quotes in parallel. Returns a Map keyed by the *normalized* symbol.
 */
export async function getQuotes(
  symbolInputs: string[]
): Promise<Map<string, MarketQuote>> {
  const unique = Array.from(
    new Set(symbolInputs.map((s) => normalizeFinnhubSymbol(s)).filter(Boolean))
  );
  const results = await Promise.all(unique.map((s) => getQuote(s)));
  const map = new Map<string, MarketQuote>();
  results.forEach((q, i) => map.set(unique[i], q));
  return map;
}

// ---------------------------------------------------------------------------
// Candles (historical)
// ---------------------------------------------------------------------------

interface FinnhubCandleResponse {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: "ok" | "no_data";
  t: number[];
  v?: number[];
}

export type CandleRange = "1D" | "1W" | "1M" | "6M" | "1Y" | "5Y";

interface CandleParams {
  resolution: "1" | "5" | "15" | "30" | "60" | "D" | "W";
  fromDelta: number; // seconds back from now
}

const RANGE_PARAMS: Record<CandleRange, CandleParams> = {
  "1D": { resolution: "5", fromDelta: 60 * 60 * 24 * 2 }, // 2 days of 5-min bars (covers weekend)
  "1W": { resolution: "30", fromDelta: 60 * 60 * 24 * 8 },
  "1M": { resolution: "60", fromDelta: 60 * 60 * 24 * 32 },
  "6M": { resolution: "D", fromDelta: 60 * 60 * 24 * 200 },
  "1Y": { resolution: "D", fromDelta: 60 * 60 * 24 * 380 },
  "5Y": { resolution: "W", fromDelta: 60 * 60 * 24 * 365 * 5 + 60 * 60 * 24 * 30 },
};

/**
 * Get historical candles. Cache: 1h.
 *
 * NOTE: Finnhub free tier restricts the candles endpoint to US equities. For TSX
 * symbols this may return `no_data` — we generate a deterministic mock series so
 * charts still render. Replace with a paid plan for real historical data on TSX.
 */
export async function getCandles(
  symbolInput: string,
  range: CandleRange = "1M"
): Promise<CandlePoint[]> {
  const symbol = normalizeFinnhubSymbol(symbolInput);
  const cfg = RANGE_PARAMS[range];
  const now = Math.floor(Date.now() / 1000);
  const from = now - cfg.fromDelta;

  const data = await fhFetch<FinnhubCandleResponse>(
    `/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${cfg.resolution}&from=${from}&to=${now}`,
    60 * 60
  );

  if (!data || data.s !== "ok" || !data.c?.length) {
    return mockCandles(symbol, range);
  }

  return data.t.map((t, i) => ({
    t,
    o: data.o[i],
    h: data.h[i],
    l: data.l[i],
    c: data.c[i],
    v: data.v?.[i],
  }));
}

// ---------------------------------------------------------------------------
// Company profile
// ---------------------------------------------------------------------------

interface FinnhubProfile2 {
  country?: string;
  currency?: string;
  exchange?: string;
  finnhubIndustry?: string;
  ipo?: string;
  logo?: string;
  marketCapitalization?: number;
  name?: string;
  shareOutstanding?: number;
  ticker?: string;
  weburl?: string;
}

export async function getCompanyProfile(
  symbolInput: string
): Promise<CompanyProfile | null> {
  const symbol = normalizeFinnhubSymbol(symbolInput);
  const data = await fhFetch<FinnhubProfile2>(
    `/stock/profile2?symbol=${encodeURIComponent(symbol)}`,
    60 * 60 * 24
  );
  if (!data || !data.ticker) return null;
  return {
    symbol,
    name: data.name,
    exchange: data.exchange,
    country: data.country,
    industry: data.finnhubIndustry,
    marketCap: data.marketCapitalization,
    shareOutstanding: data.shareOutstanding,
    ipo: data.ipo,
    weburl: data.weburl,
    logo: data.logo,
    currency: data.currency,
  };
}

// ---------------------------------------------------------------------------
// Market news
// ---------------------------------------------------------------------------

interface FinnhubNewsItem {
  category?: string;
  datetime: number;
  headline: string;
  id: number;
  image?: string;
  related?: string;
  source?: string;
  summary?: string;
  url: string;
}

export interface MarketNewsItem {
  id: number;
  headline: string;
  source?: string;
  summary?: string;
  url: string;
  image?: string;
  related?: string;
  category?: string;
  publishedAt: number; // unix seconds
}

export type NewsCategory = "general" | "forex" | "crypto" | "merger";

/**
 * Fetch latest market news. Cache: 10 minutes.
 *
 * Free-tier note: Finnhub's news endpoints are open on free tier with the
 * usual 60 req/min ceiling. We cache aggressively because news doesn't move
 * second-by-second on the surfaces we render.
 */
export async function getMarketNews(
  category: NewsCategory = "general",
  limit = 12
): Promise<MarketNewsItem[]> {
  const data = await fhFetch<FinnhubNewsItem[]>(
    `/news?category=${encodeURIComponent(category)}`,
    60 * 10
  );
  if (!Array.isArray(data)) return mockNews(limit);
  return data.slice(0, limit).map((n) => ({
    id: n.id,
    headline: n.headline,
    source: n.source,
    summary: n.summary,
    url: n.url,
    image: n.image,
    related: n.related,
    category: n.category,
    publishedAt: n.datetime,
  }));
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

interface FinnhubSearchResponse {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

export interface SymbolSearchHit {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
}

export async function searchSymbol(query: string): Promise<SymbolSearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const data = await fhFetch<FinnhubSearchResponse>(
    `/search?q=${encodeURIComponent(q)}`,
    60 * 60
  );
  if (!data?.result) return [];
  return data.result.slice(0, 12);
}

// ---------------------------------------------------------------------------
// Mock fallbacks (deterministic per-symbol so SSR/CSR don't mismatch)
// ---------------------------------------------------------------------------

function hashSeed(symbol: string): number {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mockQuote(symbol: string, currency: string, stale: boolean): MarketQuote {
  const rand = mulberry32(hashSeed(symbol));
  const base = 20 + rand() * 480;
  const changePct = (rand() - 0.5) * 4;
  const change = +(base * (changePct / 100)).toFixed(2);
  return {
    symbol,
    price: +base.toFixed(2),
    change,
    changePercent: +changePct.toFixed(2),
    high: +(base * 1.01).toFixed(2),
    low: +(base * 0.99).toFixed(2),
    open: +(base * (1 - changePct / 200)).toFixed(2),
    prevClose: +(base - change).toFixed(2),
    asOf: Math.floor(Date.now() / 1000),
    currency,
    stale,
  };
}

function mockNews(limit: number): MarketNewsItem[] {
  const now = Math.floor(Date.now() / 1000);
  const seeds: Array<Pick<MarketNewsItem, "headline" | "source" | "summary" | "url">> = [
    {
      headline: "Markets churn as investors weigh fresh inflation data",
      source: "AlphaBeat newsroom",
      summary:
        "Equity benchmarks traded sideways as cooler-than-expected price data was offset by hawkish commentary from regional Fed officials.",
      url: "https://alphabeat.io/insights",
    },
    {
      headline: "AI capex remains the dominant earnings story",
      source: "AlphaBeat newsroom",
      summary:
        "Mega-cap guidance pointed to another year of double-digit data-center spending, even as some analysts question return on investment.",
      url: "https://alphabeat.io/insights",
    },
    {
      headline: "Crude eases as supply concerns dim",
      source: "AlphaBeat newsroom",
      summary:
        "Energy traders trimmed long positions as inventory builds and softer Asian demand weighed on near-term sentiment.",
      url: "https://alphabeat.io/insights",
    },
    {
      headline: "Canadian banks set to report into a softer macro backdrop",
      source: "AlphaBeat newsroom",
      summary:
        "Mortgage delinquencies and PCL provisions remain the key debate points heading into Q4 reporting on Bay Street.",
      url: "https://alphabeat.io/insights",
    },
    {
      headline: "Gold flirts with all-time highs on real-rate easing",
      source: "AlphaBeat newsroom",
      summary:
        "Bullion ETFs continued to attract inflows as the long end of the curve rallied alongside softer inflation expectations.",
      url: "https://alphabeat.io/insights",
    },
  ];
  return seeds.slice(0, limit).map((s, i) => ({
    id: 1000 + i,
    publishedAt: now - i * 1800,
    related: "",
    category: "general",
    image: undefined,
    ...s,
  }));
}

function mockCandles(symbol: string, range: CandleRange): CandlePoint[] {
  const rand = mulberry32(hashSeed(`${symbol}-${range}`));
  const cfg = RANGE_PARAMS[range];
  const now = Math.floor(Date.now() / 1000);
  const stepSec =
    cfg.resolution === "5" ? 300 :
    cfg.resolution === "30" ? 1800 :
    cfg.resolution === "60" ? 3600 :
    cfg.resolution === "D" ? 86400 :
    cfg.resolution === "W" ? 604800 : 86400;
  const points = Math.min(120, Math.floor(cfg.fromDelta / stepSec));
  let price = 50 + rand() * 250;
  const out: CandlePoint[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const drift = (rand() - 0.48) * 0.04;
    const next = Math.max(1, price * (1 + drift));
    out.push({
      t: now - i * stepSec,
      o: +price.toFixed(2),
      h: +Math.max(price, next).toFixed(2),
      l: +Math.min(price, next).toFixed(2),
      c: +next.toFixed(2),
      v: Math.floor(rand() * 1_000_000),
    });
    price = next;
  }
  return out;
}
