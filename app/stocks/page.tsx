import type { Metadata } from "next";
import Link from "next/link";
import { BarChart2 } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { allPublishedStockFilesQuery } from "@/lib/sanity/queries";
import { groq } from "next-sanity";
import type { StockFile } from "@/lib/types";
import { absoluteUrl, formatDate, SITE_NAME } from "@/lib/utils";

import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Stock Files — Canadian & US Tickers Scored on 6 Factors",
  description: `Score-driven reference pages for 38 TSX and US tickers on ${SITE_NAME}. Value, growth, quality, dividend safety, momentum, and Canadian tax efficiency — all in one place.`,
  alternates: { canonical: absoluteUrl("/stocks") },
};

const scoreQuery = groq`
  *[_type == "scoreSnapshot"] | order(computedAt desc) {
    ticker, "overall": scores.overall
  }
`;

export default async function StocksPage() {
  const [stocks, snapshots] = await Promise.all([
    client.fetch<StockFile[]>(allPublishedStockFilesQuery).catch(() => [] as StockFile[]),
    client.fetch<Array<{ ticker: string; overall: number | null }>>(scoreQuery).catch(() => []),
  ]);

  // Latest score per ticker
  const scoreMap = new Map<string, number | null>();
  for (const s of snapshots) {
    if (!scoreMap.has(s.ticker)) scoreMap.set(s.ticker, s.overall);
  }

  // Group by sectorLabel
  const sectors = Array.from(new Set(stocks.map((s) => s.sectorLabel))).sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
          Score-driven reference pages
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          Stock Files
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ash-300">
          Every ticker scored across six factors — Value, Growth, Quality,
          Dividend Safety, Momentum, and Canadian Tax Efficiency. Built for
          Wealthsimple and Questrade investors who want the full picture.
        </p>
        <div className="mt-3 flex items-center gap-4">
          <Link
            href="/methodology"
            className="text-sm font-semibold text-accent-300 hover:text-accent-200"
          >
            How the score works →
          </Link>
          <span className="text-xs text-ash-500">{stocks.length} stocks</span>
        </div>
      </div>

      {stocks.length === 0 ? (
        <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-12 text-center">
          <BarChart2 className="mx-auto mb-4 h-10 w-10 text-ash-600" />
          <h2 className="text-xl font-bold text-ash-50">No Stock Files yet</h2>
          <p className="mt-2 text-sm text-ash-400">
            Check back soon — Stock Files are being added.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {sectors.map((sector) => {
            const sectorStocks = stocks.filter((s) => s.sectorLabel === sector);
            return (
              <section key={sector}>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                  {sector}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sectorStocks.map((sf) => (
                    <StockFileCard key={sf._id} sf={sf} score={scoreMap.get(sf.ticker) ?? null} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-14">
        <Disclaimer variant="block" />
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-xs text-ash-600">N/A</span>;
  const color =
    score >= 70 ? "bg-up-400" :
    score >= 50 ? "bg-accent-400" :
    score >= 30 ? "bg-warn-400" :
    "bg-down-400";
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 flex-1 rounded-full bg-ink-700">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-xs tabular-nums text-ash-300">
        {score}
      </span>
    </div>
  );
}

function StockFileCard({ sf, score }: { sf: StockFile; score: number | null }) {
  const overall = score;

  return (
    <Link
      href={`/stocks/${sf.slug.current}`}
      className="group flex flex-col rounded-2xl border border-ink-600/80 bg-ink-800/60 p-5 transition-all hover:border-accent-500/40 hover:bg-ink-800"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-bold text-ash-50 group-hover:text-accent-200">
              {sf.ticker}
            </span>
            {(sf.exchange === "TSX" || sf.exchange === "TSXV") && (
              <span className="text-[10px]" title="Canadian listing">🇨🇦</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ash-400 line-clamp-1">{sf.companyName}</p>
        </div>
        <span className="rounded-md bg-ink-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ash-400">
          {sf.exchange}
        </span>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] text-ash-500">
          <span>Score</span>
        </div>
        <ScoreBar score={overall} />
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-xs text-ash-500">{sf.sectorLabel}</span>
        {sf.lastReviewed && (
          <span className="text-[10px] text-ash-600">
            {formatDate(sf.lastReviewed)}
          </span>
        )}
      </div>
    </Link>
  );
}
