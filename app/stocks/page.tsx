import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Crown,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { client } from "@/lib/sanity/client";
import {
  featuredStockQuery,
  insightsByTickerQuery,
} from "@/lib/sanity/queries";
import type { Stock, Insight } from "@/lib/types";
import { urlFor } from "@/lib/sanity/image";
import {
  absoluteUrl,
  cn,
  currencyFor,
  displayTicker,
  formatPercent,
  formatPrice,
  formatMarketCap,
  RISK_CLASSES,
  RISK_LABEL,
  SITE_NAME,
  type RiskTone,
} from "@/lib/utils";
import {
  getCandles,
  getCompanyProfile,
  getQuote,
} from "@/lib/market/finnhub";

import Breadcrumb from "@/components/ui/Breadcrumb";
import SectorBadge from "@/components/sectors/SectorBadge";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import PortableProse from "@/components/portable/PortableProse";
import StockChart from "@/components/market/StockChart";
import InsightCard from "@/components/insights/InsightCard";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Featured Stock — the editor's spotlight pick",
  description: `${SITE_NAME}'s editor-led stock of the spotlight. One company at a time — what it does, why it matters, and what could go wrong.`,
  alternates: { canonical: absoluteUrl("/stocks") },
};

export default async function FeaturedStockPage() {
  const featured = await client
    .fetch<Stock | null>(featuredStockQuery)
    .catch(() => null);

  if (!featured) {
    // Empty state: no stock has `featured: true` yet.
    return <EmptyState />;
  }

  const sym = featured.ticker;
  const [quote, candles, profile, related] = await Promise.all([
    getQuote(sym),
    getCandles(sym, "1M"),
    getCompanyProfile(sym),
    client
      .fetch<Insight[]>(insightsByTickerQuery, { stockId: featured._id })
      .catch(() => []),
  ]);

  const tone =
    !quote
      ? "flat"
      : quote.changePercent > 0
      ? "up"
      : quote.changePercent < 0
      ? "down"
      : "flat";
  const currency = quote?.currency || currencyFor(featured.exchange);
  const risk = featured.riskScore as RiskTone | undefined;

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Featured stock" }]} />

      {/* ====================================================== HERO */}
      <header className="relative mb-10 overflow-hidden rounded-3xl border border-accent-500/30 bg-gradient-to-br from-ink-900 via-ink-900 to-accent-950/40 p-6 sm:p-10">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_15%_85%,rgba(167,139,250,0.10),transparent_55%)]"
        />

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <span className="inline-flex items-center gap-1 rounded-full border border-accent-400/40 bg-accent-500/15 px-2.5 py-1 text-accent-200">
            <Crown className="h-3 w-3" />
            Editor&rsquo;s Spotlight
          </span>
          {featured.sector && (
            <Link
              href={`/sectors/${featured.sector.slug.current}`}
              className="rounded-full border border-ink-600 bg-ink-800/80 px-2.5 py-1 text-ash-300 hover:text-ash-50"
            >
              {featured.sector.title}
            </Link>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-800 ring-1 ring-inset ring-ink-700">
              {featured.logo?.asset ? (
                <Image
                  src={urlFor(featured.logo).width(120).height(120).url()}
                  alt={`${featured.name} logo`}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-ash-200">
                  {displayTicker(featured.ticker).slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-mono text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
                {displayTicker(featured.ticker)}
              </h1>
              <p className="text-sm text-ash-400">
                {featured.name} · {featured.exchange}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-end gap-4">
            <div>
              <div className="font-mono text-3xl font-bold tabular-nums text-ash-50">
                {quote ? formatPrice(quote.price, currency) : "—"}
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
                  tone === "up" && "text-up-400",
                  tone === "down" && "text-down-400",
                  tone === "flat" && "text-ash-500"
                )}
              >
                {tone === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : tone === "down" ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : null}
                {quote ? formatPercent(quote.changePercent) : "—"}
                {quote?.stale && (
                  <span className="ml-1 rounded bg-warn-500/20 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-warn-300">
                    sample
                  </span>
                )}
              </div>
            </div>
            <WatchlistButton symbol={featured.ticker} variant="pill" />
          </div>
        </div>

        {featured.headline && (
          <p className="mt-6 max-w-3xl text-balance text-lg leading-relaxed text-ash-100 sm:text-xl">
            &ldquo;{featured.headline}&rdquo;
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/stocks/${featured.slug.current}`}
            className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-lg shadow-accent-500/30 hover:bg-accent-400"
          >
            Read the full deep-dive
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/screener"
            className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800/80 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
          >
            <Search className="h-4 w-4" />
            Browse all coverage
          </Link>
        </div>
      </header>

      {/* ============================================ WHAT THE COMPANY DOES */}
      <section className="mb-10 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-ink-700 bg-ink-800/40 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ash-400">
            <Sparkles className="h-4 w-4 text-accent-300" />
            What {featured.name} does
          </div>
          {featured.industry && (
            <p className="mt-3 text-base leading-relaxed text-ash-200">
              {featured.name} is a{" "}
              <span className="font-semibold text-ash-50">{featured.industry}</span>{" "}
              business listed on {featured.exchange}
              {featured.country === "CA" ? " (Canada)" : featured.country === "US" ? " (United States)" : ""}.
            </p>
          )}
          {profile?.weburl && (
            <p className="mt-2 text-sm text-ash-400">
              Investor site:{" "}
              <a
                href={profile.weburl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-accent-300 hover:text-accent-200"
              >
                {new URL(profile.weburl).hostname.replace(/^www\./, "")}
              </a>
            </p>
          )}

          {featured.editorTake && featured.editorTake.length > 0 ? (
            <div className="mt-5">
              <PortableProse value={featured.editorTake} size="md" />
            </div>
          ) : (
            <p className="mt-5 text-sm text-ash-400">
              Editor&rsquo;s long-form take is on the{" "}
              <Link
                href={`/stocks/${featured.slug.current}`}
                className="font-semibold text-accent-300 hover:text-accent-200"
              >
                full deep-dive page
              </Link>
              .
            </p>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-ash-400">
              Quick facts
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Ticker" value={displayTicker(featured.ticker)} mono />
              <Row label="Exchange" value={featured.exchange} />
              {featured.industry && <Row label="Industry" value={featured.industry} />}
              {profile?.marketCap != null && profile.marketCap > 0 && (
                <Row label="Market cap" value={formatMarketCap(profile.marketCap, currency)} />
              )}
              {profile?.ipo && <Row label="IPO" value={profile.ipo} />}
              {risk && (
                <Row
                  label="Risk score"
                  value={
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
                        RISK_CLASSES[risk]
                      )}
                    >
                      {RISK_LABEL[risk]}
                    </span>
                  }
                />
              )}
            </dl>
          </div>

          {featured.sector && (
            <Link
              href={`/sectors/${featured.sector.slug.current}`}
              className="block rounded-2xl border border-ink-700 bg-ink-800/40 p-5 transition-colors hover:border-accent-500/40 hover:bg-ink-800"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-ash-400">
                Sector
              </div>
              <div className="mt-2 flex items-center justify-between">
                <SectorBadge sector={featured.sector} />
                <ArrowRight className="h-4 w-4 text-ash-500" />
              </div>
              <p className="mt-2 text-xs text-ash-500">
                See all {featured.sector.title.toLowerCase()} coverage
              </p>
            </Link>
          )}
        </aside>
      </section>

      {/* ====================================================== LIVE CHART */}
      <section className="mb-10 rounded-2xl border border-ink-700 bg-ink-800/40 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ash-400">
              Live price action
            </div>
            <h2 className="text-xl font-bold text-ash-50">
              How {displayTicker(featured.ticker)} has been trading
            </h2>
          </div>
        </div>
        <StockChart
          symbol={featured.ticker}
          initialRange="1M"
          initialCandles={candles}
          currency={currency}
        />
      </section>

      {/* ============================================== BULL + BEAR + CATA */}
      {(featured.bullCase?.length || featured.bearCase?.length) && (
        <section className="mb-10 grid gap-5 sm:grid-cols-2">
          {featured.bullCase && featured.bullCase.length > 0 && (
            <div className="rounded-2xl border border-up-500/30 bg-up-500/5 p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-up-300">
                <TrendingUp className="h-4 w-4" />
                Bull case
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ash-200">
                {featured.bullCase.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-up-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {featured.bearCase && featured.bearCase.length > 0 && (
            <div className="rounded-2xl border border-down-500/30 bg-down-500/5 p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-down-300">
                <TrendingDown className="h-4 w-4" />
                Bear case &amp; risks
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ash-200">
                {featured.bearCase.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-down-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ====================================================== CATALYSTS */}
      {featured.catalysts && featured.catalysts.length > 0 && (
        <section className="mb-10 rounded-2xl border border-ink-700 bg-ink-800/40 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ash-400">
            <Calendar className="h-4 w-4 text-accent-300" />
            Upcoming catalysts
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.catalysts.map((c, i) => (
              <li
                key={c._key || i}
                className="rounded-lg border border-ink-700 bg-ink-900/60 p-3"
              >
                <div className="text-xs font-medium uppercase tracking-wider text-accent-300">
                  {c.date || "Upcoming"}
                </div>
                <div className="mt-1 text-sm text-ash-100">{c.label}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-10 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-accent-500/30 bg-accent-500/5 p-6 text-center">
        <div>
          <div className="text-base font-semibold text-ash-50">
            Want the full thesis?
          </div>
          <p className="mt-1 text-sm text-ash-400">
            The editor&rsquo;s long-form take, every catalyst, related insights, and
            peer ETFs live on the deep-dive page.
          </p>
        </div>
        <Link
          href={`/stocks/${featured.slug.current}`}
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
        >
          Read the full deep-dive
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* ============================================== RELATED INSIGHTS */}
      {related.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-ash-50">
            Recent coverage of {displayTicker(featured.ticker)}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((insight) => (
              <InsightCard key={insight._id} insight={insight} />
            ))}
          </div>
        </section>
      )}

      <Disclaimer variant="block" />
    </article>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ash-500">{label}</dt>
      <dd className={cn("text-right text-ash-100", mono && "font-mono tabular-nums")}>
        {value}
      </dd>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="inline-flex items-center gap-1 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-300">
        <Crown className="h-3.5 w-3.5" />
        Featured stock
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
        No stock featured yet.
      </h1>
      <p className="mt-3 text-ash-400">
        Toggle <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-xs text-accent-200">featured: true</code> on a Stock document in
        Studio to feature it here. Until then, browse our coverage in the screener.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/screener"
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
        >
          Open the screener
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/weekly-picks"
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
        >
          See this week&rsquo;s Top 10
        </Link>
      </div>
    </div>
  );
}
