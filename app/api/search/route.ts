import { NextResponse } from "next/server";
import { searchSymbol } from "@/lib/market/finnhub";
import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";

interface LocalHit {
  type: "stock";
  title: string;
  subtitle?: string;
  href: string;
  ticker?: string;
}

/**
 * GET /api/search?q=ry
 *
 * Two streams:
 *   1. Local — stocks from Sanity (matches title or ticker)
 *   2. Remote — Finnhub symbol search (for tickers not yet in Stock Files)
 *
 * Used by the global cmd-K command palette.
 */
const localQuery = groq`
{
  "stocks": *[_type == "stock" && published == true && (
    lower(ticker) match $q + "*" || lower(name) match $q + "*"
  )][0...8] {
    "type": "stock", ticker, name,
    "slug": slug.current,
    "sector": sector->title
  }
}
`;

interface LocalQueryResult {
  stocks: Array<{ type: "stock"; ticker: string; name: string; slug: string; sector?: string }>;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const qRaw = (url.searchParams.get("q") || "").trim();
  if (!qRaw) {
    return NextResponse.json({ local: [], remote: [] });
  }
  const q = qRaw.toLowerCase();

  const [local, remote] = await Promise.all([
    client.fetch<LocalQueryResult>(localQuery, { q }).catch(() => null),
    searchSymbol(qRaw).catch(() => []),
  ]);

  const localHits: LocalHit[] = [];
  if (local) {
    for (const s of local.stocks)
      localHits.push({
        type: "stock",
        title: `${s.ticker} — ${s.name}`,
        subtitle: s.sector,
        href: `/stocks/${s.slug}`,
        ticker: s.ticker,
      });
  }

  return NextResponse.json(
    { local: localHits, remote: remote.slice(0, 8) },
    { headers: { "Cache-Control": "public, max-age=120, s-maxage=300" } }
  );
}
