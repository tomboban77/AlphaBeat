import "server-only";

import type { MarketQuote } from "@/lib/types";
import { getQuotes } from "./finnhub";

/**
 * Server-side helpers for the Market Pulse surface.
 *
 * Everything here works on Finnhub's free tier and is server-cached via
 * Next.js fetch revalidation inside getQuotes(). Total network cost on a
 * cold visit: ~30 quote calls + 1 news call. Well under the 60/min limit.
 */

// ---------------------------------------------------------------------------
// Major indices (US + Canada)
// ---------------------------------------------------------------------------

export interface IndexInfo {
  symbol: string; // Finnhub symbol
  name: string;
  short: string;
  region: "us" | "ca" | "vol";
}

export const MAJOR_INDICES: IndexInfo[] = [
  { symbol: "^GSPC", name: "S&P 500", short: "S&P", region: "us" },
  { symbol: "^IXIC", name: "Nasdaq Composite", short: "Nasdaq", region: "us" },
  { symbol: "^DJI", name: "Dow Jones", short: "Dow", region: "us" },
  { symbol: "^GSPTSE", name: "S&P/TSX Composite", short: "TSX", region: "ca" },
  { symbol: "^VIX", name: "Volatility Index", short: "VIX", region: "vol" },
];

// ---------------------------------------------------------------------------
// 11 GICS sectors via SPDR sector ETFs (US)
// ---------------------------------------------------------------------------

export interface SectorTile {
  /** GICS sector name we display. */
  title: string;
  /** Optional Sanity sector slug to deep-link to /top/[slug]. */
  topSlug?: string;
  /** ETF ticker that drives the % change tile. */
  etf: string;
  /** Lucide icon name. */
  icon: string;
  /** Tailwind accent matching our sector palette. */
  accent: string;
  /** Short hint for the tooltip / footer line. */
  hint: string;
}

/**
 * Map GICS sectors to SPDR sector ETFs. Where we have a matching editorial
 * top-list slug we link to it; otherwise the tile is informational only.
 */
export const SECTOR_TILES: SectorTile[] = [
  {
    title: "Technology",
    topSlug: "top-technology-stocks",
    etf: "XLK",
    icon: "cpu",
    accent: "cyan",
    hint: "Software, semis, hardware",
  },
  {
    title: "Communications",
    etf: "XLC",
    icon: "radio",
    accent: "violet",
    hint: "Mega-cap internet, telecom, media",
  },
  {
    title: "Consumer Discretionary",
    etf: "XLY",
    icon: "shopping-bag",
    accent: "fuchsia",
    hint: "Retail, autos, travel, leisure",
  },
  {
    title: "Consumer Staples",
    etf: "XLP",
    icon: "shopping-cart",
    accent: "amber",
    hint: "Food, beverage, household",
  },
  {
    title: "Financials",
    topSlug: "top-financial-stocks",
    etf: "XLF",
    icon: "landmark",
    accent: "sky",
    hint: "Banks, insurers, asset managers",
  },
  {
    title: "Energy",
    topSlug: "top-energy-stocks",
    etf: "XLE",
    icon: "fuel",
    accent: "amber",
    hint: "Oil, gas, services",
  },
  {
    title: "Healthcare",
    etf: "XLV",
    icon: "heart-pulse",
    accent: "rose",
    hint: "Pharma, biotech, devices, payers",
  },
  {
    title: "Industrials",
    etf: "XLI",
    icon: "factory",
    accent: "lime",
    hint: "Aerospace, transport, machinery",
  },
  {
    title: "Materials",
    etf: "XLB",
    icon: "atom",
    accent: "emerald",
    hint: "Chemicals, metals, mining",
  },
  {
    title: "Utilities",
    etf: "XLU",
    icon: "zap",
    accent: "lime",
    hint: "Electric, gas, water",
  },
  {
    title: "Real Estate",
    etf: "XLRE",
    icon: "building",
    accent: "rose",
    hint: "REITs, property, real assets",
  },
];

// ---------------------------------------------------------------------------
// Macro & commodity signals
// ---------------------------------------------------------------------------

export interface MacroTile {
  symbol: string;
  label: string;
  hint: string;
}

export const MACRO_TILES: MacroTile[] = [
  { symbol: "GLD", label: "Gold", hint: "GLD ETF \u2014 store of value, fear gauge" },
  { symbol: "USO", label: "Crude Oil", hint: "USO ETF \u2014 crude price proxy" },
  { symbol: "TLT", label: "Long Bonds", hint: "TLT ETF \u2014 20yr+ Treasuries" },
  { symbol: "UUP", label: "US Dollar", hint: "UUP ETF \u2014 broad USD index proxy" },
];

// ---------------------------------------------------------------------------
// Aggregated fetchers
// ---------------------------------------------------------------------------

