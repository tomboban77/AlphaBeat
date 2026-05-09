import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import {
  paginatedInsightsQuery,
  insightCountQuery,
} from "@/lib/sanity/queries";
import type { Insight } from "@/lib/types";
import { absoluteUrl, siteUrl } from "@/lib/utils";

import Breadcrumb from "@/components/ui/Breadcrumb";
import InsightCard from "@/components/insights/InsightCard";
import Pagination from "@/components/ui/Pagination";

export const revalidate = 600;

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Editorial analysis, earnings recaps, macro reads, and explainers from the AlphaBeat editorial team.",
  alternates: { canonical: absoluteUrl("/insights") },
};

interface InsightsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const [insights, count] = await Promise.all([
    client.fetch<Insight[]>(paginatedInsightsQuery, { start, end }).catch(() => []),
    client.fetch<number>(insightCountQuery).catch(() => 0),
  ]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const [feature, ...rest] = insights;

  return (
    <>
      {page > 1 && (
        <link
          rel="prev"
          href={`${siteUrl()}${page === 2 ? "/insights" : `/insights?page=${page - 1}`}`}
        />
      )}
      {page < totalPages && (
        <link rel="next" href={`${siteUrl()}/insights?page=${page + 1}`} />
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Insights" }]} />

        <header className="mb-10 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
            Insights
          </h1>
          <p className="mt-3 text-ash-300">
            Independent analysis. Earnings recaps. Macro reads. Explainers
            written by humans who own positions and disclose their risks.
          </p>
        </header>

        {insights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
            <p className="text-ash-300">No insights published yet.</p>
          </div>
        ) : (
          <>
            {page === 1 && feature && (
              <div className="mb-10">
                <InsightCard insight={feature} variant="feature" />
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(page === 1 ? rest : insights).map((i) => (
                <InsightCard key={i._id} insight={i} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/insights"
            />
          </>
        )}
      </div>
    </>
  );
}
