import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Layers } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { etfBySlugQuery, etfSlugsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { EtfEntry } from "@/lib/types";
import {
  absoluteUrl,
  cn,
  formatChange,
  formatPercent,
  formatPrice,
  SITE_NAME,
} from "@/lib/utils";
import { getCandles, getQuote } from "@/lib/market/finnhub";
import {
  currencyForSymbol,
  normalizeFinnhubSymbol,
} from "@/lib/market/symbols";

import Breadcrumb from "@/components/ui/Breadcrumb";
import StockChart from "@/components/market/StockChart";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 1800;

interface EtfPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(etfSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: EtfPageProps): Promise<Metadata> {
  const { slug } = await params;
  const etf = await client
    .fetch<EtfEntry | null>(etfBySlugQuery, { slug })
    .catch(() => null);
  if (!etf) return { title: "ETF not found" };
  const t = etf.title;
  const d =
    etf.headline ||
    etf.summary ||
    `${etf.title} — what it tracks, MER, top holdings, and the editor's take on ${SITE_NAME}.`;
  return {
    title: t,
    description: d,
    alternates: { canonical: absoluteUrl(`/etfs/${slug}`) },
    openGraph: { title: t, description: d, type: "article" },
  };
}

export default async function EtfPage({ params }: EtfPageProps) {
  const { slug } = await params;
  const etf = await client
    .fetch<EtfEntry | null>(etfBySlugQuery, { slug })
    .catch(() => null);
  if (!etf) notFound();

  const symbol = etf.primaryTicker
    ? normalizeFinnhubSymbol(etf.primaryTicker)
    : null;
  const currency = symbol ? currencyForSymbol(symbol) : "USD";

  const [quote, candles] = await Promise.all([
    symbol ? getQuote(symbol) : Promise.resolve(null),
    symbol ? getCandles(symbol, "1M") : Promise.resolve([]),
  ]);

  const tone = !quote
    ? "flat"
    : quote.changePercent > 0
    ? "up"
    : quote.changePercent < 0
    ? "down"
    : "flat";

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "ETFs", href: "/etfs" }, { label: etf.title }]}
      />

      <header className="rounded-2xl border border-ink-700 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-700 text-ash-100">
              {etf.logo?.asset ? (
                <Image
                  src={urlFor(etf.logo).width(160).height(160).url()}
                  alt={`${etf.title} logo`}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Layers className="h-7 w-7 text-accent-400" />
              )}
            </div>
            <div>
              {etf.primaryTicker && (
                <div className="font-mono text-sm font-bold text-ash-200">
                  {etf.primaryTicker}
                </div>
              )}
              <h1 className="text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
                {etf.title}
              </h1>
              {etf.tracksIndexName && (
                <p className="mt-1 text-sm text-ash-300">
                  Tracks <span className="font-semibold text-ash-100">{etf.tracksIndexName}</span>
                </p>
              )}
            </div>
          </div>
          {quote && (
            <div className="flex items-end gap-6">
              <div className="text-right">
                <div className="font-mono text-3xl font-bold tabular-nums text-ash-50 sm:text-4xl">
                  {formatPrice(quote.price, currency)}
                </div>
                <div
                  className={cn(
                    "mt-1 inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums",
                    tone === "up" && "text-up-400",
                    tone === "down" && "text-down-400",
                    tone === "flat" && "text-ash-400"
                  )}
                >
                  {tone === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : tone === "down" ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : null}
                  {formatChange(quote.change, currency)} ({formatPercent(quote.changePercent)})
                </div>
              </div>
              {etf.primaryTicker && (
                <WatchlistButton symbol={etf.primaryTicker} variant="pill" />
              )}
            </div>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-700 pt-6 text-sm sm:grid-cols-4">
          <Stat label="MER" value={etf.merPercent != null ? `${etf.merPercent}%` : "—"} />
          <Stat label="Yield" value={etf.distributionYield != null ? `${etf.distributionYield}%` : "—"} />
          <Stat label="AUM" value={etf.aumLabel || "—"} />
          <Stat label="Currency" value={currency} />
        </dl>
      </header>

      {etf.headline && (
        <p className="mt-6 rounded-2xl border border-accent-500/30 bg-accent-500/5 p-5 text-lg leading-relaxed text-ash-50">
          {etf.headline}
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {symbol && candles.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                Price chart
              </h2>
              <StockChart
                symbol={symbol}
                initialCandles={candles}
                initialRange="1M"
                currency={currency}
              />
            </section>
          )}

          {etf.summary && (
            <section>
              <h2 className="mb-3 text-xl font-bold tracking-tight text-ash-50">
                What it is
              </h2>
              <p className="text-base leading-relaxed text-ash-200">
                {etf.summary}
              </p>
            </section>
          )}

          {etf.mechanics && (
            <section className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                How your money is invested
              </h3>
              <p className="mt-2 text-base leading-relaxed text-ash-200">
                {etf.mechanics}
              </p>
            </section>
          )}

          {etf.whoItsFor && (
            <section className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                Who it&rsquo;s for
              </h3>
              <p className="mt-2 text-base leading-relaxed text-ash-200">
                {etf.whoItsFor}
              </p>
            </section>
          )}

          {etf.topHoldings && etf.topHoldings.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold tracking-tight text-ash-50">
                Top holdings
              </h2>
              <ul className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/60 divide-y divide-ink-700">
                {etf.topHoldings.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span className="text-ash-100">{h.name}</span>
                    {h.weightPercent != null && (
                      <span className="font-mono font-semibold tabular-nums text-ash-300">
                        {h.weightPercent.toFixed(2)}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {etf.returnContext && (
            <section className="rounded-2xl border border-warn-500/30 bg-warn-500/5 p-5 text-sm leading-relaxed text-warn-100">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-warn-300">
                Historical context (not a prediction)
              </h3>
              <p className="mt-2">{etf.returnContext}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:col-span-1">
          {etf.listings && etf.listings.length > 0 && (
            <section className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                Listings
              </h3>
              <ul className="mt-3 space-y-2">
                {etf.listings.map((row, i) => (
                  <li
                    key={`${row.ticker}-${i}`}
                    className="flex items-baseline gap-2 text-sm"
                  >
                    <span className="rounded-md bg-ink-700 px-2 py-0.5 font-mono font-semibold text-ash-50">
                      {row.ticker}
                    </span>
                    <span className="text-ash-300">
                      {row.marketLabel}
                      {row.currency && ` · ${row.currency}`}
                      {row.note && (
                        <span className="text-ash-500"> — {row.note}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <Disclaimer variant="block" />
        </aside>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ash-500">{label}</dt>
      <dd className="mt-0.5 font-mono font-semibold tabular-nums text-ash-100">
        {value}
      </dd>
    </div>
  );
}
