import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import { allPublishedStocksQuery } from "@/lib/sanity/queries";
import type { Stock } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";

import Breadcrumb from "@/components/ui/Breadcrumb";
import WatchlistView from "@/components/watchlist/WatchlistView";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "My watchlist",
  description:
    "Your AlphaBeat watchlist — live US & Canadian quotes, stored locally on this device.",
  alternates: { canonical: absoluteUrl("/watchlist") },
  robots: { index: false, follow: true },
};

export default async function WatchlistPage() {
  const stocks = await client
    .fetch<Stock[]>(allPublishedStocksQuery)
    .catch(() => []);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Watchlist" }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          My watchlist
        </h1>
        <p className="mt-2 text-ash-300">
          Live quotes for the tickers you&rsquo;re tracking. Stored on this device,
          no signup required.
        </p>
      </header>
      <WatchlistView curatedStocks={stocks} />
    </div>
  );
}
