import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Compass,
  ExternalLink,
  Flame,
  Newspaper,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { client } from "@/lib/sanity/client";
import {
  allPublishedStocksQuery,
  latestMarketNoteQuery,
} from "@/lib/sanity/queries";
import type { MarketNote, Stock, MarketQuote } from "@/lib/types";
import { absoluteUrl, cn, formatPercent, formatPrice } from "@/lib/utils";
import { getMarketNews } from "@/lib/market/finnhub";
import {
  classifyRegime,
  getIndicators,
  getMacroSignals,
  getSectorHeat,
  getTopMovers,
  type ComputedRegime,
} from "@/lib/market/pulse";

import Breadcrumb from "@/components/ui/Breadcrumb";
import Disclaimer from "@/components/ui/Disclaimer";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import PortableProse from "@/components/portable/PortableProse";
import SectorIcon, { ACCENT_RING } from "@/components/sectors/SectorIcon";

// 5-minute revalidation: quotes refresh, news refresh, but the static shell
// is cheap to regenerate. The classified regime stays consistent for visitors
// arriving within the same 5-minute window.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Market Pulse \u2014 Daily Read on Stocks, Sectors, and Macro",
  description:
    "AlphaBeat's daily market pulse: a one-line risk-on/risk-off read, live sector heat-map, top movers across our universe, and the macro narrative tying today's news to the sectors that should benefit or suffer.",
  alternates: { canonical: absoluteUrl("/pulse") },
  openGraph: {
    title: "Market Pulse \u2014 AlphaBeat",
    description:
      "A daily read on stocks, sectors, and macro. Updated every 5 minutes during market hours.",
    type: "website",
    url: absoluteUrl("/pulse"),
  },
};

const REGIME_STYLE: Record<ComputedRegime, {
  label: string;
  emoji: string;
  classes: string;
  ring: string;
  hint: string;
}> = {
  "risk-on": {
    label: "Risk-on",
    emoji: "",
    classes:
      "border-up-500/40 bg-up-500/10 text-up-200 from-up-500/15 via-ink-900 to-ink-900",
    ring: "ring-up-500/40",
    hint: "Buyers in control. Cyclicals and growth tend to lead, defensives lag.",
  },
  mixed: {
    label: "Mixed",
    emoji: "",
    classes:
      "border-warn-500/40 bg-warn-500/10 text-warn-200 from-warn-500/15 via-ink-900 to-ink-900",
    ring: "ring-warn-500/40",
    hint: "No conviction either way. Stock picking matters more than direction.",
  },
  "risk-off": {
    label: "Risk-off",
    emoji: "",
    classes:
      "border-down-500/40 bg-down-500/10 text-down-200 from-down-500/15 via-ink-900 to-ink-900",
    ring: "ring-down-500/40",
    hint: "Sellers in control. Defensives, treasuries, gold tend to lead.",
  },
};

function isFreshNote(note: MarketNote | null): boolean {
  if (!note) return false;
  if (note.pinned) return true;
  if (!note.publishedAt) return false;
  const published = new Date(note.publishedAt).getTime();
  if (Number.isNaN(published)) return false;
  const ageMs = Date.now() - published;
  return ageMs >= 0 && ageMs < 24 * 60 * 60 * 1000;
}

function effectiveRegime(
  computed: ComputedRegime,
  note: MarketNote | null
): ComputedRegime {
  if (note && isFreshNote(note) && note.regime && note.regime !== "auto") {
    if (
      note.regime === "risk-on" ||
      note.regime === "mixed" ||
      note.regime === "risk-off"
    ) {
      return note.regime;
    }
  }
  return computed;
}

