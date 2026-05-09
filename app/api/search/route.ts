import { NextResponse } from "next/server";
import { searchSymbol } from "@/lib/market/finnhub";
import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";

interface LocalHit {
  type: "stock" | "etf" | "sector" | "insight";
  title: string;
  subtitle?: string;
  href: string;
  ticker?: string;
}

/**
 * GET /api/search?q=apple
 *
 * Two streams:
 *   1. Local — stocks / ETFs / sectors / insights from Sanity (matches title or ticker)
 *   2. Remote — Finnhub symbol search (for tickers we haven't curated yet)
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
  },
  "etfs": *[_type == "etfEntry" && published == true && (
    lower(title) match $q + "*" || lower(primaryTicker) match $q + "*" ||
    lower(tracksIndexName) match $q + "*"
  )][0...6] {
    "type": "etf", title, primaryTicker,
    "slug": slug.current,
    tracksIndexName
  },
  "sectors": *[_type == "sector" && lower(title) match $q + "*"][0...4] {
    "type": "sector", title, "slug": slug.current, tagline
  },
  "insights": *[_type == "insight" && (
    lower(title) match $q + "*" || lower(excerpt) match $q + "*"
  )] | order(publishedAt desc)[0...6] {
    "type": "insight", title, "slug": slug.current, excerpt
  }
}
`;

interface LocalQueryResult {
  stocks: Array<{ type: "stock"; ticker: string; name: string; slug: string; sector?: string }>;
  etfs: Array<{ type: "etf"; title: string; primaryTicker?: string; slug: string; tracksIndexName?: string }>;
  sectors: Array<{ type: "sector"; title: string; slug: string; tagline?: string }>;
  insights: Array<{ type: "insight"; title: string; slug: string; excerpt?: string }>;
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
    for (const e of local.etfs)
      localHits.push({
        type: "etf",
        title: e.title,
        subtitle: e.tracksIndexName,
        href: `/etfs/${e.slug}`,
        ticker: e.primaryTicker,
      });
    for (const sec of local.sectors)
      localHits.push({
        type: "sector",
        title: sec.title,
        subtitle: sec.tagline || "Sector",
        href: `/sectors/${sec.slug}`,
      });
    for (const i of local.insights)
      localHits.push({
        type: "insight",
        title: i.title,
        subtitle: i.excerpt,
        href: `/insights/${i.slug}`,
      });
  }

  return NextResponse.json(
    { local: localHits, remote: remote.slice(0, 8) },
    { headers: { "Cache-Control": "public, max-age=120, s-maxage=300" } }
  );
}
