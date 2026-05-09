import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { allTopListsQuery } from "@/lib/sanity/queries";
import type { TopList } from "@/lib/types";
import { absoluteUrl, formatDate, SITE_NAME } from "@/lib/utils";

import Breadcrumb from "@/components/ui/Breadcrumb";
import SectorIcon, { ACCENT_RING } from "@/components/sectors/SectorIcon";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Top stocks by sector",
  description: `${SITE_NAME}'s evergreen top-stocks lists, organized by sector. Editor-led, refreshed periodically — the names worth owning right now in tech, financials, energy, healthcare, and more.`,
  alternates: { canonical: absoluteUrl("/top") },
};

export default async function TopIndexPage() {
  const lists = await client.fetch<TopList[]>(allTopListsQuery).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Top by sector" }]} />

      <header className="mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-200">
          <Trophy className="h-3.5 w-3.5" />
          Editor-led top lists
        </div>
        <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl">
          The best stocks in every sector.
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ash-300">
          Permanent reference lists, organized by industry. The names the
          editor thinks deserve a long-term position in each sector. Updated
          monthly when our view changes, not on a schedule. Different from the
          Weekly Top 10, which is a tactical, time-sensitive call.
        </p>
      </header>

      {lists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
          <p className="text-ash-300">
            No top lists published yet. Create one in Studio under{" "}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-xs text-accent-200">
              Top 10 by Sector
            </code>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Link
              key={list._id}
              href={`/top/${list.slug.current}`}
              className="group flex h-full flex-col rounded-2xl border border-ink-700 bg-ink-800/60 p-6 transition-all hover:border-accent-500/50 hover:bg-ink-800 hover:shadow-2xl hover:shadow-accent-500/5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset ${
                    ACCENT_RING[list.sector?.accent || "cyan"]
                  }`}
                >
                  <SectorIcon icon={list.sector?.icon} className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-ash-400">
                  {list.sector?.title}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-ash-50 group-hover:text-accent-200">
                {list.title}
              </h2>
              {list.subtitle && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ash-400">
                  {list.subtitle}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between border-t border-ink-700 pt-4 text-xs">
                <div className="text-ash-500">
                  {list.pickCount || 0} {list.pickCount === 1 ? "pick" : "picks"}
                  {list.lastUpdated && (
                    <>
                      {" "}
                      · Updated{" "}
                      <span className="text-ash-400">{formatDate(list.lastUpdated)}</span>
                    </>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 font-semibold text-accent-300">
                  Read list
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