function formatRelative(unixSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - unixSeconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default async function PulsePage() {
  const [universe, marketNote] = await Promise.all([
    client.fetch<Stock[]>(allPublishedStocksQuery).catch(() => []),
    client
      .fetch<MarketNote | null>(latestMarketNoteQuery)
      .catch(() => null),
  ]);

  const universeSymbols = universe.map((s) => s.ticker).filter(Boolean);

  const [indicators, sectorHeat, macros, news, movers] = await Promise.all([
    getIndicators(),
    getSectorHeat(),
    getMacroSignals(),
    getMarketNews("general", 12),
    getTopMovers(universeSymbols, 6),
  ]);

  const computedRegime = classifyRegime(indicators);
  const finalRegime = effectiveRegime(computedRegime.regime, marketNote);
  const regimeStyle = REGIME_STYLE[finalRegime];
  const showNote = isFreshNote(marketNote);

  const stockBySymbol = new Map<string, Stock>();
  for (const s of universe) {
    stockBySymbol.set(s.ticker.toUpperCase(), s);
  }

  return (
    <div className="bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Market Pulse" }]} />

        {/* ============================================================ HERO */}
        <header className="mt-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
            <Flame className="h-3.5 w-3.5" />
            Daily pulse
            <span className="text-ash-500">
              &middot; Updated every 5 minutes
            </span>
          </div>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl lg:text-5xl">
            Market Pulse
          </h1>
          <p className="mt-3 max-w-3xl text-ash-300">
            One screen, one read. Where the major indices closed, which
            sectors are hot or cold, what our editor thinks today&rsquo;s
            news means for the names you own, and the live headlines moving
            tape. Skim it before the open or check it at lunch.
          </p>
        </header>

        {/* ============================================================ REGIME BANNER */}
        <section
          className={cn(
            "relative mt-8 overflow-hidden rounded-3xl border bg-gradient-to-br p-6 sm:p-8",
            regimeStyle.classes
          )}
        >
          <div
            aria-hidden
            className={cn(
              "absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl",
              finalRegime === "risk-on"
                ? "bg-up-500/15"
                : finalRegime === "risk-off"
                ? "bg-down-500/15"
                : "bg-warn-500/15"
            )}
          />
          <div className="relative grid gap-6 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-ash-300">
                Today&rsquo;s read
              </div>
              <div
                className={cn(
                  "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-inset",
                  regimeStyle.ring
                )}
              >
                {finalRegime === "risk-on" && (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                )}
                {finalRegime === "risk-off" && (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {finalRegime === "mixed" && (
                  <Compass className="h-3.5 w-3.5" />
                )}
                {regimeStyle.label}
              </div>
              <p className="mt-4 text-balance text-2xl font-bold leading-snug tracking-tight text-ash-50 sm:text-3xl">
                {showNote && marketNote?.summary
                  ? marketNote.summary
                  : regimeStyle.hint}
              </p>
              <p className="mt-2 text-sm text-ash-300">
                {computedRegime.rationale}
                {showNote && marketNote && marketNote.regime !== "auto" && (
                  <span className="text-ash-500">
                    {" "}
                    &middot; Editor override active
                  </span>
                )}
              </p>
            </div>

            <div>
              <div className="rounded-2xl border border-ink-700/80 bg-ink-900/60 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ash-400">
                  Indices snapshot
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {indicators.map((row) => {
                    const dp = row.quote.changePercent;
                    const tone =
                      row.info.region === "vol"
                        ? dp > 0
                          ? "down"
                          : dp < 0
                          ? "up"
                          : "flat"
                        : dp > 0
                        ? "up"
                        : dp < 0
                        ? "down"
                        : "flat";
                    return (
                      <li
                        key={row.info.symbol}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-ash-300">{row.info.short}</span>
                        <span
                          className={cn(
                            "font-mono text-xs tabular-nums",
                            tone === "up" && "text-up-300",
                            tone === "down" && "text-down-300",
                            tone === "flat" && "text-ash-400"
                          )}
                        >
                          {formatPercent(dp)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ EDITOR'S NOTE */}
        {showNote && marketNote && (
          <section className="mt-10 rounded-3xl border border-accent-500/30 bg-gradient-to-br from-accent-500/5 via-ink-900 to-ink-900 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-300">
              <Sparkles className="h-3.5 w-3.5" />
              Editor&rsquo;s note
              <span className="text-ash-500">
                &middot;{" "}
                {new Date(marketNote.publishedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
              {marketNote.title}
            </h2>
            {marketNote.themes && marketNote.themes.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {marketNote.themes.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-ink-700 bg-ink-800/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ash-300"
                  >
                    {t.replace("-", " ")}
                  </li>
                ))}
              </ul>
            )}
            {marketNote.body && marketNote.body.length > 0 && (
              <div className="mt-5 max-w-3xl">
                <PortableProse value={marketNote.body} size="md" />
              </div>
            )}

            {marketNote.sectorReads && marketNote.sectorReads.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ash-400">
                  Sector reads
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {marketNote.sectorReads.map((read) => {
                    const isTail = read.direction === "tailwind";
                    const isHead = read.direction === "headwind";
                    return (
                      <li
                        key={read._key || read.sector._id}
                        className={cn(
                          "rounded-xl border p-4",
                          isTail && "border-up-500/30 bg-up-500/5",
                          isHead && "border-down-500/30 bg-down-500/5",
                          !isTail &&
                            !isHead &&
                            "border-ink-700 bg-ink-800/60"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset",
                              ACCENT_RING[read.sector.accent || "cyan"]
                            )}
                          >
                            <SectorIcon
                              icon={read.sector.icon}
                              className="h-3.5 w-3.5"
                            />
                          </span>
                          <span className="font-semibold text-ash-50">
                            {read.sector.title}
                          </span>
                          <span
                            className={cn(
                              "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              isTail && "bg-up-500/15 text-up-300",
                              isHead && "bg-down-500/15 text-down-300",
                              !isTail &&
                                !isHead &&
                                "bg-ink-700 text-ash-300"
                            )}
                          >
                            {isTail
                              ? "Tailwind"
                              : isHead
                              ? "Headwind"
                              : "Watch"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ash-300">
                          {read.rationale}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {marketNote.stockMentions &&
              marketNote.stockMentions.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ash-400">
                    Tickers worth watching today
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {marketNote.stockMentions.map((s) => (
                      <li key={s._id}>
                        <Link
                          href={`/stocks/${s.slug.current}`}
                          className="group inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-800/60 px-3 py-1 text-sm transition-colors hover:border-accent-500/50 hover:bg-ink-800"
                        >
                          <span className="font-mono font-semibold text-ash-50 group-hover:text-accent-200">
                            {s.ticker}
                          </span>
                          <span className="hidden text-xs text-ash-400 sm:inline">
                            {s.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </section>
        )}

        {/* ============================================================ SECTOR HEAT */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ash-50">
                Sector heat
              </h2>
              <p className="mt-1 text-sm text-ash-400">
                Today&rsquo;s % move in the SPDR sector ETF for each GICS
                sector. Hottest at the top.
              </p>
            </div>
            <Link
              href="/top"
              className="hidden text-sm font-semibold text-accent-300 hover:text-accent-200 sm:inline-flex sm:items-center sm:gap-1"
            >
              See top stocks by sector
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {sectorHeat.map((row) => {
              const dp = row.quote.changePercent;
              const isUp = dp > 0;
              const isDown = dp < 0;
              const intensity =
                Math.min(Math.abs(dp), 3) / 3; // 0-1 scaled
              const intensityCls = isUp
                ? intensity > 0.66
                  ? "border-up-500/60 bg-up-500/15"
                  : intensity > 0.33
                  ? "border-up-500/40 bg-up-500/10"
                  : "border-up-500/30 bg-up-500/5"
                : isDown
                ? intensity > 0.66
                  ? "border-down-500/60 bg-down-500/15"
                  : intensity > 0.33
                  ? "border-down-500/40 bg-down-500/10"
                  : "border-down-500/30 bg-down-500/5"
                : "border-ink-700 bg-ink-800/40";
              const Wrapper = row.tile.topSlug
                ? ({ children }: { children: React.ReactNode }) => (
                    <Link
                      href={`/top/${row.tile.topSlug}`}
                      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50"
                    >
                      {children}
                    </Link>
                  )
                : ({ children }: { children: React.ReactNode }) => (
                    <div>{children}</div>
                  );
              return (
                <Wrapper key={row.tile.etf}>
                  <article
                    className={cn(
                      "h-full rounded-xl border p-3 transition-colors",
                      intensityCls,
                      row.tile.topSlug && "group-hover:brightness-110"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset",
                          ACCENT_RING[row.tile.accent || "cyan"]
                        )}
                      >
                        <SectorIcon
                          icon={row.tile.icon}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="truncate text-sm font-semibold text-ash-50">
                        {row.tile.title}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "mt-3 font-mono text-2xl font-bold tabular-nums",
                        isUp && "text-up-300",
                        isDown && "text-down-300",
                        !isUp && !isDown && "text-ash-300"
                      )}
                    >
                      {formatPercent(dp)}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-ash-500">
                      <span className="font-mono">{row.tile.etf}</span>
                      {row.tile.topSlug && (
                        <span className="inline-flex items-center gap-0.5 text-accent-400">
                          Top picks
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </article>
                </Wrapper>
              );
            })}
          </div>
        </section>

        {/* ============================================================ MACRO SIGNALS */}
        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-ash-50">
              Macro signals
            </h2>
            <p className="mt-1 text-sm text-ash-400">
              Gold, oil, long bonds, and the dollar. Where the cross-asset
              tape is pointing today.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {macros.map((row) => {
              const dp = row.quote.changePercent;
              const isUp = dp > 0;
              const isDown = dp < 0;
              return (
                <article
                  key={row.tile.symbol}
                  className="rounded-xl border border-ink-700 bg-ink-800/40 p-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-ash-400">
                    {row.tile.label}
                  </div>
                  <div
                    className={cn(
                      "mt-2 font-mono text-xl font-bold tabular-nums",
                      isUp && "text-up-300",
                      isDown && "text-down-300",
                      !isUp && !isDown && "text-ash-300"
                    )}
                  >
                    {formatPercent(dp)}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-ash-500">
                    {row.tile.hint}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ============================================================ MOVERS + NEWS */}
        <section className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold tracking-tight text-ash-50">
              Today&rsquo;s movers
            </h2>
            <p className="mt-1 text-sm text-ash-400">
              The biggest %-moves across the {universeSymbols.length || 0}{" "}
              names AlphaBeat covers.
            </p>

            <div className="mt-4 space-y-5">
              <MoverList
                title="Gainers"
                tone="up"
                rows={movers.gainers}
                stockBySymbol={stockBySymbol}
              />
              <MoverList
                title="Losers"
                tone="down"
                rows={movers.losers}
                stockBySymbol={stockBySymbol}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-ash-50">
                  Headlines
                </h2>
                <p className="mt-1 text-sm text-ash-400">
                  Live market news. Tap a headline to read at the source.
                </p>
              </div>
              <span className="hidden items-center gap-1.5 text-[11px] uppercase tracking-wider text-ash-500 sm:inline-flex">
                <Newspaper className="h-3.5 w-3.5" />
                Updated every 10 min
              </span>
            </div>

            <ul className="mt-4 divide-y divide-ink-800 overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/40">
              {news.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-ash-400">
                  News feed temporarily unavailable. Check back in a moment.
                </li>
              ) : (
                news.map((n) => (
                  <li
                    key={n.id}
                    className="transition-colors hover:bg-ink-800/80"
                  >
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink-900 text-accent-300 ring-1 ring-inset ring-ink-700">
                        <Newspaper className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-sm font-semibold text-ash-100 group-hover:text-accent-200">
                          {n.headline}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-ash-500">
                          {n.source && (
                            <span className="font-medium text-ash-400">
                              {n.source}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelative(n.publishedAt)}
                          </span>
                          {n.related && (
                            <span className="rounded bg-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-ash-300">
                              {n.related.split(",").slice(0, 2).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-ash-500" />
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        {/* ============================================================ NEWSLETTER + DISCLAIMER */}
        <section className="mt-12">
          <NewsletterCTA
            source="pulse-bottom"
            variant="banner"
            eyebrow="Stay sharp"
            title={`The "What I\u2019m Watching" read \u2014 in your inbox.`}
            description="Subscribers get the editor's daily macro read in plain English, alongside the Sunday Top 10. The web shows the data; the email shows the conviction."
          />
        </section>

        <div className="mt-10 flex items-start gap-2 rounded-xl border border-ink-700 bg-ink-800/40 p-4 text-sm text-ash-400">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn-300" />
          <div>
            <p className="font-semibold text-ash-200">How to read this page</p>
            <p className="mt-1 leading-relaxed">
              The regime label is a heuristic, not a forecast. Sector tiles
              use SPDR ETFs as proxies. Quotes may be 15&ndash;20 minutes
              delayed depending on data source. AlphaBeat is an educational
              publication &mdash; nothing here is investment advice. Always
              verify with your broker before acting.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Disclaimer variant="block" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers / sub-components
// ============================================================================

interface MoverListProps {
  title: string;
  tone: "up" | "down";
  rows: { symbol: string; quote: MarketQuote }[];
  stockBySymbol: Map<string, Stock>;
}

function MoverList({ title, tone, rows, stockBySymbol }: MoverListProps) {
  return (
    <div>
      <div
        className={cn(
          "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider",
          tone === "up" ? "text-up-300" : "text-down-300"
        )}
      >
        {tone === "up" ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        )}
        {title}
      </div>
      <ul className="overflow-hidden rounded-xl border border-ink-700 bg-ink-800/40 divide-y divide-ink-700">
        {rows.length === 0 ? (
          <li className="px-3 py-4 text-center text-xs text-ash-500">
            No qualifying movers right now.
          </li>
        ) : (
          rows.map((row) => {
            const stock = stockBySymbol.get(row.symbol.toUpperCase());
            const dp = row.quote.changePercent;
            const inner = (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-bold text-ash-50">
                    {stock?.ticker || row.symbol}
                  </div>
                  <div className="truncate text-[11px] text-ash-500">
                    {stock?.name || row.symbol}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "font-mono text-sm font-semibold tabular-nums",
                      tone === "up" ? "text-up-300" : "text-down-300"
                    )}
                  >
                    {formatPercent(dp)}
                  </div>
                  <div className="font-mono text-[11px] tabular-nums text-ash-500">
                    {formatPrice(row.quote.price, row.quote.currency || "USD")}
                  </div>
                </div>
              </div>
            );
            return (
              <li key={row.symbol}>
                {stock ? (
                  <Link
                    href={`/stocks/${stock.slug.current}`}
                    className="block transition-colors hover:bg-ink-800/80"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div>{inner}</div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
