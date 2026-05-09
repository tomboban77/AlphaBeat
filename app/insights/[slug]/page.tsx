import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Hash } from "lucide-react";

import { client } from "@/lib/sanity/client";
import {
  insightBySlugQuery,
  insightSlugsQuery,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Insight } from "@/lib/types";
import {
  absoluteUrl,
  formatDate,
  SITE_NAME,
} from "@/lib/utils";

import Breadcrumb from "@/components/ui/Breadcrumb";
import PortableProse from "@/components/portable/PortableProse";
import SectorBadge from "@/components/sectors/SectorBadge";
import Disclaimer from "@/components/ui/Disclaimer";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";

export const revalidate = 600;

const KIND_LABEL: Record<string, string> = {
  analysis: "Analysis",
  news: "News",
  earnings: "Earnings",
  macro: "Macro",
  explainer: "Explainer",
  opinion: "Opinion",
};

interface InsightPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(insightSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: InsightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = await client
    .fetch<Insight | null>(insightBySlugQuery, { slug })
    .catch(() => null);
  if (!insight) return { title: "Insight not found" };
  const t = insight.metaTitle || insight.title;
  const d = insight.metaDescription || insight.excerpt || "";
  const url = absoluteUrl(`/insights/${insight.slug.current}`);
  const imageUrl = insight.mainImage?.asset
    ? urlFor(insight.mainImage).width(1200).height(630).url()
    : undefined;
  return {
    title: t,
    description: d,
    alternates: { canonical: url },
    openGraph: {
      title: t,
      description: d,
      url,
      type: "article",
      publishedTime: insight.publishedAt,
      modifiedTime: insight.updatedAt || insight.publishedAt,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: t,
      description: d,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function InsightPage({ params }: InsightPageProps) {
  const { slug } = await params;
  const insight = await client
    .fetch<Insight | null>(insightBySlugQuery, { slug })
    .catch(() => null);
  if (!insight) notFound();

  const url = absoluteUrl(`/insights/${insight.slug.current}`);
  const imageUrl = insight.mainImage?.asset
    ? urlFor(insight.mainImage).width(1200).height(630).url()
    : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.excerpt || "",
    url,
    image: imageUrl,
    datePublished: insight.publishedAt,
    dateModified: insight.updatedAt || insight.publishedAt,
    author: insight.author?.name
      ? { "@type": "Person", name: insight.author.name }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {insight.mainImage?.asset && (
        <div className="relative h-72 w-full sm:h-96">
          <Image
            src={urlFor(insight.mainImage).width(1600).height(800).url()}
            alt={insight.mainImage.alt || insight.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Insights", href: "/insights" },
            { label: insight.title.length > 40 ? insight.title.slice(0, 40) + "…" : insight.title },
          ]}
        />

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {insight.kind && (
              <span className="rounded-full bg-ink-800 px-2.5 py-1 font-semibold uppercase tracking-wider text-ash-300 ring-1 ring-inset ring-ink-600">
                {KIND_LABEL[insight.kind] || insight.kind}
              </span>
            )}
            {insight.sector && <SectorBadge sector={insight.sector} />}
          </div>
          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl lg:text-5xl">
            {insight.title}
          </h1>
          {insight.excerpt && (
            <p className="mt-3 text-lg leading-relaxed text-ash-300">
              {insight.excerpt}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-ash-400">
            {insight.author && (
              <div className="flex items-center gap-2">
                {insight.author.image?.asset ? (
                  <Image
                    src={urlFor(insight.author.image).width(64).height(64).url()}
                    alt={insight.author.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500/20 text-xs font-bold text-accent-300">
                    {insight.author.name?.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-ash-200">
                  {insight.author.name}
                </span>
                {insight.author.credentials && (
                  <span className="text-xs text-ash-500">
                    · {insight.author.credentials}
                  </span>
                )}
              </div>
            )}
            {insight.publishedAt && (
              <time
                dateTime={insight.publishedAt}
                className="inline-flex items-center gap-1"
              >
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(insight.publishedAt)}
              </time>
            )}
            {insight.readingTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {insight.readingTime} min read
              </span>
            )}
          </div>
        </header>

        {insight.tickers && insight.tickers.length > 0 && (
          <div className="mb-8 rounded-xl border border-ink-700 bg-ink-800/40 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ash-400">
              Tickers in this piece
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {insight.tickers.map((t) => (
                <Link
                  key={t._id}
                  href={`/stocks/${t.slug.current}`}
                  className="inline-flex items-center gap-1 rounded-md border border-ink-600 bg-ink-900 px-2.5 py-1 font-mono text-xs font-bold text-ash-100 transition-colors hover:border-accent-500/60 hover:text-accent-300"
                >
                  {t.ticker}
                </Link>
              ))}
            </div>
          </div>
        )}

        {insight.body && <PortableProse value={insight.body} size="lg" />}

        {insight.tags && insight.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-ink-700 pt-6">
            <Hash className="h-3.5 w-3.5 text-ash-500" />
            {insight.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-ink-800 px-2 py-0.5 text-xs text-ash-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10">
          <NewsletterCTA
            source={`insight-${insight.slug.current}`}
            variant="card"
            eyebrow="Liked this read?"
            title="Get the next one in your inbox."
            description="One email every Sunday with the editor's Top 10 stocks for the week, plus our latest insights. Free, no spam."
          />
        </div>

        <div className="mt-10">
          <Disclaimer variant="block" />
        </div>
      </div>
    </article>
  );
}
