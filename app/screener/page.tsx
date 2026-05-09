import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import {
  allPublishedStocksQuery,
  allSectorsQuery,
} from "@/lib/sanity/queries";
import type { MarketQuote, Sector, Stock } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";
import { getQuotes } from "@/lib/market/finnhub";

import Breadcrumb from "@/components/ui/Breadcrumb";
import Screener from "@/components/stocks/Screener";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Stock screener",
  description:
    "Filter every US and Canadian stock we track by sector, market cap, country, and price action. Find your next idea in seconds.",
  alternates: { canonical: absoluteUrl("/screener") },
};

export default async function ScreenerPage() {
  const [stocks, sectors] = await Promise.all([
    client.fetch<Stock[]>(allPublishedStocksQuery).catch(() => []),
    client.fetch<Sector[]>(allSectorsQuery).catch(() => []),
  ]);
  const quoteMap = await getQuotes(stocks.map((s) => s.ticker));
  const quotes: Record<string, MarketQuote> = {};
  for (const [k, v] of quoteMap.entries()) quotes[k] = v;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Screener" }]} />

      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          Stock screener
        </h1>
        <p className="mt-3 text-ash-300">
          Cut through the noise. Filter our entire watchlist by sector, market
          cap, country, and live price action — sort by today&rsquo;s biggest movers.
        </p>
      </header>

      {stocks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
          <p className="text-ash-300">No stocks to screen yet.</p>
        </div>
      ) : (
        <Screener stocks={stocks} quotes={quotes} sectors={sectors} />
      )}

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}
