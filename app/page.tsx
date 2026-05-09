import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Gem,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { client } from "@/lib/sanity/client";
import {
  allTopListsQuery,
  featuredHiddenGemsQuery,
  featuredStockQuery,
  latestInsightsQuery,
  latestWeeklyPickQuery,
} from "@/lib/sanity/queries";
import type {
  Stock,
  Insight,
  TopList,
  WeeklyPick,
  MarketQuote,
  CandlePoint,
} from "@/lib/types";
import { urlFor } from "@/lib/sanity/image";
import { formatDate, formatRelativeWeek } from "@/lib/utils";
import { getCandles, getQuote, getQuotes } from "@/lib/market/finnhub";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";

import SectionHeading from "@/components/ui/SectionHeading";
import StockCard from "@/components/stocks/StockCard";
import HiddenGemCard from "@/components/stocks/HiddenGemCard";
import InsightCard from "@/components/insights/InsightCard";
import SectorIcon, { ACCENT_RING } from "@/components/sectors/SectorIcon";
import Disclaimer from "@/components/ui/Disclaimer";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";

export const revalidate = 600;

async function getCmsData() {
  const [featured, weekly, insights, gems, topLists] = await Promise.all([
    client.fetch<Stock | null>(featuredStockQuery).catch(() => null),
    client.fetch<WeeklyPick | null>(latestWeeklyPickQuery).catch(() => null),
    client.fetch<Insight[]>(latestInsightsQuery, { limit: 6 }).catch(() => []),
    client.fetch<Stock[]>(featuredHiddenGemsQuery).catch(() => []),
    client.fetch<TopList[]>(allTopListsQuery).catch(() => []),
  ]);
  return { featured, weekly, insights, gems, topLists };
}

