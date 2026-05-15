/**
 * Symbol normalization for Finnhub.
 *
 * Finnhub conventions used here:
 *  - US stocks: bare ticker, e.g. "AAPL"
 *  - TSX / Canadian: suffix .TO  e.g. "SHOP.TO"  → finnhub format "TSX:SHOP"? In practice
 *    Finnhub also accepts `SHOP.TO`. We pass through a normalized version that works
 *    on the `/quote` endpoint.
 *  - Indices: must use Finnhub-known form. "^GSPC" works on /quote (S&P 500).
 *
 * If you typo a symbol the Finnhub API will return zeros rather than throwing — we treat
 * `c == 0 && pc == 0` as "no data" and surface `stale: true`.
 */

export const INDEX_SYMBOLS: Record<string, { label: string; symbol: string }> = {
  "^GSPC": { label: "S&P 500", symbol: "^GSPC" },
  "^IXIC": { label: "Nasdaq", symbol: "^IXIC" },
  "^DJI": { label: "Dow", symbol: "^DJI" },
  "^GSPTSE": { label: "TSX Comp", symbol: "^GSPTSE" },
  "^RUT": { label: "Russell 2000", symbol: "^RUT" },
  "^VIX": { label: "VIX", symbol: "^VIX" },
};

export function isIndexSymbol(s: string): boolean {
  return s.startsWith("^") || /^(?:\^|index:)/i.test(s);
}

/**
 * Normalize whatever the editor or URL gave us into the form Finnhub expects.
 * - Lowercase / "tse:ry" → "RY.TO"
 * - "tsx:shop" → "SHOP.TO"
 * - keep .TO / .V suffixes
 * - keep ^INDEX
 */
export function normalizeFinnhubSymbol(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("^")) return trimmed;

  const lower = trimmed.toLowerCase();
  // tsx:shop, tse:ry → SHOP.TO, RY.TO
  const tsxMatch = lower.match(/^(?:tsx|tse):([a-z0-9]+)$/);
  if (tsxMatch) return `${tsxMatch[1].toUpperCase()}.TO`;

  // tsxv:foo → FOO.V
  const tsxvMatch = lower.match(/^tsxv:([a-z0-9]+)$/);
  if (tsxvMatch) return `${tsxvMatch[1].toUpperCase()}.V`;

  return trimmed.toUpperCase();
}

/**
 * Display-friendly form: "SHOP.TO" → "SHOP", "^GSPC" → "S&P 500", else as-is.
 */
export function displayLabel(symbol: string): string {
  if (!symbol) return "";
  if (INDEX_SYMBOLS[symbol]) return INDEX_SYMBOLS[symbol].label;
  return symbol.replace(/\.[A-Z]+$/, "").toUpperCase();
}

/**
 * Currency for a display/identity ticker — best-effort.
 */
export function currencyForSymbol(symbol: string): string {
  if (symbol.endsWith(".TO") || symbol.endsWith(".V")) return "CAD";
  if (symbol === "^GSPTSE") return "CAD";
  return "USD";
}

/**
 * Convert a display/identity ticker to the form Finnhub's free-tier API actually accepts.
 *
 * Finnhub free tier does NOT allow the `.TO` suffix on quote or metric endpoints.
 * For dual-listed Canadian stocks (RY.TO, SHOP.TO, ENB.TO …) pass the bare NYSE/NASDAQ
 * ticker instead — Finnhub returns the same underlying data and labels it as `RY.TO`.
 * TSX-only stocks (ATD, CSU) work with the bare ticker for quotes but fundamentals
 * may be sparse. Indices (^GSPTSE) and FX (CAD=X) pass through unchanged.
 *
 * Examples:
 *   "RY.TO"   → "RY"
 *   "SHOP.TO" → "SHOP"
 *   "^GSPTSE" → "^GSPTSE"
 *   "AAPL"    → "AAPL"
 */
export function toFinnhubApiSymbol(symbol: string): string {
  if (!symbol) return symbol;
  // Keep indices and FX as-is
  if (symbol.startsWith("^") || symbol.includes("=")) return symbol;
  // Strip .TO and .V suffixes; handle trust unit format REI-UN.TO → REI-UN
  return symbol.replace(/\.(TO|V)$/i, "");
}
