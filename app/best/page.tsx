import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { allRankedListsQuery } from "@/lib/sanity/queries";
import type { RankedList } from "@/lib/types";
import { absoluteUrl, formatDate, SITE_NAME } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Top Lists — Best Canadian Stocks by Category",
  description: `Score-ranked, quarterly-updated Top 10 lists of the best Canadian stocks and ETFs for TFSA, RRSP, and non-registered accounts. ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl("/best") },
};

const CATEGORY_LABEL: Record<string, string> = {
  "dividend-stocks": "Dividend stocks",
  "growth-stocks":   "Growth stocks",
  "bank-stocks":     "Banks",
  "precious-metals": "Precious metals",
  "reit-stocks":     "REITs",
  "etfs":            "ETFs",
  "under-20":        "Under $20",
  "under-40":        "Under $40",
};

const ACCOUNT_LABEL: Record<string, string> = {
  tfsa:            "TFSA",
  rrsp:            "RRSP",
  fhsa:            "FHSA",
  "non-registered": "Non-reg",
  any:             "Any account",
};

export default async function BestPage() {
  const lists = await client.fetch<RankedList[]>(allRankedListsQuery).catch(() => [] as RankedList[]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Quarterly updated</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">Top Lists</h1>
        <p className="mt-4 text-base leading-relaxed text-ash-300">
          Score-ranked, editor-reviewed lists of the best Canadian stocks and ETFs by category.
          Updated quarterly with a visible changelog so you know what changed and why.
        </p>
      </div>

      {lists.length === 0 ? (
        <>
          <div className="mb-6 rounded-2xl border border-accent-500/20 bg-accent-500/5 px-5 py-4 text-sm text-accent-300">
            <strong className="text-accent-200">Coming soon.</strong> Top Lists launch with Phase 2 seed data.{" "}
            <Link href="/subscribe" className="underline hover:text-accent-100">Subscribe to be notified →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {PLACEHOLDER_LISTS.map((l) => (
              <article key={l.slug} className="flex flex-col rounded-2xl border border-ink-700 bg-ink-800/40 p-6 opacity-60">
                <span className="text-xs font-semibold uppercase tracking-wider text-ash-500">{l.badge}</span>
                <h2 className="mt-2 text-lg font-bold leading-snug text-ash-300">{l.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ash-500">{l.description}</p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {lists.map((l) => (
            <Link
              key={l._id}
              href={`/best/${l.slug.current}`}
              className="group flex flex-col rounded-2xl border border-ink-700 bg-ink-800/40 p-6 transition-all hover:border-accent-500/40 hover:bg-ink-800"
            >
              <div className="flex items-center gap-2 text-xs">
                {l.category && (
                  <span className="font-semibold uppercase tracking-wider text-ash-400">
                    {CATEGORY_LABEL[l.category] || l.category}
                  </span>
                )}
                {l.accountFocus && l.accountFocus !== "any" && (
                  <span className="rounded-full bg-accent-500/10 px-2 py-0.5 font-semibold text-accent-400 ring-1 ring-inset ring-accent-500/30">
                    {ACCOUNT_LABEL[l.accountFocus]}
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-lg font-bold leading-snug text-ash-50 group-hover:text-accent-200">
                {l.title}
              </h2>
              {l.lastUpdated && (
                <p className="mt-2 text-xs text-ash-500">
                  Updated {formatDate(l.lastUpdated)} · Updated quarterly
                </p>
              )}
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-300">
                See the list <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const PLACEHOLDER_LISTS = [
  { slug: "top-canadian-dividend-stocks-tfsa", badge: "Dividend · TFSA", title: "Top 10 Canadian Dividend Stocks for TFSA", description: "High-quality eligible dividend payers that maximize the dividend tax credit inside a TFSA." },
  { slug: "top-canadian-growth-stocks-under-40", badge: "Growth · Under $40", title: "Top 10 Canadian Growth Stocks Under $40", description: "High-conviction TSX growth stocks accessible to investors building a TFSA from scratch." },
  { slug: "top-canadian-bank-stocks", badge: "Banks", title: "Top 10 Canadian Bank Stocks", description: "The Big Six plus mid-tier banks — ranked by value, dividend safety, and capital strength." },
  { slug: "top-canadian-etfs-tfsa", badge: "ETFs · TFSA", title: "Top 10 Canadian ETFs for TFSA", description: "TSX-listed broad-market and thematic ETFs — no US withholding tax inside a TFSA." },
];
