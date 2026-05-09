import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Trophy,
  Star,
  TrendingUp,
  Eye,
  AlertTriangle,
} from "lucide-react";

import { client } from "@/lib/sanity/client";
import {
  topListBySlugQuery,
  topListSlugsQuery,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { TopList, TopVerdict } from "@/lib/types";
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
import SectorIcon, {
  ACCENT_BORDER,
  ACCENT_RING,
} from "@/components/sectors/SectorIcon";

export const revalidate = 1800;

interface TopListPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client
    .fetch<string[]>(topListSlugsQuery)
    .catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: TopListPageProps): Promise<Metadata> {
  const { slug } = await params;
  const list = await client
    .fetch<TopList | null>(topListBySlugQuery, { slug })
    .catch(() => null);
  if (!list) return { title: "Top list not found" };
  const t = list.metaTitle || list.title;
  const d =
    list.metaDescription ||
    list.subtitle ||
    `Editor-led top stocks in ${list.sector.title} on ${SITE_NAME}.`;
  return {
    title: t,
    description: d,
    alternates: { canonical: absoluteUrl(`/top/${slug}`) },
    openGraph: { title: t, description: d, type: "article" },
  };
}

const VERDICT_BADGE: Record<TopVerdict, { label: string; cls: string; icon: React.ReactNode }> = {
  "top-pick": {
    label: "Top pick",
    cls: "bg-accent-500/15 text-accent-200 ring-accent-500/30",
    icon: <Trophy className="h-3 w-3" />,
  },
  "buy-weakness": {
    label: "Buy on weakness",
    cls: "bg-up-500/15 text-up-300 ring-up-500/30",
    icon: <TrendingUp className="h-3 w-3" />,
  },
  watchlist: {
    label: "Watchlist",
    cls: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
    icon: <Eye className="h-3 w-3" />,
  },
  speculative: {
    label: "Speculative",
    cls: "bg-warn-500/15 text-warn-300 ring-warn-500/30",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

export default async function TopListDetailPage({ params }: TopListPageProps) {
  const { slug } = await params;
  const list = await client
    .fetch<TopList | null>(topListBySlugQuery, { slug })
    .catch(() => null);

  if (!list) notFound();

  const symbols = (list.picks ?? []).map((p) => p.stock.ticker).filter(Boolean);
  const quoteMap = await getQuotes(symbols);

  const accent = list.sector?.accent || "cyan";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: list.title,
    description: list.subtitle,
    url: absoluteUrl(`/top/${slug}`),
    dateModified: list.lastUpdated,
    itemListElement: (list.picks ?? []).map((row, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${row.stock.ticker} ${row.stock.name}`,
      url: absoluteUrl(`/stocks/${row.stock.slug.current}`),
    })),
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Top by sector", href: "/top" },
          { label: list.sector.title },
        ]}
      />

      <header
        className={cn(
          "relative mb-10 overflow-hidden rounded-3xl border bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950 p-6 sm:p-10",
          ACCENT_BORDER[accent]
        )}
      >
        {list.heroImage?.asset ? (
          <Image
            src={urlFor(list.heroImage).width(1600).height(900).url()}
            alt=""
            fill
            className="absolute inset-0 -z-10 object-cover opacity-30"
            sizes="100vw"
            priority
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset",
              ACCENT_RING[accent]
            )}
          >
            <SectorIcon icon={list.sector.icon} className="h-5 w-5" />
          </span>
          <Link
            href={`/sectors/${list.sector.slug.current}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset transition-colors",
              ACCENT_RING[accent]
            )}
          >
            {list.sector.title}
            <ChevronRight className="h-3 w-3" />
          </Link>
          {list.lastUpdated && (
            <span className="inline-flex items-center gap-1 text-xs text-ash-400">
              <Calendar className="h-3.5 w-3.5" />
              Updated {formatDate(list.lastUpdated)}
            </span>
          )}
        </div>

        <h1 className="mt-4 max-w-3xl text-balance text-3xl font-bold tracking-tight text-ash-50 sm:text-5xl">
          {list.title}
        </h1>

        {list.subtitle && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ash-300 sm:text-lg">
            {list.subtitle}
          </p>
        )}

        {list.intro && list.intro.length > 0 && (
          <div className="mt-6 max-w-3xl">
            <PortableProse value={list.intro} size="md" />
          </div>
        )}
      </header>

      <ol className="space-y-4">
        {(list.picks ?? []).map((row, idx) => {
          const sym = normalizeFinnhubSymbol(row.stock.ticker);
          const quote = quoteMap.get(sym);
          const tone =
            !quote
              ? "flat"
              : quote.changePercent > 0
              ? "up"
              : quote.changePercent < 0
              ? "down"
              : "flat";
          const verdict = VERDICT_BADGE[row.verdict || "top-pick"];

          return (
            <li
              key={row._key || row.stock._id}
              className="group relative flex flex-col gap-4 rounded-2xl border border-ink-700 bg-ink-800/60 p-5 transition-all hover:border-accent-500/40 hover:bg-ink-800 sm:flex-row sm:items-start"
            >
              <div className="flex shrink-0 items-center gap-3 sm:w-32 sm:flex-col sm:items-start sm:gap-1">
                <div className="text-3xl font-black tabular-nums text-accent-300">
                  #{idx + 1}
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
                    verdict.cls
                  )}
                >
                  {verdict.icon}
                  {verdict.label}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Link
                    href={`/stocks/${row.stock.slug.current}`}
                    className="group/title font-mono text-lg font-bold text-ash-50 hover:text-accent-300"
                  >
                    {displayTicker(row.stock.ticker)}
                  </Link>
                  <span className="text-sm text-ash-400">{row.stock.name}</span>
                  <span className="text-xs text-ash-500">{row.stock.exchange}</span>
                  {row.stock.sector && (
                    <SectorBadge sector={row.stock.sector} />
                  )}
                </div>

                <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ash-200">
                  {row.thesis}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/stocks/${row.stock.slug.current}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-accent-300 hover:text-accent-200"
                  >
                    Read the full thesis
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <WatchlistButton symbol={row.stock.ticker} variant="pill" />
                </div>
              </div>

              <div className="flex w-full shrink-0 flex-row items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/60 p-3 sm:w-44 sm:flex-col sm:items-end">
                <div className="text-right">
                  <div className="font-semibold tabular-nums text-ash-50">
                    {quote
                      ? formatPrice(
                          quote.price,
                          quote.currency || currencyFor(row.stock.exchange)
                        )
                      : "—"}
                  </div>
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
                      tone === "up" && "text-up-400",
                      tone === "down" && "text-down-400",
                      tone === "flat" && "text-ash-500"
                    )}
                  >
                    {tone === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : tone === "down" ? (
                      <ArrowDownRight className="h-3 w-3" />
                    ) : null}
                    {quote ? formatPercent(quote.changePercent) : "—"}
                  </div>
                </div>
                {row.stock.riskScore && (
                  <div className="text-[10px] uppercase tracking-wider text-ash-500">
                    Risk:{" "}
                    <span className="font-semibold text-ash-300">
                      {row.stock.riskScore}
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {list.picks && list.picks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
          <p className="text-ash-300">No picks added to this list yet.</p>
        </div>
      )}

      <div className="mt-10 grid gap-3 rounded-2xl border border-ink-700 bg-ink-900/40 p-6 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ash-400">
            <Star className="h-4 w-4 text-accent-300" />
            Why this list exists
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ash-300">
            Most &ldquo;top stocks&rdquo; lists are noise — algorithmic, generic,
            and stale. This is the short list of {list.sector.title.toLowerCase()}{" "}
            names our editors think you should be paying attention to right now.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ash-400">
            <Calendar className="h-4 w-4 text-accent-300" />
            How often it&rsquo;s refreshed
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ash-300">
            We refresh the list when our view changes — typically every 4-8
            weeks, or sooner around major earnings or sector news. The
            &ldquo;Updated&rdquo; badge above shows the last edit.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Disclaimer variant="block" />
      </div>
    </article>
  );
}
