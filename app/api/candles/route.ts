import { NextResponse } from "next/server";
import { getCandles, type CandleRange } from "@/lib/market/finnhub";

const VALID: CandleRange[] = ["1D", "1W", "1M", "6M", "1Y", "5Y"];

/**
 * GET /api/candles?symbol=AAPL&range=1M
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = (url.searchParams.get("symbol") || "").trim();
  const rangeRaw = (url.searchParams.get("range") || "1M") as CandleRange;
  const range: CandleRange = VALID.includes(rangeRaw) ? rangeRaw : "1M";
  if (!symbol) {
    return NextResponse.json({ candles: [] }, { status: 400 });
  }
  const candles = await getCandles(symbol, range);
  return NextResponse.json(
    { symbol, range, candles },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } }
  );
}
