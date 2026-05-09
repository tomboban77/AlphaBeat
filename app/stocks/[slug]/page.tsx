import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Globe,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { client } from "@/lib/sanity/client";
import {
  stockBySlugQuery,
  stockSlugsQuery,
  insightsByTickerQuery,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import {
  absoluteUrl,
  cn,
  currencyFor,
  displayTicker,
  formatChange,
  formatMarketCap,
  formatPercent,
  formatPrice,
  SITE_NAME,
} from "@/lib/utils";
import { getCandles, getCompanyProfile, getQuote } from "@/lib/market/finnhub";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";
import type { Insight, Stock } from "@/lib/types";

import Breadcrumb from "@/components/ui/Breadcrumb";
import SectorBadge from "@/components/sectors/SectorBadge";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import StockChart from "@/components/market/StockChart";
import PortableProse from "@/components/portable/PortableProse";
import StockGrid from "@/components/stocks/StockGrid";
import EtfCard from "@/components/etfs/EtfCard";
import InsightCard from "@/components/insights/InsightCard";
import SponsoredRibbon from "@/components/stocks/SponsoredRibbon";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

interface StockPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(stockSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: StockPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stock = await client
    .fetch<Stock | null>(stockBySlugQuery, { slug })
    .catch(() => null);
  if (!stock) return { title: "Stock not found" };

  const t = stock.metaTitle || `${displayTicker(stock.ticker)} (${stock.name})`;
  const d =
    stock.metaDescription ||
    stock.headline ||
    `${stock.name} (${displayTicker(stock.ticker)}) — live price, editor's take, bull and bear cases on ${SITE_NAME}.`;
  const url = absoluteUrl(`/stocks/${stock.slug.current}`);

  return {
    title: t,
    description: d,
    alternates: { canonical: url },
    openGraph: {
      title: t,
      description: d,
      url,
      type: "article",
    },
  };
}

export default async function StockPage({ params }: StockPageProps) {
  const { slug } = await params;
  const stock = await client
    .fetch<Stock | null>(stockBySlugQuery, { slug })
    .catch(() => null);
  if (!stock) notFound();

  const symbol = normalizeFinnhubSymbol(stock.ticker);
  const currency = currencyFor(stock.exchange);

  const [quote, profile, candles, relatedInsights] = await Promise.all([
    getQuote(stock.ticker),
    getCompanyProfile(stock.ticker),
    getCandles(stock.ticker, "1M"),
    client
      .fetch<Insight[]>(insightsByTickerQuery, { stockId: stock._id })
      .catch(() => []),
  ]);

  const tone = quote.changePercent > 0 ? "up" : quote.changePercent < 0 ? "down" : "flat";
  const sponsored = stock.sponsored && stock.sponsorship?.active;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    name: stock.name,
    tickerSymbol: stock.ticker,
    url: absoluteUrl(`/stocks/${stock.slug.current}`),
    logo: stock.logo?.asset
      ? urlFor(stock.logo).width(400).height(400).url()
      : profile?.logo,
    sameAs: profile?.weburl ? [profile.weburl] : undefined,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Coverage", href: "/screener" },
            ...(stock.sector
              ? [
                  {
                    label: stock.sector.title,
                    href: `/sectors/${stock.sector.slug.current}`,
                  },
                ]
              : []),
            { label: displayTicker(stock.ticker) },
          ]}
        />

        {/* ============ Header */}
        <header className="rounded-2xl border border-ink-700 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-700 text-xl font-bold text-ash-100">
                {stock.logo?.asset ? (
                  <Image
                    src={urlFor(stock.logo).width(160).height(160).url()}
                    alt={`${stock.name} logo`}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : profile?.logo ? (
                  <Image
                    src={profile.logo}
                    alt={`${stock.name} logo`}
                    width={64}
                    height={64}
                    className="h-full w-full object-contain bg-ink-900 p-1"
                    unoptimized
                  />
                ) : (
                  <span>{displayTicker(stock.ticker).slice(0, 2)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
                    {displayTicker(stock.ticker)}
                  </h1>
                  <span className="rounded-md bg-ink-700 px-2 py-0.5 text-xs font-semibold uppercase text-ash-300">
                    {stock.exchange}
                  </span>
                </div>
                <p className="mt-1 text-lg text-ash-200">{stock.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {stock.sector && <SectorBadge sector={stock.sector} />}
                  {stock.industry && (
                    <span className="text-ash-400">· {stock.industry}</span>
                  )}
                </div>
              </div>
            </div>

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
                  {quote.stale && (
                    <span className="ml-1 rounded bg-warn-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warn-300">
                      Sample
                    </span>
                  )}
                </div>
              </div>
              <WatchlistButton symbol={stock.ticker} variant="pill" />
            </div>
          </div>

          {/* Quick stats */}
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-700 pt-6 text-sm sm:grid-cols-4">
            <Stat label="Open" value={quote.open != null ? formatPrice(quote.open, currency) : "—"} />
            <Stat label="Day high" value={quote.high != null ? formatPrice(quote.high, currency) : "—"} />
            <Stat label="Day low" value={quote.low != null ? formatPrice(quote.low, currency) : "—"} />
            <Stat label="Prev close" value={quote.prevClose != null ? formatPrice(quote.prevClose, currency) : "—"} />
            {profile?.marketCap != null && (
              <Stat label="Market cap" value={formatMarketCap(profile.marketCap, profile.currency || currency)} />
            )}
            {stock.marketCapBand && (
              <Stat label="Cap band" value={
                ({ mega: "Mega", large: "Large", mid: "Mid", small: "Small", micro: "Micro" } as const)[
                  stock.marketCapBand
                ]
              } />
            )}
            {profile?.country && <Stat label="Country" value={profile.country} />}
            {profile?.ipo && <Stat label="IPO" value={profile.ipo} />}
          </dl>
        </header>

        {sponsored && stock.sponsorship && (
          <div className="mt-6">
            <SponsoredRibbon sponsorship={stock.sponsorship} ticker={stock.ticker} />
          </div>
        )}

        {/* ============ Two-col body */}
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {/* Chart */}
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

            {stock.headline && (
              <section className="rounded-2xl border border-accent-500/30 bg-accent-500/5 p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-300">
                  Editor&rsquo;s one-liner
                </div>
                <p className="mt-2 text-xl leading-snug text-ash-50">
                  {stock.headline}
                </p>
              </section>
            )}

            {stock.editorTake && stock.editorTake.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                  Editor&rsquo;s take
                </h2>
                <PortableProse value={stock.editorTake} size="md" />
              </section>
            )}

            {(stock.bullCase?.length || stock.bearCase?.length) && (
              <section className="grid gap-4 sm:grid-cols-2">
                {stock.bullCase && stock.bullCase.length > 0 && (
                  <div className="rounded-2xl border border-up-500/30 bg-up-500/5 p-5">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-up-400">
                      <TrendingUp className="h-3.5 w-3.5" /> Bull case
                    </div>
                    <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ash-200">
                      {stock.bullCase.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-up-400" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {stock.bearCase && stock.bearCase.length > 0 && (
                  <div className="rounded-2xl border border-down-500/30 bg-down-500/5 p-5">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-down-400">
                      <TrendingDown className="h-3.5 w-3.5" /> Risks &amp; bear case
                    </div>
                    <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ash-200">
                      {stock.bearCase.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-down-400" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {stock.catalysts && stock.catalysts.length > 0 && (
              <section className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                  <Calendar className="h-3.5 w-3.5" /> Upcoming catalysts
                </div>
                <ul className="mt-3 divide-y divide-ink-700">
                  {stock.catalysts.map((c, i) => (
                    <li
                      key={c._key || i}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <span className="text-ash-100">{c.label}</span>
                      <span className="font-mono text-xs text-ash-400">
                        {c.date}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {relatedInsights.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                  Insights mentioning {displayTicker(stock.ticker)}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedInsights.slice(0, 4).map((i) => (
                    <InsightCard key={i._id} insight={i} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-1">
            {profile?.weburl && (
              <a
                href={profile.weburl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-800/60 px-4 py-3 text-sm text-ash-200 hover:border-ink-500"
              >
                <span className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4 text-ash-400" />
                  Investor relations
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-ash-400" />
              </a>
            )}

            {stock.relatedEtfs && stock.relatedEtfs.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                  ETFs that hold {displayTicker(stock.ticker)}
                </h3>
                <div className="space-y-3">
                  {stock.relatedEtfs.slice(0, 4).map((etf) => (
                    <EtfCard key={etf._id} etf={etf} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            <Link
              href="/sponsor"
              className="block rounded-xl border border-warn-500/30 bg-warn-500/5 p-4 text-sm text-warn-200 transition-colors hover:border-warn-500/60"
            >
              <div className="font-semibold text-warn-300">
                IR teams: get listed
              </div>
              <p className="mt-1 text-xs leading-relaxed text-warn-200/80">
                Reach engaged investors. Every sponsored placement is clearly
                disclosed and runs alongside our independent editor&rsquo;s take.
              </p>
            </Link>

            <Disclaimer variant="block" />
          </aside>
        </div>

        {/* Related stocks */}
        {stock.relatedStocks && stock.relatedStocks.length > 0 && (
          <section className="mt-14 border-t border-ink-700 pt-10">
            <h2 className="mb-6 text-xl font-bold tracking-tight text-ash-50">
              Related tickers
            </h2>
            <StockGrid
              stocks={stock.relatedStocks.slice(0, 4)}
              withSparklines
              cols={4}
            />
          </section>
        )}
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
