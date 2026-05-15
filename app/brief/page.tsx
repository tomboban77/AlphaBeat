import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { allBriefsQuery } from "@/lib/sanity/queries";
import type { Brief } from "@/lib/types";
import { formatDate, absoluteUrl, SITE_NAME } from "@/lib/utils";

import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "The Brief — Weekly Canadian Investing Newsletter",
  description:
    `Every Sunday: one featured Canadian stock, a tax or account tip, and a TSX market note. Free. ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl("/brief") },
};

export default async function BriefArchivePage() {
  const briefs = await client.fetch<Brief[]>(allBriefsQuery).catch(() => [] as Brief[]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Every Sunday</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">The Brief</h1>
        <p className="mt-4 text-base leading-relaxed text-ash-300">
          One featured Canadian stock. One tax or account tip. One TSX market note. Clear,
          direct, done in under 10 minutes. Free, every Sunday.
        </p>
      </div>

      <NewsletterCTA source="brief-archive" variant="banner" />

      <div className="mt-12">
        {briefs.length === 0 ? (
          <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-10 text-center">
            <h2 className="text-lg font-bold text-ash-50">First issue coming soon</h2>
            <p className="mt-2 text-sm text-ash-400">
              Subscribe to get it in your inbox the moment it drops.
            </p>
            <Link
              href="/subscribe"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
            >
              Subscribe free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {briefs.map((b) => (
              <Link
                key={b._id}
                href={`/brief/${b.slug.current}`}
                className="group flex flex-col rounded-2xl border border-ink-700 bg-ink-800/40 p-5 transition-all hover:border-accent-500/40 hover:bg-ink-800"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-accent-500/10 px-2.5 py-0.5 font-semibold text-accent-300 ring-1 ring-inset ring-accent-500/30">
                    Issue #{b.issueNumber}
                  </span>
                  {b.publishedAt && (
                    <span className="text-ash-500">{formatDate(b.publishedAt)}</span>
                  )}
                  {b.featureStock && (
                    <span className="rounded bg-ink-700 px-2 py-0.5 font-mono text-ash-300">
                      {b.featureStock.ticker}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-lg font-bold text-ash-50 group-hover:text-accent-200">
                  {b.title}
                </h2>
                {b.tsxQuickNote && (
                  <p className="mt-1 text-sm text-ash-400">{b.tsxQuickNote}</p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-300">
                  Read this issue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-14">
        <Disclaimer variant="block" />
      </div>
    </div>
  );
}
