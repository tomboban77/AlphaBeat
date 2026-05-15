import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { playbookBySlugQuery, playbookSlugsQuery } from "@/lib/sanity/queries";
import type { Playbook } from "@/lib/types";
import { absoluteUrl, formatDate, SITE_NAME } from "@/lib/utils";

import PortableProse from "@/components/portable/PortableProse";
import PlaybookSections from "@/components/playbooks/PlaybookSections";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import Disclaimer from "@/components/ui/Disclaimer";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(playbookSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pb = await client.fetch<Playbook | null>(playbookBySlugQuery, { slug }).catch(() => null);
  if (!pb) return { title: "Playbook not found" };
  const url = absoluteUrl(`/playbooks/${slug}`);
  return {
    title: `${pb.title} | ${SITE_NAME}`,
    description: pb.seoDescription || `${pb.title} — a deep-dive investing guide for Canadian investors.`,
    alternates: { canonical: url },
    openGraph: { title: pb.title, url, type: "article" },
  };
}

export default async function PlaybookPage({ params }: PageProps) {
  const { slug } = await params;
  const pb = await client.fetch<Playbook | null>(playbookBySlugQuery, { slug }).catch(() => null);
  if (!pb) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pb.title,
    dateModified: pb.lastUpdated,
    description: pb.seoDescription,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[{ label: "Playbooks", href: "/playbooks" }, { label: pb.title }]} />

      <header className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Playbook</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">{pb.title}</h1>
        {pb.lastUpdated && (
          <p className="mt-3 text-sm text-ash-500">Last updated: {formatDate(pb.lastUpdated)}</p>
        )}
      </header>

      {pb.intro && pb.intro.length > 0 && (
        <div className="mb-10">
          <PortableProse value={pb.intro} size="lg" />
        </div>
      )}

      {pb.sections && pb.sections.length > 0 && (
        <PlaybookSections sections={pb.sections} slug={slug} />
      )}

      <div className="mt-12">
        <NewsletterCTA source="playbook" variant="banner" />
      </div>

      <div className="mt-8 flex justify-between">
        <Link href="/playbooks" className="inline-flex items-center gap-1 text-sm text-ash-400 hover:text-ash-200">
          <ArrowLeft className="h-4 w-4" /> All Playbooks
        </Link>
      </div>

      <div className="mt-12">
        <Disclaimer variant="block" />
      </div>
    </article>
  );
}

