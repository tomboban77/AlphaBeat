import Link from "next/link";
import { ArrowRight, BarChart2, BookOpen, FileText, Star } from "lucide-react";

import { client } from "@/lib/sanity/client";
import {
  latestBriefQuery,
  recentStockFilesQuery,
  featuredRankedListQuery,
  featuredPlaybooksQuery,
} from "@/lib/sanity/queries";
import type { Brief, StockFile, RankedList, Playbook } from "@/lib/types";
import { formatDate } from "@/lib/utils";

import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

async function getCmsData() {
  const [latestBrief, recentStocks, featuredList, featuredPlaybooks] = await Promise.all([
    client.fetch<Brief | null>(latestBriefQuery).catch(() => null),
    client.fetch<StockFile[]>(recentStockFilesQuery, { limit: 6 }).catch(() => [] as StockFile[]),
    client.fetch<RankedList | null>(featuredRankedListQuery).catch(() => null),
    client.fetch<Playbook[]>(featuredPlaybooksQuery).catch(() => [] as Playbook[]),
  ]);
  return { latestBrief, recentStocks, featuredList, featuredPlaybooks };
}

export default async function HomePage() {
  const { latestBrief, recentStocks, featuredList, featuredPlaybooks } = await getCmsData();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-700">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_-10%,rgba(34,211,238,0.14),transparent_50%),radial-gradient(circle_at_85%_15%,rgba(167,139,250,0.12),transparent_55%)]"
        />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-300">
            For Canadian DIY investors
          </div>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl lg:text-6xl">
            Invest with clarity.{" "}
            <span className="bg-linear-to-r from-accent-300 via-accent-400 to-violet-400 bg-clip-text text-transparent">
              Tax-aware. TSX-fluent.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-ash-300 sm:text-lg">
            AlphaBeat helps Canadian millennials and Gen Z invest smarter —
            which account to hold it in, how eligible dividends affect your
            return, and why the TFSA changes the math. Every Sunday.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/subscribe"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-accent-500/30 transition-all hover:bg-accent-400"
            >
              Get the Brief — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/stocks"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-6 py-3 text-sm font-semibold text-ash-100 transition-all hover:border-ink-500"
            >
              Browse Stock Files
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST BRIEF */}
      {latestBrief ? (
        <section className="border-b border-ink-800">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
              This week&apos;s Brief
            </div>
            <Link
              href={`/brief/${latestBrief.slug.current}`}
              className="group mt-4 flex flex-col rounded-2xl border border-accent-500/30 bg-linear-to-br from-ink-800 via-ink-900 to-accent-950 p-6 transition-all hover:border-accent-500/60 hover:shadow-xl hover:shadow-accent-500/10 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="rounded-full bg-accent-500/15 px-2.5 py-1 font-semibold text-accent-300 ring-1 ring-inset ring-accent-500/30">
                    Issue #{latestBrief.issueNumber}
                  </span>
                  {latestBrief.publishedAt && (
                    <span className="text-ash-400">{formatDate(latestBrief.publishedAt)}</span>
                  )}
                  {latestBrief.featureStock && (
                    <span className="rounded bg-ink-700 px-2 py-0.5 font-mono text-ash-300">
                      {latestBrief.featureStock.ticker}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
                  {latestBrief.title}
                </h2>
                {latestBrief.tsxQuickNote && (
                  <p className="mt-2 text-sm text-ash-400">{latestBrief.tsxQuickNote}</p>
                )}
              </div>
              <span className="mt-4 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent-300 sm:mt-0">
                Read this week&apos;s Brief
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </section>
      ) : (
        <section className="border-b border-ink-800">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Every Sunday</div>
            <div className="mt-4 rounded-2xl border border-accent-500/20 bg-accent-500/5 p-6">
              <h2 className="text-xl font-bold text-ash-50">The Brief launches soon</h2>
              <p className="mt-2 text-sm text-ash-400">Subscribe to get the first issue in your inbox.</p>
              <Link href="/subscribe" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400">
                Subscribe — it&apos;s free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SUBSCRIBE CARD */}
      <section className="border-b border-ink-800 bg-ink-900/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <NewsletterCTA source="home-subscribe" variant="banner" />
        </div>
      </section>

      {/* FOUR SECTIONS */}
      <section className="border-b border-ink-800">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SectionCard icon={<FileText className="h-5 w-5 text-accent-300" />} title="The Brief" body="Sunday newsletter. One Canadian stock, one tax tip, one TSX note. 500-800 words." href="/brief" linkLabel="Read the archive" />
            <SectionCard icon={<BarChart2 className="h-5 w-5 text-up-300" />} title="Stock Files" body="Six-factor scored reference pages for TSX and US tickers. Value, growth, quality, dividend safety, momentum, and Canadian tax efficiency." href="/stocks" linkLabel="Browse Stock Files" accent="up" />
            <SectionCard icon={<BookOpen className="h-5 w-5 text-violet-300" />} title="Playbooks" body="Deep evergreen guides: TFSA strategy, dividend investing, precious metals — built for the Canadian investor." href="/playbooks" linkLabel="Read the Playbooks" accent="violet" />
            <SectionCard icon={<Star className="h-5 w-5 text-warn-300" />} title="The Tracker" body="Your watchlist. Save tickers, track scores, get a weekly digest. No account needed." href="/watchlist" linkLabel="Open my Watchlist" accent="warn" />
          </div>
        </div>
      </section>

      {/* RECENT STOCK FILES */}
      {recentStocks.length > 0 && (
        <section className="border-b border-ink-800">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Recently updated</div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-ash-50">Stock Files</h2>
              </div>
              <Link href="/stocks" className="group inline-flex items-center gap-1 text-sm font-semibold text-accent-300 hover:text-accent-200">
                All Stock Files <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentStocks.map((sf) => (
                <StockFileCard key={sf._id} sf={sf} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TOP LIST TEASER */}
      {featuredList ? (
        <section className="border-b border-ink-800 bg-ink-900/30">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Most-read this month</div>
            <Link
              href={`/best/${featuredList.slug.current}`}
              className="group block rounded-2xl border border-ink-700 bg-ink-800/60 p-6 transition-all hover:border-accent-500/40 hover:bg-ink-800"
            >
              <h2 className="text-xl font-bold text-ash-50 group-hover:text-accent-200">{featuredList.title}</h2>
              {featuredList.lastUpdated && (
                <p className="mt-1 text-xs text-ash-500">Updated {formatDate(featuredList.lastUpdated)} · Quarterly</p>
              )}
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-300">
                See the list <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <div className="mt-3 text-center">
              <Link href="/best" className="text-sm text-ash-500 hover:text-ash-300">View all Top Lists →</Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="border-b border-ink-800 bg-ink-900/30">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Quarterly updated</div>
            <TopListTeasers />
          </div>
        </section>
      )}

      {/* PLAYBOOKS TEASER */}
      {featuredPlaybooks.length > 0 ? (
        <section className="border-b border-ink-800">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Deep-dive guides</div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-ash-50">Playbooks</h2>
              </div>
              <Link href="/playbooks" className="group inline-flex items-center gap-1 text-sm font-semibold text-accent-300 hover:text-accent-200">
                All Playbooks <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {featuredPlaybooks.map((pb) => (
                <Link key={pb._id} href={`/playbooks/${pb.slug.current}`} className="group flex flex-col rounded-2xl border border-ink-700 bg-ink-800/60 p-6 transition-all hover:border-accent-500/40 hover:bg-ink-800">
                  <h3 className="text-lg font-bold leading-snug text-ash-50 group-hover:text-accent-200">{pb.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-300">
                    Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="border-b border-ink-800">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <PlaybookTeasers />
          </div>
        </section>
      )}

      {/* DISCLAIMER */}
      <section className="bg-ink-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Disclaimer variant="block" />
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Local components
// ---------------------------------------------------------------------------

function SectionCard({ icon, title, body, href, linkLabel, accent = "accent" }: {
  icon: React.ReactNode; title: string; body: string; href: string; linkLabel: string; accent?: "accent" | "up" | "violet" | "warn";
}) {
  const border = accent === "up" ? "border-up-500/30 hover:border-up-400/60" : accent === "violet" ? "border-violet-500/30 hover:border-violet-400/60" : accent === "warn" ? "border-warn-500/30 hover:border-warn-400/60" : "border-accent-500/30 hover:border-accent-400/60";
  const link   = accent === "up" ? "text-up-300 hover:text-up-200"           : accent === "violet" ? "text-violet-300 hover:text-violet-200"         : accent === "warn" ? "text-warn-300 hover:text-warn-200"         : "text-accent-300 hover:text-accent-200";
  return (
    <article className={`flex flex-col gap-3 rounded-2xl border bg-ink-800/60 p-6 transition-colors ${border}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900/80 ring-1 ring-inset ring-ink-700">{icon}</div>
      <h3 className="text-lg font-bold text-ash-50">{title}</h3>
      <p className="text-sm leading-relaxed text-ash-300">{body}</p>
      <Link href={href} className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${link}`}>
        {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

function StockFileCard({ sf }: { sf: StockFile }) {
  return (
    <Link
      href={`/stocks/${sf.slug.current}`}
      className="group flex flex-col rounded-2xl border border-ink-600/80 bg-ink-800/60 p-5 transition-all hover:border-ink-500 hover:bg-ink-800"
    >
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm font-bold tracking-tight text-ash-50">{sf.ticker}</span>
        <span className="text-xs text-ash-400">{sf.exchange}</span>
      </div>
      <p className="mt-0.5 truncate text-sm text-ash-300 group-hover:text-ash-100">{sf.companyName}</p>
      <p className="mt-1 text-xs text-ash-500">{sf.sectorLabel}</p>
      {sf.lastReviewed && (
        <p className="mt-2 text-[11px] text-ash-600">Reviewed {formatDate(sf.lastReviewed)}</p>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-400 group-hover:text-accent-300">
        View Stock File <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

function TopListTeasers() {
  const lists = [
    { slug: "top-canadian-dividend-stocks-tfsa", badge: "Dividend · TFSA", title: "Top 10 Canadian Dividend Stocks for TFSA" },
    { slug: "top-canadian-growth-stocks-under-40", badge: "Growth · Under $40", title: "Top 10 Canadian Growth Stocks Under $40" },
    { slug: "top-canadian-bank-stocks", badge: "Banks", title: "Top 10 Canadian Bank Stocks" },
    { slug: "top-canadian-etfs-tfsa", badge: "ETFs · TFSA", title: "Top 10 Canadian ETFs for TFSA" },
  ];
  return (
    <>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Quarterly updated</div>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ash-50">Top Lists</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {lists.map((l) => (
          <Link key={l.slug} href={`/best/${l.slug}`} className="group flex flex-col rounded-2xl border border-ink-700 bg-ink-800/60 p-5 transition-all hover:border-accent-500/40 hover:bg-ink-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-ash-400">{l.badge}</span>
            <h3 className="mt-2 text-base font-bold text-ash-50 group-hover:text-accent-200">{l.title}</h3>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-300">See the list <ArrowRight className="h-3 w-3" /></span>
          </Link>
        ))}
      </div>
      <div className="mt-4 text-center"><Link href="/best" className="text-sm text-ash-500 hover:text-ash-300">View all Top Lists →</Link></div>
    </>
  );
}

function PlaybookTeasers() {
  const playbooks = [
    { slug: "tfsa-asset-location", tag: "Tax strategy", title: "The TFSA Asset Location Playbook", excerpt: "Which stocks belong in your TFSA, which in your RRSP, and which are fine in a non-registered account." },
    { slug: "canadian-dividend-investing", tag: "Income", title: "The Canadian Dividend Investing Playbook", excerpt: "Eligible dividends, dividend growth streaks, and why yield alone is the wrong metric." },
    { slug: "canadian-precious-metals", tag: "Precious metals", title: "The Canadian Precious Metals Playbook", excerpt: "Gold, silver, miners, and royalty companies — metals exposure in a Canadian portfolio." },
  ];
  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Deep-dive guides</div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-ash-50">Playbooks</h2>
        </div>
        <Link href="/playbooks" className="group inline-flex items-center gap-1 text-sm font-semibold text-accent-300 hover:text-accent-200">All Playbooks <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {playbooks.map((p) => (
          <Link key={p.slug} href={`/playbooks/${p.slug}`} className="group flex flex-col rounded-2xl border border-ink-700 bg-ink-800/60 p-6 transition-all hover:border-accent-500/40 hover:bg-ink-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-ash-400">{p.tag}</span>
            <h3 className="mt-2 text-lg font-bold leading-snug text-ash-50 group-hover:text-accent-200">{p.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ash-400">{p.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-300">Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
