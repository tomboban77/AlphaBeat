import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";

import { absoluteUrl, SITE_NAME } from "@/lib/utils";
import { listPublishedPosts, formatPostDate } from "@/lib/newsletter/beehiiv-posts";

import Breadcrumb from "@/components/ui/Breadcrumb";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Newsletter Archive",
  description:
    `Browse every issue of The AlphaBeat Brief — one featured Canadian stock, one tax tip, one TSX note. Free weekly. ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl("/newsletter") },
};

export default async function NewsletterArchivePage() {
  const posts = await listPublishedPosts({ limit: 50 });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Newsletter archive" }]} />

      <header className="mb-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
          <Mail className="h-3.5 w-3.5" />
          Every Sunday
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          Newsletter archive
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ash-300">
          Every issue of The Brief — one featured Canadian stock, one tax or account tip,
          one TSX market note. Delivered free every Sunday.
        </p>
        <div className="mt-4">
          <Link
            href="/brief"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent-300 hover:text-accent-200"
          >
            Browse issues on the site <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <NewsletterCTA source="newsletter-archive" variant="banner" />

      {posts.length > 0 && (
        <div className="mt-12">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ash-500">
            {posts.length} issues published
          </div>
          <div className="space-y-3">
            {posts.map((post, idx) => (
              <a
                key={post.id}
                href={post.web_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-ink-700 bg-ink-800/40 px-5 py-4 transition-all hover:border-accent-500/40 hover:bg-ink-800"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-ash-500">
                    <span className="rounded-full bg-accent-500/10 px-2 py-0.5 font-semibold text-accent-400 ring-1 ring-inset ring-accent-500/30">
                      #{posts.length - idx}
                    </span>
                    {post.publish_date && (
                      <span>{formatPostDate(post.publish_date)}</span>
                    )}
                  </div>
                  <h2 className="mt-1.5 font-semibold text-ash-50 group-hover:text-accent-200 line-clamp-1">
                    {post.title}
                  </h2>
                  {post.subtitle && (
                    <p className="mt-0.5 text-sm text-ash-500 line-clamp-1">{post.subtitle}</p>
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-ash-600 group-hover:text-accent-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && (
        <div className="mt-12 rounded-2xl border border-ink-700 bg-ink-800/40 p-10 text-center">
          <h2 className="text-lg font-bold text-ash-50">Archive loading</h2>
          <p className="mt-2 text-sm text-ash-400">
            Issues appear here once Beehiiv API keys are configured.
            Subscribe above to get The Brief directly to your inbox.
          </p>
        </div>
      )}

      <div className="mt-14">
        <Disclaimer variant="block" />
      </div>
    </div>
  );
}
