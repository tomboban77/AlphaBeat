import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Globe,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { client } from "@/lib/sanity/client";
import {
  stockFileBySlugQuery,
  stockFileSlugsQuery,
  stockFilesBySectorQuery,
  latestScoreSnapshotQuery,
} from "@/lib/sanity/queries";
import {
  absoluteUrl,
  cn,
  currencyFor,
  displayTicker,
  formatChange,
  formatMarketCap,
  formatPercent,
  formatPrice,
  formatDate,
  SITE_NAME,
} from "@/lib/utils";
import { getCandles, getCompanyProfile, getQuote } from "@/lib/market/finnhub";
import type { StockFile } from "@/lib/types";
import { buildScore } from "@/lib/scoring";

import Breadcrumb from "@/components/ui/Breadcrumb";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import StockChart from "@/components/market/StockChart";
import StockCard from "@/components/stocks/StockCard";
import ScoreDisplay from "@/components/scoring/ScoreDisplay";
import AccountFitTable from "@/components/scoring/AccountFitTable";
import { StockFileTracker } from "@/components/analytics/PageTracker";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(stockFileSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sf = await client.fetch<StockFile | null>(stockFileBySlugQuery, { slug }).catch(() => null);
  if (!sf) return { title: "Stock not found" };

  const t = `${sf.ticker} — ${sf.companyName} | ${SITE_NAME}`;
  const d = `${sf.companyName} (${sf.ticker}) scored on value, growth, quality, dividend safety, momentum, and Canadian tax efficiency. AlphaBeat Stock File.`;
  const url = absoluteUrl(`/stocks/${sf.slug.current}`);

  return {
    title: t,
    description: d,
    alternates: { canonical: url },
    openGraph: { title: t, description: d, url, type: "article" },
  };
}

