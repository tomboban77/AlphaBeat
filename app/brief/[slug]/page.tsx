import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { briefBySlugQuery, briefSlugsQuery } from "@/lib/sanity/queries";
import type { Brief } from "@/lib/types";
import { absoluteUrl, formatDate, SITE_NAME } from "@/lib/utils";

import PortableProse from "@/components/portable/PortableProse";
import { ScrollTracker } from "@/components/analytics/PageTracker";
import AffiliateSlot from "@/lib/affiliates/slots";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import Disclaimer from "@/components/ui/Disclaimer";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(briefSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brief = await client.fetch<Brief | null>(briefBySlugQuery, { slug }).catch(() => null);
  if (!brief) return { title: "Issue not found" };
  const url = absoluteUrl(`/brief/${slug}`);
  return {
    title: `#${brief.issueNumber} — ${brief.title} · ${SITE_NAME}`,
    description: brief.seoDescription || `The AlphaBeat Brief, issue #${brief.issueNumber}. ${brief.title}.`,
    alternates: { canonical: url },
    openGraph: { title: brief.title, description: brief.seoDescription || "", url, type: "article" },
  };
}

export default async function BriefIssuePage({ params }: PageProps) {
  const { slug } = await params;
  const brief = await client.fetch<Brief | null>(briefBySlugQuery, { slug }).catch(() => null);
  if (!brief) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: brief.title,
    datePublished: brief.publishedAt,
    author: brief.author ? { "@type": "Person", name: brief.author.name } : undefined,
    publisher: { "@type": "Organization", name: SITE_NAME },
    url: absoluteUrl(`/brief/${slug}`),
  };

  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <ScrollTracker slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb items={[{ label: "The Brief", href: "/brief" }, { label: `Issue #${brief.issueNumber}` }]} />

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-accent-500/10 px-2.5 py-1 font-semibold text-accent-300 ring-1 ring-inset ring-accent-500/30">
            Issue #{brief.issueNumber}
          </span>
          {brief.publishedAt && <span className="text-ash-500">{formatDate(brief.publishedAt)}</span>}
          {brief.featureStock && (
            <Link
              href={`/stocks/${brief.featureStock.slug.current}`}
              className="rounded bg-ink-700 px-2 py-0.5 font-mono text-sm text-accent-300 hover:text-accent-200"
            >
              {brief.featureStock.ticker}
            </Link>
          )}
          {brief.author && <span className="text-ash-500">by {brief.author.name}</span>}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          {brief.title}
        </h1>
        {brief.tsxQuickNote && (
          <p className="mt-3 rounded-xl border border-ink-700 bg-ink-800/60 px-4 py-3 text-sm text-ash-300">
            🇨🇦 <strong className="text-ash-200">TSX note:</strong> {brief.tsxQuickNote}
          </p>
        )}
      </header>

      {/* Feature thesis */}
      {brief.featureThesis && brief.featureThesis.length > 0 && (
        <section className="mb-10">
          {brief.featureStock && (
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
              Featured: {brief.featureStock.ticker} — {brief.featureStock.companyName}
            </div>
          )}
          <PortableProse value={brief.featureThesis} size="lg" />
          {brief.featureStock && (
            <div className="mt-6">
              <Link
                href={`/stocks/${brief.featureStock.slug.current}`}
                className="inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-4 py-2 text-sm font-semibold text-accent-300 hover:border-accent-500/70 hover:text-accent-200"
              >
                View full Stock File for {brief.featureStock.ticker}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Tax / account tip */}
      {brief.taxOrAccountTip && brief.taxOrAccountTip.length > 0 && (
        <section className="mb-10 rounded-2xl border border-accent-500/20 bg-accent-500/5 p-6">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
            Tax &amp; account tip
          </div>
          <PortableProse value={brief.taxOrAccountTip} size="sm" />
        </section>
      )}

      {/* Affiliate + Subscribe */}
      <AffiliateSlot context="stock-file" enableAffiliates={true} />

      <div className="mt-6">
        <NewsletterCTA source="brief-issue" variant="banner" />
      </div>

      {/* Nav */}
      <div className="mt-10 flex justify-between">
        <Link href="/brief" className="inline-flex items-center gap-1 text-sm text-ash-400 hover:text-ash-200">
          <ArrowLeft className="h-4 w-4" /> All issues
        </Link>
      </div>

      <div className="mt-12">
        <Disclaimer variant="block" />
      </div>
    </article>
  );
}
