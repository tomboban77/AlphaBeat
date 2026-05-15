import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { allPublishedStocksQuery } from "@/lib/sanity/queries";
import type { Stock } from "@/lib/types";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";

import StockCard from "@/components/stocks/StockCard";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Stock Files — Canadian & US Tickers",
  description: `Score-driven reference pages for individual TSX and US tickers on ${SITE_NAME}. Value, growth, quality, dividend safety, momentum, and Canadian tax efficiency.`,
  alternates: { canonical: absoluteUrl("/stocks") },
};

export default async function StocksPage() {
  const stocks = await client
    .fetch<Stock[]>(allPublishedStocksQuery)
    .catch(() => [] as Stock[]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
          Score-driven reference pages
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          Stock Files
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ash-300">
          Every ticker scored across six factors — Value, Growth, Quality,
          Dividend Safety, Momentum, and Canadian Tax Efficiency. Built for
          Wealthsimple and Questrade investors who want the full picture before
          they buy.
        </p>
        <div className="mt-3">
          <Link
            href="/methodology"
            className="text-sm font-semibold text-accent-300 hover:text-accent-200"
          >
            How the score works →
          </Link>
        </div>
      </div>

      {stocks.length === 0 ? (
        <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-12 text-center">
          <h2 className="text-xl font-bold text-ash-50">No Stock Files yet</h2>
          <p className="mt-3 text-sm text-ash-400">
            Stock Files are published in Phase 2. Subscribe to be notified when
            they launch.
          </p>
          <Link
            href="/subscribe"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
          >
            Subscribe — it&apos;s free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stocks.map((stock) => (
            <StockCard key={stock._id} stock={stock} />
          ))}
        </div>
      )}

      <div className="mt-14">
        <Disclaimer variant="block" />
      </div>
    </div>
  );
}