export interface IndicatorRow {
  info: IndexInfo;
  quote: MarketQuote;
}

export interface SectorHeatRow {
  tile: SectorTile;
  quote: MarketQuote;
}

export interface MacroRow {
  tile: MacroTile;
  quote: MarketQuote;
}

export async function getIndicators(): Promise<IndicatorRow[]> {
  const symbols = MAJOR_INDICES.map((i) => i.symbol);
  const map = await getQuotes(symbols);
  return MAJOR_INDICES.map((info) => {
    const quote = map.get(info.symbol);
    return quote
      ? { info, quote }
      : { info, quote: emptyQuote(info.symbol) };
  });
}

export async function getSectorHeat(): Promise<SectorHeatRow[]> {
  const symbols = SECTOR_TILES.map((t) => t.etf);
  const map = await getQuotes(symbols);
  return SECTOR_TILES.map((tile) => {
    const quote = map.get(tile.etf);
    return quote
      ? { tile, quote }
      : { tile, quote: emptyQuote(tile.etf) };
  }).sort((a, b) => b.quote.changePercent - a.quote.changePercent);
}

export async function getMacroSignals(): Promise<MacroRow[]> {
  const symbols = MACRO_TILES.map((t) => t.symbol);
  const map = await getQuotes(symbols);
  return MACRO_TILES.map((tile) => {
    const quote = map.get(tile.symbol);
    return quote
      ? { tile, quote }
      : { tile, quote: emptyQuote(tile.symbol) };
  });
}

function emptyQuote(symbol: string): MarketQuote {
  return {
    symbol,
    price: 0,
    change: 0,
    changePercent: 0,
    currency: "USD",
    stale: true,
  };
}

// ---------------------------------------------------------------------------
// Regime classifier
// ---------------------------------------------------------------------------

export type ComputedRegime = "risk-on" | "mixed" | "risk-off";

export interface RegimeReading {
  regime: ComputedRegime;
  label: string;
  rationale: string;
  /** Average % change across the four equity indices. */
  avgEquityPct: number;
  vixPct: number;
}

/**
 * Heuristic regime classifier.
 *
 * Risk-on  : avg index move >= +0.4% AND VIX move <= +1%
 * Risk-off : avg index move <= -0.4% OR  VIX move >=  +5%
 * Mixed    : everything else
 */
export function classifyRegime(rows: IndicatorRow[]): RegimeReading {
  const equity = rows.filter((r) => r.info.region !== "vol");
  const vol = rows.find((r) => r.info.region === "vol");
  const avgEquityPct =
    equity.length === 0
      ? 0
      : equity.reduce((s, r) => s + (r.quote.changePercent || 0), 0) /
        equity.length;
  const vixPct = vol?.quote.changePercent || 0;

  let regime: ComputedRegime;
  if (avgEquityPct >= 0.4 && vixPct <= 1) {
    regime = "risk-on";
  } else if (avgEquityPct <= -0.4 || vixPct >= 5) {
    regime = "risk-off";
  } else {
    regime = "mixed";
  }

  const label =
    regime === "risk-on"
      ? "Risk-on"
      : regime === "risk-off"
      ? "Risk-off"
      : "Mixed";

  const rationaleParts: string[] = [];
  rationaleParts.push(
    `Major indices ${avgEquityPct >= 0 ? "+" : ""}${avgEquityPct.toFixed(2)}% on average`
  );
  if (vol) {
    rationaleParts.push(
      `VIX ${vixPct >= 0 ? "+" : ""}${vixPct.toFixed(2)}%`
    );
  }
  return {
    regime,
    label,
    rationale: rationaleParts.join(" \u00b7 "),
    avgEquityPct,
    vixPct,
  };
}

// ---------------------------------------------------------------------------
// Top movers (over a list of symbols, e.g. our editorial universe)
// ---------------------------------------------------------------------------

export interface MoverRow {
  symbol: string;
  quote: MarketQuote;
}

export async function getTopMovers(
  symbols: string[],
  limit = 10
): Promise<{ gainers: MoverRow[]; losers: MoverRow[] }> {
  if (symbols.length === 0) return { gainers: [], losers: [] };
  const map = await getQuotes(symbols);
  const rows: MoverRow[] = [];
  for (const [symbol, quote] of map.entries()) {
    if (!quote.stale && quote.price > 0) rows.push({ symbol, quote });
  }
  const gainers = [...rows]
    .filter((r) => r.quote.changePercent > 0)
    .sort((a, b) => b.quote.changePercent - a.quote.changePercent)
    .slice(0, limit);
  const losers = [...rows]
    .filter((r) => r.quote.changePercent < 0)
    .sort((a, b) => a.quote.changePercent - b.quote.changePercent)
    .slice(0, limit);
  return { gainers, losers };
}
