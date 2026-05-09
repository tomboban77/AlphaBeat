import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { sectorsWithCountsQuery } from "@/lib/sanity/queries";
import type { Sector } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";

import Breadcrumb from "@/components/ui/Breadcrumb";
import SectorTile from "@/components/sectors/SectorTile";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sectors",
  description:
    "Explore every market sector — Tech, Energy, Healthcare, Financials, AI, EVs, and more. Each hub is editor-curated with the leaders and themes that explain the move.",
  alternates: { canonical: absoluteUrl("/sectors") },
};

export default async function SectorsPage() {
  const sectors = await client
    .fetch<Sector[]>(sectorsWithCountsQuery)
    .catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Sectors" }]} />

      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          Sectors
        </h1>
        <p className="mt-3 text-ash-300">
          Markets move in themes. We organize every ticker into the sector
          driving it. Click any sector to see the leaders, the laggards, and the
          editor&rsquo;s take on what&rsquo;s driving the move.
        </p>
      </header>

      {sectors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
          <p className="text-ash-300">
            No sectors yet. Create some in{" "}
            <Link
              href="/studio"
              className="font-semibold text-accent-300 underline-offset-2 hover:underline"
            >
              Sanity Studio
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sectors.map((sector) => (
            <SectorTile key={sector._id} sector={sector} count={sector.stockCount} />
          ))}
        </div>
      )}
    </div>
  );
}
