import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { rankedListBySlugQuery, rankedListSlugsQuery } from "@/lib/sanity/queries";
import type { RankedList } from "@/lib/types";
import { absoluteUrl, formatDate, SITE_NAME } from "@/lib/utils";

import PortableProse from "@/components/portable/PortableProse";
import { TopListTracker } from "@/components/analytics/PageTracker";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import Disclaimer from "@/components/ui/Disclaimer";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(rankedListSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rl = await client.fetch<RankedList | null>(rankedListBySlugQuery, { slug }).catch(() => null);
  if (!rl) return { title: "List not found" };
  const url = absoluteUrl(`/best/${slug}`);
  return {
    title: `${rl.title} | ${SITE_NAME}`,
    description: rl.seoDescription || `${rl.title} — score-ranked, quarterly updated.`,
    alternates: { canonical: url },
    openGraph: { title: rl.title, url, type: "article" },
  };
}

export default async function RankedListPage({ params }: PageProps) {
  const { slug } = await params;
  const rl = await client.fetch<RankedList | null>(rankedListBySlugQuery, { slug }).catch(() => null);
  if (!rl) notFound();

  const entries = rl.entries ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: rl.title,
    description: rl.seoDescription,
    numberOfItems: entries.length,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: e.rank ?? i + 1,
      name: e.stockFile?.ticker ?? e.etfTicker ?? "",
    })),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopListTracker slug={slug} category={rl.category ?? ""} />
      <Breadcrumb items={[{ label: "Top Lists", href: "/best" }, { label: rl.title }]} />

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">{rl.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ash-500">
          {rl.lastUpdated && <span>Last updated: {formatDate(rl.lastUpdated)} · Updated quarterly</span>}
          {rl.accountFocus && rl.accountFocus !== "any" && (
            <span className="rounded-full bg-accent-500/10 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-accent-400 ring-1 ring-inset ring-accent-500/30">
              {rl.accountFocus.toUpperCase()}
            </span>
          )}
        </div>
      </header>

      {/* Inline subscribe */}
      <div className="mb-8 rounded-2xl border border-accent-500/20 bg-accent-500/5 px-5 py-4">
        <p className="text-sm text-ash-300">
          Get the Brief every Sunday — we update these lists quarterly and announce changes in the newsletter.{" "}
          <Link href="/subscribe" className="font-semibold text-accent-300 underline hover:text-accent-200">Subscribe free →</Link>
        </p>
      </div>

      {/* Intro */}
      {rl.intro && rl.intro.length > 0 && (
        <div className="mb-8">
          <PortableProse value={rl.intro} size="md" />
        </div>
      )}

      {/* Methodology note */}
      {rl.methodologyNote && rl.methodologyNote.length > 0 && (
        <div className="mb-8 rounded-xl border border-ink-700 bg-ink-800/40 p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">Methodology</div>
          <PortableProse value={rl.methodologyNote} size="sm" />
          <Link href="/methodology" className="mt-2 inline-flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300">
            Full methodology <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Entries */}
      {entries.length === 0 ? (
        <p className="text-sm text-ash-500">Entries coming soon — check back after the quarterly update.</p>
      ) : (
        <ol className="space-y-4">
          {entries
            .sort((a, b) => a.rank - b.rank)
            .map((entry) => {
              const ticker = entry.stockFile?.ticker || entry.etfTicker || "—";
              const name = entry.stockFile?.companyName || entry.etfName || "";
              const href = entry.stockFile ? `/stocks/${entry.stockFile.slug.current}` : null;

              return (
                <li
                  key={entry._key || entry.rank}
                  className="flex gap-4 rounded-2xl border border-ink-700 bg-ink-800/40 p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-ink-950">
                    {entry.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-base font-bold text-ash-50">{ticker}</span>
                      {name && <span className="text-sm text-ash-400">{name}</span>}
                      {entry.keyMetric && (
                        <span className="ml-auto rounded-full bg-ink-700 px-2.5 py-0.5 text-xs font-semibold text-ash-200">
                          {entry.keyMetric}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ash-300">{entry.editorTake}</p>
                    {href && (
                      <Link
                        href={href}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent-400 hover:text-accent-300"
                      >
                        View full analysis <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
        </ol>
      )}

      {/* Affiliate slot (dormant) */}
      <div className="mt-8 rounded-2xl border border-ink-600/50 bg-ink-800/30 p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-ash-500">Ready to invest?</div>
        <p className="mt-2 text-sm text-ash-500">
          All stocks on this list are available commission-free on Wealthsimple and Questrade.
        </p>
        <p className="mt-1 text-[10px] text-ash-600">Affiliate links coming soon.</p>
      </div>

      {/* Changelog */}
      {rl.changesLog && rl.changesLog.length > 0 && (
        <details className="mt-8 rounded-2xl border border-ink-700 bg-ink-800/40">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-ash-200">
            Changelog ({rl.changesLog.length} updates)
            <ChevronDown className="h-4 w-4 text-ash-400" />
          </summary>
          <ul className="divide-y divide-ink-800 px-5 pb-4">
            {rl.changesLog.map((entry, i) => (
              <li key={entry._key || i} className="flex items-start gap-4 py-3 text-sm">
                <span className="w-24 shrink-0 font-mono text-ash-500">{entry.date}</span>
                <span className="text-ash-300">{entry.change}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Related Playbooks */}
      {rl.relatedPlaybooks && rl.relatedPlaybooks.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">Related Playbooks</div>
          <div className="space-y-2">
            {rl.relatedPlaybooks.map((pb) => (
              <Link
                key={pb._id}
                href={`/playbooks/${pb.slug.current}`}
                className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-800/40 px-4 py-3 text-sm transition-colors hover:border-accent-500/40"
              >
                <span className="font-medium text-ash-200">{pb.title}</span>
                <ArrowRight className="h-4 w-4 text-ash-500" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <NewsletterCTA source="top-list" variant="banner" />
      </div>

      <div className="mt-8 flex justify-between">
        <Link href="/best" className="inline-flex items-center gap-1 text-sm text-ash-400 hover:text-ash-200">
          <ArrowLeft className="h-4 w-4" /> All Top Lists
        </Link>
      </div>

      <div className="mt-12">
        <Disclaimer variant="block" />
      </div>
    </article>
  );
}
