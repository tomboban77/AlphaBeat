import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { allPlaybooksQuery } from "@/lib/sanity/queries";
import type { Playbook } from "@/lib/types";
import { absoluteUrl, formatDate, SITE_NAME } from "@/lib/utils";

import NewsletterCTA from "@/components/newsletter/NewsletterCTA";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Playbooks — Deep-dive Canadian Investing Guides",
  description: `Evergreen guides for Canadian DIY investors: TFSA asset location, dividend investing, precious metals, and more. ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl("/playbooks") },
};

export default async function PlaybooksPage() {
  const playbooks = await client.fetch<Playbook[]>(allPlaybooksQuery).catch(() => [] as Playbook[]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Deep-dive guides</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">Playbooks</h1>
        <p className="mt-4 text-base leading-relaxed text-ash-300">
          Evergreen guides for Canadian DIY investors. Written once, kept current. Each Playbook
          answers a specific question — which account, which tax treatment, which strategy.
        </p>
      </div>

      {playbooks.length === 0 ? (
        <>
          <div className="mb-6 rounded-2xl border border-accent-500/20 bg-accent-500/5 px-5 py-4 text-sm text-accent-300">
            <strong className="text-accent-200">Coming soon.</strong> Playbooks are in final editing.{" "}
            <Link href="/subscribe" className="underline hover:text-accent-100">Subscribe to be notified →</Link>
          </div>
          <div className="grid gap-5">
            {PLACEHOLDER_PLAYBOOKS.map((p) => (
              <article key={p.slug} className="flex items-start gap-5 rounded-2xl border border-ink-700 bg-ink-800/40 p-6 opacity-60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-900/80 ring-1 ring-inset ring-ink-700">
                  <BookOpen className="h-5 w-5 text-ash-500" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ash-500">{p.tag}</span>
                  <h2 className="mt-1 text-lg font-bold text-ash-300">{p.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-ash-500">{p.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-5">
          {playbooks.map((p) => (
            <Link
              key={p._id}
              href={`/playbooks/${p.slug.current}`}
              className="group flex items-start gap-5 rounded-2xl border border-ink-700 bg-ink-800/40 p-6 transition-all hover:border-accent-500/40 hover:bg-ink-800"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-900/80 ring-1 ring-inset ring-ink-700">
                <BookOpen className="h-5 w-5 text-accent-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-ash-50 group-hover:text-accent-200">{p.title}</h2>
                {p.lastUpdated && (
                  <p className="mt-1 text-xs text-ash-500">Updated {formatDate(p.lastUpdated)}</p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-300">
                  Read the Playbook <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-14">
        <NewsletterCTA source="playbooks-index" variant="banner" />
      </div>
    </div>
  );
}

const PLACEHOLDER_PLAYBOOKS = [
  { slug: "tfsa-asset-location", tag: "Tax strategy", title: "The TFSA Asset Location Playbook", excerpt: "Which stocks belong in your TFSA, which go in your RRSP, and which are fine in a non-registered account." },
  { slug: "canadian-dividend-investing", tag: "Income", title: "The Canadian Dividend Investing Playbook", excerpt: "Eligible dividends, dividend growth streaks, and why yield alone is the wrong metric." },
  { slug: "canadian-precious-metals", tag: "Precious metals", title: "The Canadian Precious Metals Playbook", excerpt: "Gold, silver, miners, and royalty companies — how to own metals exposure in a Canadian portfolio." },
];
