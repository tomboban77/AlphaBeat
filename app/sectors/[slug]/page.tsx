import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { client } from "@/lib/sanity/client";
import {
  sectorBySlugQuery,
  sectorSlugsQuery,
  stocksBySectorSlugQuery,
  insightsBySectorQuery,
} from "@/lib/sanity/queries";
import type { Sector, Stock, Insight } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";
import { urlFor } from "@/lib/sanity/image";

import Breadcrumb from "@/components/ui/Breadcrumb";
import StockGrid from "@/components/stocks/StockGrid";
import SectorIcon, { ACCENT_RING } from "@/components/sectors/SectorIcon";
import InsightCard from "@/components/insights/InsightCard";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

interface SectorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(sectorSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: SectorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sector = await client
    .fetch<Sector | null>(sectorBySlugQuery, { slug })
    .catch(() => null);
  if (!sector) return { title: "Sector not found" };
  const t = `${sector.title} stocks`;
  const d =
    sector.description ||
    sector.tagline ||
    `Editor-curated ${sector.title} stocks across US and Canadian markets.`;
  return {
    title: t,
    description: d,
    alternates: { canonical: absoluteUrl(`/sectors/${slug}`) },
    openGraph: { title: t, description: d, type: "website" },
  };
}

export default async function SectorPage({ params }: SectorPageProps) {
  const { slug } = await params;
  const [sector, stocks] = await Promise.all([
    client.fetch<Sector | null>(sectorBySlugQuery, { slug }).catch(() => null),
    client.fetch<Stock[]>(stocksBySectorSlugQuery, { slug }).catch(() => []),
  ]);
  if (!sector) notFound();

  const insights = await client
    .fetch<Insight[]>(insightsBySectorQuery, { sectorId: sector._id })
    .catch(() => []);

  const accent = sector.accent || "cyan";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Sectors", href: "/sectors" }, { label: sector.title }]}
      />

      {/* Hero */}
      <header className="relative mb-10 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/60 p-6 sm:p-10">
        {sector.heroImage?.asset && (
          <div className="absolute inset-0 -z-0 opacity-30">
            <Image
              src={urlFor(sector.heroImage).width(1600).height(600).url()}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-900/80 to-transparent" />
          </div>
        )}
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${ACCENT_RING[accent]}`}
            >
              <SectorIcon icon={sector.icon} className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
                {sector.title}
              </h1>
              {sector.tagline && (
                <p className="mt-2 max-w-xl text-base leading-relaxed text-ash-300">
                  {sector.tagline}
                </p>
              )}
              <div className="mt-3 text-sm text-ash-500">
                {stocks.length} {stocks.length === 1 ? "stock" : "stocks"} tracked
              </div>
            </div>
          </div>
        </div>
        {sector.description && (
          <p className="relative z-10 mt-6 max-w-3xl border-t border-ink-700 pt-6 text-sm leading-relaxed text-ash-300">
            {sector.description}
          </p>
        )}
      </header>

      {stocks.length > 0 ? (
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-2xl border border-ink-700 bg-ink-800/60"
                />
              ))}
            </div>
          }
        >
          <StockGrid stocks={stocks} withSparklines cols={3} />
        </Suspense>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
          <p className="text-ash-300">
            No stocks tagged in this sector yet.
          </p>
        </div>
      )}

      {insights.length > 0 && (
        <section className="mt-14 border-t border-ink-700 pt-10">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-ash-50">
            {sector.title} insights
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insights.slice(0, 6).map((i) => (
              <InsightCard key={i._id} insight={i} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}
