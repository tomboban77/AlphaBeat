import { NextResponse } from "next/server";
import { getQuotes } from "@/lib/market/finnhub";

/**
 * GET /api/quote?symbols=AAPL,MSFT,SHOP.TO
 *
 * Returns a map of symbol → quote. Cached server-side (60s) by Finnhub wrapper.
 * Used by the Watchlist page and any client component needing live updates.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("symbols") || "";
  const symbols = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: {} });
  }

  const map = await getQuotes(symbols);
  const quotes: Record<string, unknown> = {};
  for (const [symbol, q] of map.entries()) {
    quotes[symbol] = q;
  }

  return NextResponse.json(
    { quotes },
    {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