export default async function HomePage() {
  const { featured, weekly, insights, gems, topLists } = await getCmsData();

  const featuredQuote = featured ? await getQuote(featured.ticker) : null;
  const featuredCandles = featured ? await getCandles(featured.ticker, "1M") : [];

  // Quotes + sparks for hidden gems strip
  const gemSyms = gems.map((g) => g.ticker);
  const [gemQuoteMap, gemSparkResults] = await Promise.all([
    getQuotes(gemSyms),
    Promise.all(gemSyms.map(async (s) => [s, await getCandles(s, "1M")] as const)),
  ]);
  const gemQuotes: Record<string, MarketQuote> = {};
  for (const [s, q] of gemQuoteMap.entries()) gemQuotes[s] = q;
  const gemSparks: Record<string, CandlePoint[]> = {};
  for (const [s, c] of gemSparkResults) gemSparks[normalizeFinnhubSymbol(s)] = c;

  const featuredInsight = insights.find((i) => i.featured) || insights[0];
  const restInsights = insights
    .filter((i) => i._id !== featuredInsight?._id)
    .slice(0, 6);

  return (
    <>
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden border-b border-ink-700">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_-10%,rgba(34,211,238,0.14),transparent_50%),radial-gradient(circle_at_85%_15%,rgba(167,139,250,0.12),transparent_55%)]"
        />
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-300">
            <Sparkles className="h-3.5 w-3.5" />
            Editor-led · No signup · US + Canadian markets
          </div>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl lg:text-6xl">
            Stop guessing.{" "}
            <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-violet-400 bg-clip-text text-transparent">
              Invest with conviction.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-ash-300 sm:text-lg">
            AlphaBeat tells you which stocks deserve your attention right now,
            why each one matters, and what could go wrong. Editor-led picks.
            Bull case and bear case for every ticker. No clickbait, no hidden
            agenda.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/weekly-picks"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-accent-500/30 transition-all hover:bg-accent-400 hover:shadow-accent-500/50"
            >
              See this week&rsquo;s Top 10
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hidden-gems"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-6 py-3 text-sm font-semibold text-violet-200 transition-all hover:border-violet-400 hover:bg-violet-500/20"
            >
              <Gem className="h-4 w-4" />
              Browse Hidden Gems
            </Link>
          </div>

          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ash-400">
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-up-400" />
              Bull and bear case for every stock
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-up-400" />
              Live US &amp; Canadian quotes
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-up-400" />
              Free forever, no account needed
            </li>
          </ul>
        </div>
      </section>

      {/* ====================================================== VALUE PROPS */}
      <section className="border-b border-ink-800 bg-ink-900/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
              What you get from AlphaBeat
            </h2>
            <p className="mt-2 text-ash-400">
              Built for self-directed investors who want signal, not noise.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <ValuePropCard
              icon={<Trophy className="h-5 w-5 text-accent-300" />}
              title="A clear list of what to watch"
              body={
                <>
                  Every Monday, our editors publish a Top 10. Every sector has a
                  permanent &ldquo;top stocks&rdquo; page. Stop scrolling, start
                  reading.
                </>
              }
              href="/weekly-picks"
              linkLabel="See the latest Top 10"
            />
            <ValuePropCard
              icon={<Gem className="h-5 w-5 text-violet-300" />}
              title="Asymmetric ideas under $20"
              body="Hidden Gems surfaces small caps and turnaround stories with real upside — each pick risk-scored so you can size accordingly."
              href="/hidden-gems"
              linkLabel="Explore Hidden Gems"
              accent="violet"
            />
            <ValuePropCard
              icon={<ShieldCheck className="h-5 w-5 text-up-300" />}
              title="The risks, stated plainly"
              body="Every stock page has a bear case alongside the bull case. We tell you what could break the thesis before it happens."
              href="/screener"
              linkLabel="Browse all coverage"
              accent="up"
            />
          </div>
        </div>
      </section>

      {/* ============================================== WEEKLY PICK FEATURE */}
      {weekly ? (
        <section className="border-b border-ink-800">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="The flagship product"
              title="This week's Top 10"
              description="Editor-curated stocks worth your attention this week — with thesis, conviction, and time horizon for each."
              href="/weekly-picks"
              hrefLabel="Read all 10 picks"
            />

            <Link
              href={`/weekly-picks/${weekly.slug.current}`}
              className="group relative mt-6 grid overflow-hidden rounded-2xl border border-accent-500/30 bg-gradient-to-br from-ink-800 via-ink-900 to-accent-950 transition-all hover:border-accent-500/60 hover:shadow-2xl hover:shadow-accent-500/10 sm:grid-cols-2"
            >
              <div className="relative aspect-[16/10] sm:aspect-auto">
                {weekly.heroImage?.asset ? (
                  <Image
                    src={urlFor(weekly.heroImage).width(900).height(600).url()}
                    alt={weekly.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink-700 to-accent-900">
                    <span className="text-7xl font-black tracking-tighter text-accent-300/40">
                      α
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/15 px-2.5 py-1 font-semibold uppercase tracking-wider text-accent-300 ring-1 ring-inset ring-accent-500/30">
                    <Sparkles className="h-3 w-3" />
                    {formatRelativeWeek(weekly.weekOf)}
                  </span>
                  <span className="text-ash-400">{formatDate(weekly.weekOf)}</span>
                  {weekly.author?.name && (
                    <span className="text-ash-500">· by {weekly.author.name}</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
                  {weekly.title}
                </h3>
                {weekly.picks && weekly.picks.length > 0 && (
                  <p className="text-sm text-ash-300">
                    Featuring{" "}
                    <span className="font-semibold text-ash-100">
                      {weekly.picks
                        .slice(0, 5)
                        .map((p) => p.stock?.ticker)
                        .filter(Boolean)
                        .join(", ")}
                    </span>{" "}
                    and {Math.max(0, weekly.picks.length - 5)} more.
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent-300">
                  Read all picks
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      {/* ===================================================== HIDDEN GEMS */}
      {gems.length > 0 && (
        <section className="border-b border-ink-800 bg-violet-950/10">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Hidden Gems"
              title="Small bets, big upside"
              description="Hand-picked stocks under $20 with asymmetric upside. Each pick is risk-scored so you size with eyes open."
              href="/hidden-gems"
              hrefLabel="See all Hidden Gems"
            />
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {gems.slice(0, 4).map((g) => (
                <HiddenGemCard
                  key={g._id}
                  stock={g}
                  quote={gemQuotes[normalizeFinnhubSymbol(g.ticker)]}
                  spark={gemSparks[normalizeFinnhubSymbol(g.ticker)]}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================ TOP-LISTS BY SECTOR */}
      {topLists.length > 0 && (
        <section className="border-b border-ink-800">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Top stocks by sector"
              title="A short list for every sector"
              description="Permanent, evergreen lists of the names worth owning right now in each sector. Refreshed when our view changes."
              href="/top"
              hrefLabel="See all top lists"
            />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topLists.slice(0, 6).map((list) => (
                <Link
                  key={list._id}
                  href={`/top/${list.slug.current}`}
                  className="group flex flex-col rounded-2xl border border-ink-700 bg-ink-800/60 p-5 transition-all hover:border-accent-500/40 hover:bg-ink-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset ${
                        ACCENT_RING[list.sector?.accent || "cyan"]
                      }`}
                    >
                      <SectorIcon icon={list.sector?.icon} className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-ash-400">
                      {list.sector?.title}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-ash-50 group-hover:text-accent-200">
                    {list.title}
                  </h3>
                  {list.subtitle && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ash-400">
                      {list.subtitle}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between border-t border-ink-700 pt-3 text-[11px]">
                    <span className="text-ash-500">
                      {list.pickCount || 0} picks
                    </span>
                    {list.lastUpdated && (
                      <span className="text-ash-500">
                        Updated {formatDate(list.lastUpdated)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================== FEATURED INSIGHT + GRID */}
      {insights.length > 0 && (
        <section className="border-b border-ink-800">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Insights"
              title="Read deeper"
              description="Earnings reactions, sector deep-dives, macro reads, and the occasional contrarian take."
              href="/insights"
              hrefLabel="All insights"
            />

            {featuredInsight && (
              <Link
                href={`/insights/${featuredInsight.slug.current}`}
                className="group relative mt-6 grid overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/60 transition-all hover:border-accent-500/40 hover:bg-ink-800 sm:grid-cols-2"
              >
                <div className="relative aspect-[16/10] sm:aspect-auto">
                  {featuredInsight.mainImage?.asset ? (
                    <Image
                      src={urlFor(featuredInsight.mainImage).width(900).height(600).url()}
                      alt={featuredInsight.mainImage.alt || featuredInsight.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-800">
                      <BookOpen className="h-16 w-16 text-ash-600" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-accent-500/10 px-2 py-0.5 font-semibold uppercase tracking-wider text-accent-300 ring-1 ring-inset ring-accent-500/30">
                      Featured
                    </span>
                    {featuredInsight.kind && (
                      <span className="rounded-full bg-ink-700 px-2 py-0.5 font-semibold uppercase tracking-wider text-ash-300">
                        {featuredInsight.kind}
                      </span>
                    )}
                    {featuredInsight.publishedAt && (
                      <span className="text-ash-500">
                        {formatDate(featuredInsight.publishedAt)}
                      </span>
                    )}
                    {featuredInsight.readingTime && (
                      <span className="text-ash-500">
                        · {featuredInsight.readingTime} min read
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
                    {featuredInsight.title}
                  </h3>
                  {featuredInsight.excerpt && (
                    <p className="text-sm leading-relaxed text-ash-300">
                      {featuredInsight.excerpt}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent-300">
                    Read the article
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}

            {restInsights.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {restInsights.map((insight) => (
                  <InsightCard key={insight._id} insight={insight} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================ FEATURED STOCK CARD */}
      {featured && (
        <section className="border-b border-ink-800 bg-ink-900/30">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Stock spotlight"
              title="A name we're paying close attention to"
              description="One stock per week gets a fuller editor's spotlight. Read the thesis, the bull and bear, and the catalysts."
            />
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-accent-500/30 bg-gradient-to-br from-ink-800 via-ink-900 to-accent-950/40 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-300">
                  <Target className="h-3.5 w-3.5" />
                  Editor&rsquo;s Spotlight
                </div>
                <h3 className="mt-3 font-mono text-2xl font-bold text-ash-50 sm:text-3xl">
                  {featured.ticker}
                  <span className="ml-3 font-sans text-base font-medium text-ash-400">
                    {featured.name}
                  </span>
                </h3>
                {featured.headline && (
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-ash-200 sm:text-lg">
                    &ldquo;{featured.headline}&rdquo;
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/stocks/${featured.slug.current}`}
                    className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
                  >
                    Read the full thesis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/screener"
                    className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
                  >
                    Browse all stocks
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-1">
                <StockCard
                  stock={featured}
                  quote={featuredQuote || undefined}
                  spark={featuredCandles}
                  variant="spotlight"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================== NEWSLETTER BANNER */}
      <section className="border-b border-ink-800 bg-ink-950">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <NewsletterCTA source="home-banner" variant="banner" />
        </div>
      </section>

      {/* =========================================== SPONSOR CTA + CLOSER */}
      <section className="bg-ink-950">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-2xl border border-warn-500/30 bg-warn-500/5 p-6 sm:grid-cols-3 sm:p-8">
            <div className="sm:col-span-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-warn-300">
                <Compass className="h-3.5 w-3.5" />
                For listed companies &amp; IR teams
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-ash-50">
                Get your ticker in front of investors who actually read.
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ash-300">
                Sponsored placements are clearly labelled, sit beside an
                independent editor&rsquo;s take, and link to your IR materials.
                Sponsorship buys visibility — never editorial.
              </p>
            </div>
            <div className="flex items-end">
              <Link
                href="/sponsor"
                className="inline-flex items-center gap-2 rounded-full bg-warn-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-warn-300"
              >
                See sponsorship options
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <Disclaimer variant="block" />
          </div>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Local components
// ---------------------------------------------------------------------------

function ValuePropCard({
  icon,
  title,
  body,
  href,
  linkLabel,
  accent = "accent",
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
  href: string;
  linkLabel: string;
  accent?: "accent" | "violet" | "up";
}) {
  const tone =
    accent === "violet"
      ? "border-violet-500/30 hover:border-violet-400/60"
      : accent === "up"
      ? "border-up-500/30 hover:border-up-400/60"
      : "border-accent-500/30 hover:border-accent-400/60";
  const linkTone =
    accent === "violet"
      ? "text-violet-300 hover:text-violet-200"
      : accent === "up"
      ? "text-up-300 hover:text-up-200"
      : "text-accent-300 hover:text-accent-200";
  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl border bg-ink-800/60 p-6 transition-colors ${tone}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900/80 ring-1 ring-inset ring-ink-700">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-ash-50">{title}</h3>
      <p className="text-sm leading-relaxed text-ash-300">{body}</p>
      <Link
        href={href}
        className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${linkTone}`}
      >
        {linkLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}
