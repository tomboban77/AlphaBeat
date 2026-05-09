import type { Metadata } from "next";
import Link from "next/link";
import { Flag, Trophy } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { allPublishedEtfsQuery } from "@/lib/sanity/queries";
import type { EtfEntry, MarketQuote } from "@/lib/types";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";
import { getQuotes } from "@/lib/market/finnhub";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";

import Breadcrumb from "@/components/ui/Breadcrumb";
import EtfGrid from "@/components/etfs/EtfGrid";
import EtfLeaderboardTable from "@/components/etfs/EtfLeaderboardTable";
import Disclaimer from "@/components/ui/Disclaimer";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Best-performing ETFs — US & Canada leaderboards",
  description: `Top 10 best-performing US and Canadian ETFs ranked by trailing 1-year total return — plus our hand-picked broad market, dividend, thematic, and bond ETFs. Editor-led, ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl("/etfs") },
};

const TAG_LABELS: Record<string, string> = {
  "us-broad": "US broad market",
  "us-tech": "US technology",
  "us-dividend": "US dividends",
  canada: "Canada",
  global: "International / global",
  emerging: "Emerging markets",
  bonds: "Bonds / fixed income",
  thematic: "Thematic",
  commodities: "Commodities",
  other: "Other",
};

function isCanadianListing(etf: EtfEntry): boolean {
  const t = etf.primaryTicker || "";
  return (
    /\.TO$/i.test(t) ||
    /\.V$/i.test(t) ||
    /\.NE$/i.test(t) ||
    etf.categoryTag === "canada"
  );
}

function sortByReturn(
  list: EtfEntry[],
  field: "return1Y" | "returnYTD" = "return1Y"
): EtfEntry[] {
  return [...list].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return bv - av;
  });
}

export default async function EtfsPage() {
  const etfs = await client
    .fetch<EtfEntry[]>(allPublishedEtfsQuery)
    .catch(() => []);

  // Pull every primary ticker for live quote data (cached server-side).
  const symbols = etfs.map((e) => e.primaryTicker).filter(Boolean) as string[];
  const quoteMap = await getQuotes(symbols);
  const quotes: Record<string, MarketQuote> = {};
  for (const sym of symbols) {
    const q = quoteMap.get(normalizeFinnhubSymbol(sym));
    if (q) quotes[sym] = q;
  }

  const usEtfs = etfs.filter((e) => !isCanadianListing(e));
  const caEtfs = etfs.filter((e) => isCanadianListing(e));

  const usTop10 = sortByReturn(usEtfs).slice(0, 10);
  const caTop10 = sortByReturn(caEtfs).slice(0, 10);

  const returnsAsOf = etfs.find((e) => e.returnsAsOf)?.returnsAsOf;

  // Group remaining (non-leaderboard) ETFs by category for browse section.
  const inLeaderboards = new Set([
    ...usTop10.map((e) => e._id),
    ...caTop10.map((e) => e._id),
  ]);
  const remaining = etfs.filter((e) => !inLeaderboards.has(e._id));
  const grouped = new Map<string, EtfEntry[]>();
  for (const etf of remaining) {
    const tag = etf.categoryTag || "other";
    if (!grouped.has(tag)) grouped.set(tag, []);
    grouped.get(tag)!.push(etf);
  }
  const order = [
    "us-broad",
    "us-tech",
    "us-dividend",
    "canada",
    "global",
    "emerging",
    "bonds",
    "thematic",
    "commodities",
    "other",
  ];
  const sortedGroups = order
    .map((k) => [k, grouped.get(k) || []] as const)
    .filter(([, v]) => v.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "ETFs" }]} />

      <header className="mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-1 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-300">
          <Trophy className="h-3.5 w-3.5" />
          Performance leaderboard
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          The best-performing ETFs in US and Canada
        </h1>
        <p className="mt-3 text-ash-300">
          For investors who would rather not pick individual stocks. Top 10
          ETFs by trailing 1-year total return, ranked separately for each
          market and refreshed monthly. Below the leaderboards, browse our
          full universe by category.
        </p>
        {returnsAsOf && (
          <p className="mt-2 text-xs text-ash-500">
            Returns as of {returnsAsOf}. Live price and daily change update
            during market hours.
          </p>
        )}
      </header>

      {etfs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
          <p className="text-ash-300">
            No ETFs published yet. Add some in{" "}
            <Link
              href="/studio"
              className="font-semibold text-accent-300 underline-offset-2 hover:underline"
            >
              Sanity Studio
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          {/* ============================================ US LEADERBOARD */}
          {usTop10.length > 0 && (
            <section className="mb-12">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-300">
                    <Flag className="h-3.5 w-3.5" />
                    United States
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-ash-50">
                    Top {usTop10.length} US ETFs by 1-year return
                  </h2>
                  <p className="mt-1 text-sm text-ash-400">
                    NYSE / NASDAQ-listed funds. Returns are total return (price
                    + distributions) in USD.
                  </p>
                </div>
              </div>
              <EtfLeaderboardTable etfs={usTop10} quotes={quotes} />
            </section>
          )}

          {/* ============================================ CA LEADERBOARD */}
          {caTop10.length > 0 && (
            <section className="mb-12">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-300">
                    <Flag className="h-3.5 w-3.5" />
                    Canada
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-ash-50">
                    Top {caTop10.length} Canadian ETFs by 1-year return
                  </h2>
                  <p className="mt-1 text-sm text-ash-400">
                    TSX-listed funds. Returns are total return in CAD — the
                    currency you actually care about as a Canadian investor.
                  </p>
                </div>
              </div>
              <EtfLeaderboardTable etfs={caTop10} quotes={quotes} />
            </section>
          )}

          {/* ============================================== METHODOLOGY */}
          <section className="mb-12 rounded-2xl border border-ink-700 bg-ink-800/40 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ash-400">
              How we rank
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ash-300">
              <li>
                <span className="font-semibold text-ash-100">Coverage:</span>{" "}
                Only ETFs we&rsquo;ve hand-picked and published — not every ETF
                on every exchange.
              </li>
              <li>
                <span className="font-semibold text-ash-100">Sort key:</span>{" "}
                Trailing 1-year total return (price + distributions).
              </li>
              <li>
                <span className="font-semibold text-ash-100">Currency:</span>{" "}
                US ETFs are ranked in USD; Canadian ETFs in CAD. We don&rsquo;t
                cross-compare to avoid FX distortion.
              </li>
              <li>
                <span className="font-semibold text-ash-100">Refresh:</span>{" "}
                Returns are updated monthly from public fund factsheets. Live
                price &amp; daily change are pulled in real time.
              </li>
              <li>
                <span className="font-semibold text-ash-100">Caveat:</span> A
                great 1-year run doesn&rsquo;t guarantee the next one. Use the
                3-year and 5-year columns to spot one-hit wonders.
              </li>
            </ul>
          </section>

          {/* ====================================== BROWSE BY CATEGORY */}
          {sortedGroups.length > 0 && (
            <section className="mb-12">
              <header className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-ash-50">
                  Browse by category
                </h2>
                <p className="mt-1 text-sm text-ash-400">
                  Other curated ETFs by mandate. Tap any card for the editor&rsquo;s
                  long-form take, holdings, and how the fund is constructed.
                </p>
              </header>

              <div className="space-y-12">
                {sortedGroups.map(([tag, list]) => (
                  <section key={tag}>
                    <h3 className="mb-4 text-base font-bold tracking-tight text-ash-100">
                      {TAG_LABELS[tag] || tag}
                      <span className="ml-2 text-xs font-medium text-ash-500">
                        ({list.length})
                      </span>
                    </h3>
                    <EtfGrid etfs={list} cols={3} />
                  </section>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="mt-12">
        <NewsletterCTA
          source="etfs-leaderboard"
          variant="inline"
          title="Get the leaderboard refresh in your inbox."
          description="We rerun the rankings every month. Subscribers get the new Top 10 — and the names that fell off — before everyone else."
        />
      </div>

      <div className="mt-12">
        <Disclaimer variant="block">
          Educational only. ETFs involve risk including loss of principal.
          Returns, MER, AUM, and yield figures are sourced from public fund
          factsheets and are refreshed periodically — always verify with the
          issuer before investing. Past performance is not indicative of future
          results.
        </Disclaimer>
      </div>
    </div>
  );
}
