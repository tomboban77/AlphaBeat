import { NextResponse } from "next/server";
import { getQuotes } from "@/lib/market/finnhub";
import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";

export const dynamic = "force-dynamic";

interface WatchlistItem {
  ticker:      string;
  companyName: string;
  sectorLabel: string;
  slug:        string | null;
  price:       number;
  change:      number;
  changePercent: number;
  currency:    string;
  stale:       boolean;
  overallScore: number | null;
  lastReviewed: string | null;
  reviewType:  string | null;
}

const stockFileQuery = groq`
  *[_type == "stockFile" && ticker in $tickers] {
    ticker, companyName, sectorLabel, lastReviewed, reviewType,
    "slug": slug.current
  }
`;

const snapshotQuery = groq`
  *[_type == "scoreSnapshot" && ticker in $tickers] | order(computedAt desc) {
    ticker, "overall": scores.overall, computedAt
  }
`;

export async function GET(request: Request) {
  const url     = new URL(request.url);
  const raw     = url.searchParams.get("tickers") || "";
  const tickers = raw.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean).slice(0, 50);

  if (!tickers.length) return NextResponse.json([]);

  // Parallel: quotes + stockFile metadata + score snapshots
  const [quoteMap, stockFiles, snapshots] = await Promise.all([
    getQuotes(tickers).catch(() => new Map()),
    client.fetch(stockFileQuery, { tickers }).catch(() => []) as Promise<
      Array<{ ticker: string; companyName: string; sectorLabel: string; slug: string | null; lastReviewed: string | null; reviewType: string | null }>
    >,
    client.fetch(snapshotQuery, { tickers }).catch(() => []) as Promise<
      Array<{ ticker: string; overall: number | null; computedAt: string }>
    >,
  ]);

  // Deduplicate snapshots (latest per ticker)
  const latestSnapshot = new Map<string, number | null>();
  for (const s of snapshots) {
    if (!latestSnapshot.has(s.ticker)) latestSnapshot.set(s.ticker, s.overall);
  }

  const sfMap = new Map(stockFiles.map((sf) => [sf.ticker, sf]));

  const items: WatchlistItem[] = tickers.map((ticker) => {
    const q  = quoteMap.get(ticker);
    const sf = sfMap.get(ticker);
    return {
      ticker,
      companyName:   sf?.companyName  ?? ticker,
      sectorLabel:   sf?.sectorLabel  ?? "",
      slug:          sf?.slug         ?? null,
      price:         q?.price         ?? 0,
      change:        q?.change        ?? 0,
      changePercent: q?.changePercent ?? 0,
      currency:      q?.currency      ?? "USD",
      stale:         q?.stale         ?? true,
      overallScore:  latestSnapshot.get(ticker) ?? null,
      lastReviewed:  sf?.lastReviewed ?? null,
      reviewType:    sf?.reviewType   ?? null,
    };
  });

  return NextResponse.json(items, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
