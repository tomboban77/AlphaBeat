import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Flame,
  Target,
} from "lucide-react";

import { client } from "@/lib/sanity/client";
import {
  weeklyPickBySlugQuery,
  weeklyPickSlugsQuery,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Conviction, Horizon, WeeklyPick } from "@/lib/types";
import {
  absoluteUrl,
  cn,
  currencyFor,
  displayTicker,
  formatDate,
  formatPercent,
  formatPrice,
  SITE_NAME,
} from "@/lib/utils";
import { getQuotes } from "@/lib/market/finnhub";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";

import Breadcrumb from "@/components/ui/Breadcrumb";
import SectorBadge from "@/components/sectors/SectorBadge";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import PortableProse from "@/components/portable/PortableProse";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

interface PickPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client
    .fetch<string[]>(weeklyPickSlugsQuery)
    .catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PickPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pick = await client
    .fetch<WeeklyPick | null>(weeklyPickBySlugQuery, { slug })
    .catch(() => null);
  if (!pick) return { title: "Weekly pick not found" };
  const t = pick.title;
  const d = `Top 10 stocks for the week of ${formatDate(pick.weekOf)} on ${SITE_NAME} — full thesis, conviction, and time horizon for each pick.`;
  return {
    title: t,
    description: d,
    alternates: { canonical: absoluteUrl(`/weekly-picks/${slug}`) },
    openGraph: { title: t, description: d, type: "article" },
  };
}

const HORIZON_LABEL: Record<Horizon, string> = {
  short: "Short term",
  medium: "Medium term",
  long: "Long term",
};

const CONVICTION_BADGE: Record<Conviction, { label: string; cls: string }> = {
  low: { label: "Low conviction", cls: "bg-ink-700 text-ash-300 ring-ink-500" },
  medium: { label: "Medium conviction", cls: "bg-accent-500/10 text-accent-300 ring-accent-500/30" },
  high: { label: "High conviction", cls: "bg-up-500/10 text-up-400 ring-up-500/30" },
};

export default async function WeeklyPickPage({ params }: PickPageProps) {
  const { slug } = await params;
  const pick = await client
    .fetch<WeeklyPick | null>(weeklyPickBySlugQuery, { slug })
    .catch(() => null);
  if (!pick) notFound();

  const symbols = (pick.picks || []).map((p) => p.stock.ticker);
  const quoteMap = await getQuotes(symbols);

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Weekly Top 10", href: "/weekly-picks" },
          { label: formatDate(pick.weekOf) },
        ]}
      />

      {/* Hero */}
      <header className="rounded-2xl border border-accent-500/30 bg-gradient-to-br from-ink-900 via-ink-800 to-accent-950 p-6 sm:p-10">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/15 px-2.5 py-1 font-semibold uppercase tracking-wider text-accent-300 ring-1 ring-inset ring-accent-500/30">
            <Flame className="h-3 w-3" /> Top 10 picks
          </span>
          <span className="inline-flex items-center gap-1 text-ash-400">
            <Calendar className="h-3 w-3" /> Week of {formatDate(pick.weekOf)}
          </span>
        </div>
        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl lg:text-5xl">
          {pick.title}
        </h1>
        {pick.author?.name && (
          <p className="mt-3 text-sm text-ash-300">
            by{" "}
            <span className="font-semibold text-ash-100">
              {pick.author.name}
            </span>
            {pick.author.credentials && (
              <span className="text-ash-500"> · {pick.author.credentials}</span>
            )}
          </p>
        )}
      </header>

      {pick.heroImage?.asset && (
        <div className="relative mt-6 aspect-[2/1] overflow-hidden rounded-2xl border border-ink-700">
          <Image
            src={urlFor(pick.heroImage).width(1600).height(800).url()}
            alt={pick.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1024px"
            priority
          />
        </div>
      )}

      {pick.intro && pick.intro.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
            Market read
          </h2>
          <PortableProse value={pick.intro} size="lg" />
        </section>
      )}

      <section className="mt-12 space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-ash-50">
            The picks
          </h2>
          <span className="text-sm text-ash-500">
            {pick.picks?.length || 0} stocks · ranked
          </span>
        </div>

        {(pick.picks || []).map((row, idx) => {
          const stock = row.stock;
          const sym = normalizeFinnhubSymbol(stock.ticker);
          const quote = quoteMap.get(sym);
          const tone = !quote
            ? "flat"
            : quote.changePercent > 0
            ? "up"
            : quote.changePercent < 0
            ? "down"
            : "flat";
          const currency = currencyFor(stock.exchange);
          const conviction = row.conviction || "medium";
          const horizon = row.horizon || "medium";

          return (
            <article
              key={row._key || idx}
              className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5 transition-colors hover:border-ink-500 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-500 font-mono text-lg font-bold text-ink-950">
                  #{idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/stocks/${stock.slug.current}`}
                        className="group inline-flex items-center gap-2"
                      >
                        <span className="font-mono text-xl font-bold text-ash-50 group-hover:text-accent-300">
                          {displayTicker(stock.ticker)}
                        </span>
                        <span className="rounded bg-ink-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ash-300">
                          {stock.exchange}
                        </span>
                        <ChevronRight className="h-4 w-4 text-ash-500 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                      <p className="mt-0.5 text-sm text-ash-300">
                        {stock.name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        {stock.sector && <SectorBadge sector={stock.sector} />}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${CONVICTION_BADGE[conviction].cls}`}
                        >
                          <Target className="h-2.5 w-2.5" />
                          {CONVICTION_BADGE[conviction].label}
                        </span>
                        <span className="rounded-full bg-ink-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ash-300">
                          {HORIZON_LABEL[horizon]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end gap-3">
                      {quote && (
                        <div className="text-right">
                          <div className="font-mono font-semibold tabular-nums text-ash-100">
                            {formatPrice(quote.price, currency)}
                          </div>
                          <div
                            className={cn(
                              "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
                              tone === "up" && "text-up-400",
                              tone === "down" && "text-down-400",
                              tone === "flat" && "text-ash-400"
                            )}
                          >
                            {tone === "up" ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : tone === "down" ? (
                              <ArrowDownRight className="h-3 w-3" />
                            ) : null}
                            {formatPercent(quote.changePercent)}
                          </div>
                        </div>
                      )}
                      <WatchlistButton symbol={stock.ticker} />
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ash-200">
                    {row.thesis}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <div className="mt-12">
        <Disclaimer variant="block" />
      </div>
    </article>
  );
}
