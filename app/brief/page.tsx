import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { allBriefsQuery } from "@/lib/sanity/queries";
import type { Brief } from "@/lib/types";
import { absoluteUrl, formatDate, SITE_NAME } from "@/lib/utils";

import NewsletterForm from "@/components/newsletter/NewsletterForm";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "The Brief — Weekly Canadian Investing Newsletter",
  description:
    `One featured Canadian stock. One tax tip. One TSX note. Every Sunday, free. ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl("/brief") },
};

export default async function BriefArchivePage() {
  const briefs = await client.fetch<Brief[]>(allBriefsQuery).catch(() => [] as Brief[]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">

      {/* Header */}
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Every Sunday</div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl">The Brief</h1>
        <p className="mt-4 text-lg leading-relaxed text-ash-300">
          One featured Canadian stock. One tax or account tip. One TSX market note.
          Written for Canadian investors who use Wealthsimple or Questrade and want
          the full picture — not just the headline.
        </p>
      </div>

      {/* Subscribe card */}
      <div className="mb-12 rounded-2xl border border-accent-500/30 bg-linear-to-br from-ink-900 via-ink-900 to-accent-950/40 p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-400">Free · Every Sunday</p>
            <h2 className="mt-2 text-2xl font-bold text-ash-50">Get it in your inbox</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-ash-400">
              <li>• One Canadian stock with a full thesis</li>
              <li>• A tax or account tip each week</li>
              <li>• TSX market note in one sentence</li>
              <li>• Unsubscribe in one click</li>
            </ul>
          </div>
          <div className="space-y-3">
            <NewsletterForm source="brief-archive" ctaLabel="Subscribe free" variant="stacked" />
            <p className="text-xs text-ash-600">No spam. Educational only — not investment advice.</p>
          </div>
        </div>
      </div>

      {/* Issue archive */}
      {briefs.length === 0 ? (
        <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-10 text-center">
          <h2 className="text-lg font-bold text-ash-50">First issue coming this Sunday</h2>
          <p className="mt-2 text-sm text-ash-400">Subscribe above to get it the moment it drops.</p>
        </div>
      ) : (
        <div>
          <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-ash-500">
            Archive — {briefs.length} issue{briefs.length !== 1 ? "s" : ""}
          </div>
          <div className="space-y-3">
            {briefs.map((b) => (
              <Link
                key={b._id}
                href={`/brief/${b.slug.current}`}
                className="group flex flex-col rounded-2xl border border-ink-700 bg-ink-800/40 p-5 transition-all hover:border-accent-500/40 hover:bg-ink-800 sm:flex-row sm:items-center sm:gap-5"
              >
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  <span className="rounded-full bg-accent-500/10 px-2.5 py-1 font-semibold text-accent-300 ring-1 ring-inset ring-accent-500/30">
                    #{b.issueNumber}
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
                <div className="mt-3 flex-1 sm:mt-0">
                  <h2 className="font-bold text-ash-50 group-hover:text-accent-200">
                    {b.title}
                  </h2>
                  {b.tsxQuickNote && (
                    <p className="mt-0.5 text-sm text-ash-500 line-clamp-1">{b.tsxQuickNote}</p>
                  )}
                </div>
                <ArrowRight className="mt-3 hidden h-4 w-4 shrink-0 text-ash-600 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-400 sm:mt-0 sm:block" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-14">
        <Disclaimer variant="block" />
      </div>
    </div>
  );
}