export default async function StockFilePage({ params }: PageProps) {
  const { slug } = await params;
  const sf = await client.fetch<StockFile | null>(stockFileBySlugQuery, { slug }).catch(() => null);
  if (!sf) notFound();

  const apiSymbol = sf.finnhubSymbol || sf.ticker;
  const currency = currencyFor(sf.exchange);

  const [quote, profile, candles, related, snapshot] = await Promise.all([
    getQuote(apiSymbol),
    getCompanyProfile(apiSymbol),
    getCandles(apiSymbol, "5Y"),
    client
      .fetch<StockFile[]>(stockFilesBySectorQuery, {
        sector: sf.sectorLabel,
        excludeSlug: slug,
      })
      .catch(() => [] as StockFile[]),
    client
      .fetch(latestScoreSnapshotQuery, { ticker: sf.ticker })
      .catch(() => null),
  ]);

  const tone  = quote.changePercent > 0 ? "up" : quote.changePercent < 0 ? "down" : "flat";
  const score = buildScore(sf.editorScoreOverrides, snapshot ?? undefined);

  const isCanadian = sf.exchange === "TSX" || sf.exchange === "TSXV";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: sf.companyName,
    tickerSymbol: sf.ticker,
    url: absoluteUrl(`/stocks/${sf.slug.current}`),
    description: sf.canadianInvestorParagraph,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <StockFileTracker ticker={sf.ticker} sectorLabel={sf.sectorLabel} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Stock Files", href: "/stocks" },
            { label: sf.sectorLabel },
            { label: sf.ticker },
          ]}
        />

        {/* ── Header band ─────────────────────────────────────────────────── */}
        <header className="rounded-2xl border border-ink-700 bg-linear-to-br from-ink-900 via-ink-800 to-ink-900 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              {profile?.logo && (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-700">
                  <Image
                    src={profile.logo}
                    alt={`${sf.companyName} logo`}
                    width={64}
                    height={64}
                    className="h-full w-full object-contain bg-ink-900 p-1"
                    unoptimized
                  />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-mono text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
                    {sf.ticker}
                  </h1>
                  <span className="flex items-center gap-1 rounded-md bg-ink-700 px-2 py-0.5 text-xs font-semibold uppercase text-ash-300">
                    {isCanadian && <span aria-label="Canadian listing">🇨🇦</span>}
                    {sf.exchange}
                  </span>
                  <span className="rounded-full border border-ink-600 bg-ink-800/80 px-2.5 py-0.5 text-xs text-ash-400">
                    {sf.sectorLabel}
                  </span>
                </div>
                <p className="mt-1 text-lg text-ash-200">{sf.companyName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ash-500">
                  <span>
                    Last reviewed: {formatDate(sf.lastReviewed)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-inset",
                      sf.reviewType === "deep"
                        ? "bg-accent-500/10 text-accent-300 ring-accent-500/30"
                        : "bg-ink-700 text-ash-400 ring-ink-600"
                    )}
                  >
                    {sf.reviewType === "deep" ? "Deep review" : "Quick check"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <div className="text-right">
                <div className="font-mono text-3xl font-bold tabular-nums text-ash-50 sm:text-4xl">
                  {formatPrice(quote.price, currency)}
                </div>
                <div
                  className={cn(
                    "mt-1 inline-flex items-center gap-1 text-sm font-semibold tabular-nums",
                    tone === "up" && "text-up-400",
                    tone === "down" && "text-down-400",
                    tone === "flat" && "text-ash-400"
                  )}
                >
                  {tone === "up" ? <ArrowUpRight className="h-4 w-4" /> : tone === "down" ? <ArrowDownRight className="h-4 w-4" /> : null}
                  {formatChange(quote.change, currency)} ({formatPercent(quote.changePercent)})
                  {quote.stale && (
                    <span className="ml-1 rounded bg-warn-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warn-300">
                      Sample
                    </span>
                  )}
                </div>
                {profile?.marketCap && profile.marketCap > 0 && (
                  <div className="mt-1 text-xs text-ash-500">
                    Mkt cap: {formatMarketCap(profile.marketCap, currency)}
                  </div>
                )}
              </div>
              <WatchlistButton symbol={sf.ticker} variant="pill" />
            </div>
          </div>
        </header>

        {/* ── Main grid ───────────────────────────────────────────────────── */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left / main column */}
          <div className="space-y-8 lg:col-span-2">

            {/* Score */}
            <ScoreDisplay score={score} />

            {/* 5-year chart */}
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                5-year price history
              </h2>
              <StockChart
                symbol={apiSymbol}
                initialCandles={candles}
                initialRange="5Y"
                currency={currency}
              />
            </section>

            {/* Bull / Bear */}
            {(sf.bullCase?.length || sf.bearCase?.length) && (
              <section className="grid gap-4 sm:grid-cols-2">
                {sf.bullCase && sf.bullCase.length > 0 && (
                  <div className="rounded-2xl border border-up-500/30 bg-up-500/5 p-5">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-up-400">
                      <TrendingUp className="h-3.5 w-3.5" /> Bull case
                    </div>
                    <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ash-200">
                      {sf.bullCase.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-up-400" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {sf.bearCase && sf.bearCase.length > 0 && (
                  <div className="rounded-2xl border border-down-500/30 bg-down-500/5 p-5">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-down-400">
                      <TrendingDown className="h-3.5 w-3.5" /> Bear case
                    </div>
                    <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ash-200">
                      {sf.bearCase.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-down-400" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Why a Canadian investor might own this */}
            {sf.canadianInvestorParagraph && (
              <section className="rounded-2xl border border-accent-500/20 bg-accent-500/5 p-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
                  Why a Canadian investor might own this
                </div>
                <p className="text-sm leading-relaxed text-ash-200">{sf.canadianInvestorParagraph}</p>
              </section>
            )}

            {/* Account Fit */}
            <AccountFitTable accountFit={sf.accountFit} />

            {/* Subscribe CTA */}
            <NewsletterCTA source="stock-file" variant="banner" />
          </div>

          {/* Right sidebar */}
          <aside className="space-y-5 lg:col-span-1">
            {/* Quick facts */}
            <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">Quick facts</div>
              <dl className="space-y-2 text-sm">
                <Row label="Ticker" value={displayTicker(sf.ticker)} mono />
                <Row label="Exchange" value={sf.exchange} />
                <Row label="Sector" value={sf.sectorLabel} />
                {profile?.country && <Row label="Country" value={profile.country} />}
                {profile?.ipo && <Row label="IPO" value={profile.ipo} />}
                {profile?.marketCap && profile.marketCap > 0 && (
                  <Row label="Market cap" value={formatMarketCap(profile.marketCap, currency)} />
                )}
              </dl>
            </div>

            {/* Affiliate slot — dormant placeholder */}
            <div className="rounded-2xl border border-ink-600/50 bg-ink-800/30 p-5 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-ash-500">Open an account</div>
              <p className="mt-2 text-xs leading-relaxed text-ash-500">
                {isCanadian
                  ? "Buy this stock on Wealthsimple or Questrade — both offer commission-free TSX trading."
                  : "Available on Wealthsimple and Questrade."}
              </p>
              <p className="mt-2 text-[10px] text-ash-600">Affiliate links coming soon.</p>
            </div>

            {/* IR link */}
            {profile?.weburl && (
              <a
                href={profile.weburl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-800/60 px-4 py-3 text-sm text-ash-200 transition-colors hover:border-ink-500"
              >
                <span className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4 text-ash-400" />
                  Investor relations
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-ash-400" />
              </a>
            )}

            <Disclaimer variant="block" />
          </aside>
        </div>

        {/* Related Stock Files */}
        {related.length > 0 && (
          <section className="mt-14 border-t border-ink-700 pt-10">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-xl font-bold tracking-tight text-ash-50">
                More from {sf.sectorLabel}
              </h2>
              <Link href="/stocks" className="text-sm font-semibold text-accent-300 hover:text-accent-200">
                All Stock Files <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {related.map((r) => (
                <StockCard key={r._id} stock={r as unknown as import("@/lib/types").Stock} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ash-500">{label}</dt>
      <dd className={cn("text-right text-ash-100", mono && "font-mono tabular-nums")}>{value}</dd>
    </div>
  );
}
