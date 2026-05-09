import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, Clock, Sparkles } from "lucide-react";

import { absoluteUrl } from "@/lib/utils";
import {
  listPublishedPosts,
  formatPostDate,
  type BeehiivPost,
} from "@/lib/newsletter/beehiiv-posts";

import Breadcrumb from "@/components/ui/Breadcrumb";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "The AlphaBeat Newsletter — Weekly Top 10 Stocks",
  description:
    "Free weekly investing intelligence. Every Sunday: 10 stocks ranked by conviction, with thesis, time horizon, and what could break the trade. Browse the full archive.",
  alternates: { canonical: absoluteUrl("/newsletter") },
  openGraph: {
    title: "The AlphaBeat Newsletter",
    description:
      "Weekly Top 10 stocks. Free. No spam. Editor-led, opinionated, beautifully simple.",
    type: "website",
    url: absoluteUrl("/newsletter"),
  },
};

export default async function NewsletterArchivePage() {
  const posts = await listPublishedPosts({ limit: 50 });

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Newsletter" }]} />

        <header className="relative mb-10 overflow-hidden rounded-3xl border border-accent-500/30 bg-gradient-to-br from-ink-900 via-ink-900 to-accent-950/40 px-6 py-12 sm:px-10 sm:py-14">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.18),transparent_55%)]"
          />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-300">
                <Sparkles className="h-3.5 w-3.5" />
                Free · Weekly · No spam, ever
              </div>
              <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl lg:text-5xl">
                The Top 10 stocks for the week ahead — in your inbox every
                Sunday.
              </h1>
              <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-ash-300 sm:text-lg">
                One email. Ten stocks. Each pick comes with the editor&rsquo;s
                full thesis, conviction level, time horizon, and what could
                break the trade. Hits your inbox before Monday&rsquo;s open.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-ash-300">
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" />
                  <span>
                    <strong className="text-ash-100">Sundays at 8pm ET.</strong>{" "}
                    Read it Sunday night, position size on Monday morning.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" />
                  <span>
                    <strong className="text-ash-100">5-minute read.</strong>{" "}
                    Tight, opinionated, built for busy investors.
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <NewsletterCTA
                source="newsletter-hero"
                variant="card"
                eyebrow="Subscribe"
                title="Join the AlphaBeat list"
                description="Free forever. Unsubscribe in one click. We never share your address."
              />
            </div>
          </div>
        </header>

        {/* Issue archive */}
        <section className="mb-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
                Past issues
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
                Read every issue we&rsquo;ve sent
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-ash-400">
                The full archive — ranked picks, theses, what worked, what
                didn&rsquo;t. Browse before subscribing.
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <EmptyArchive />
          ) : (
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, idx) => (
                <li key={post.id}>
                  <IssueCard post={post} number={posts.length - idx} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="mb-12">
          <Disclaimer />
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Issue card
// ============================================================================

interface IssueCardProps {
  post: BeehiivPost;
  /** Issue number, descending by recency (#N is the latest). */
  number: number;
}

function IssueCard({ post, number }: IssueCardProps) {
  const dateNum = post.publish_date || post.displayed_date;
  const dateLabel = formatPostDate(dateNum);
  const href = post.web_url || "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/60 transition-all hover:border-accent-500/40 hover:bg-ink-800"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-900">
        {post.thumbnail_url ? (
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-ink-800 to-accent-950/40">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent-300">
              AlphaBeat #{number}
            </span>
            <span className="mt-2 text-5xl font-black tracking-tighter text-accent-300/30">
              α
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
          <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-accent-300 ring-1 ring-inset ring-accent-500/30">
            Issue #{number}
          </span>
          {dateLabel && <span className="text-ash-500">{dateLabel}</span>}
        </div>

        <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-ash-50 group-hover:text-accent-200">
          {post.title}
        </h3>

        {post.subtitle && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ash-400">
            {post.subtitle}
          </p>
        )}

        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-accent-300">
          Read this issue
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </a>
  );
}

// ============================================================================
// Empty / not-yet-configured state
// ============================================================================

function EmptyArchive() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
      <Mail className="mx-auto h-10 w-10 text-ash-600" />
      <h3 className="mt-4 text-lg font-semibold text-ash-200">
        The archive is loading.
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ash-400">
        We&rsquo;re publishing weekly. Subscribe above to get the next issue
        delivered to your inbox the moment it goes out.
      </p>
    </div>
  );
}
