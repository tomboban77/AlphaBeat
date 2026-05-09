import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Gem,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { absoluteUrl } from "@/lib/utils";
import { listPublishedPosts, formatPostDate } from "@/lib/newsletter/beehiiv-posts";

import NewsletterCTA from "@/components/newsletter/NewsletterCTA";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Subscribe — The AlphaBeat Weekly Top 10",
  description:
    "Free weekly newsletter. Every Sunday: ten stocks ranked by conviction, with the editor's full thesis. Position size on Monday morning.",
  alternates: { canonical: absoluteUrl("/subscribe") },
  openGraph: {
    title: "Subscribe to AlphaBeat",
    description:
      "Free. Sundays at 8pm ET. Ten stocks ranked by conviction, with thesis. Built for self-directed investors.",
    type: "website",
    url: absoluteUrl("/subscribe"),
  },
};

export default async function SubscribePage() {
  const recent = await listPublishedPosts({ limit: 3 });
  const latest = recent[0];

  return (
    <div className="bg-ink-950">
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden border-b border-ink-800">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_-10%,rgba(34,211,238,0.18),transparent_50%),radial-gradient(circle_at_85%_15%,rgba(167,139,250,0.12),transparent_55%)]"
        />
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-300">
            <Sparkles className="h-3.5 w-3.5" />
            Free · Weekly · Unsubscribe anytime
          </div>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl lg:text-6xl">
            Ten stocks.{" "}
            <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-violet-400 bg-clip-text text-transparent">
              Every Sunday.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-ash-300 sm:text-lg">
            One email a week with the editor&rsquo;s top ten stocks for the week
            ahead — ranked by conviction, with thesis, time horizon, and what
            could break each trade. Read it Sunday night, position size on
            Monday morning.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <NewsletterForm source="subscribe-hero" ctaLabel="Subscribe — it's free" />
            <p className="mt-3 text-xs text-ash-500">
              Free forever. No credit card. Unsubscribe in one click.
            </p>
          </div>

          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ash-400">
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-up-400" />
              No spam, ever
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-up-400" />
              Bull and bear case for every name
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-up-400" />
              US &amp; Canadian markets
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-up-400" />
              Free forever
            </li>
          </ul>
        </div>
      </section>

      {/* ============================================ WHAT YOU GET (BENEFITS) */}
      <section className="border-b border-ink-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
              What you get
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
              Everything you need to start the week with conviction.
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <Benefit
              icon={<Target className="h-5 w-5 text-accent-300" />}
              title="The week's Top 10, ranked by conviction"
              body="Not 50 names dumped in your inbox. Ten. Ranked. Each with a numbered conviction tier (high / medium / low) and a clear time horizon."
            />
            <Benefit
              icon={<Compass className="h-5 w-5 text-violet-300" />}
              title="The full thesis — bull AND bear"
              body="Why the trade works, what could break it, what to watch. We tell you the risks before they bite. No clickbait, no pump-and-dump."
            />
            <Benefit
              icon={<Gem className="h-5 w-5 text-fuchsia-300" />}
              title="Hidden Gems alerts"
              body="When a new sub-$20 idea with asymmetric upside lands, subscribers see it the same day it goes live — with the editor's full thesis."
            />
            <Benefit
              icon={<TrendingUp className="h-5 w-5 text-up-300" />}
              title="Built for both US and Canadian investors"
              body="NASDAQ, NYSE, TSX, TSXV. Currency-aware. Tax-aware where relevant. The only investing newsletter that takes Canada seriously."
            />
            <Benefit
              icon={<Clock className="h-5 w-5 text-warn-300" />}
              title="A 5-minute read, not a research report"
              body="Tight. Opinionated. No filler. We respect your Sunday night."
            />
            <Benefit
              icon={<ShieldCheck className="h-5 w-5 text-up-300" />}
              title="Free forever. Unsubscribe in one click."
              body="No paid tiers, no upsell funnel, no dark patterns. If we ever lose your trust, you're one click from leaving."
            />
          </div>
        </div>
      </section>

      {/* =================================================== SAMPLE / LATEST */}
      {latest && latest.web_url && (
        <section className="border-b border-ink-800 bg-ink-900/30">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
                Last week&rsquo;s issue
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
                Read a sample issue before you subscribe.
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-ash-400">
                Take five minutes. See the format, the voice, the level of
                detail. Then decide.
              </p>
            </div>

            <a
              href={latest.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-accent-500/30 bg-gradient-to-br from-ink-800 via-ink-900 to-accent-950/40 p-8 transition-all hover:border-accent-500/60 hover:shadow-2xl hover:shadow-accent-500/10 sm:p-10"
            >
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-accent-300 ring-1 ring-inset ring-accent-500/30">
                  Latest issue
                </span>
                {latest.publish_date && (
                  <span className="text-ash-500">
                    {formatPostDate(latest.publish_date)}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
                {latest.title}
              </h3>
              {latest.subtitle && (
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ash-300">
                  {latest.subtitle}
                </p>
              )}
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-300">
                Read this issue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>

            <div className="mt-6 text-center">
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-1 text-sm font-semibold text-ash-300 hover:text-accent-300"
              >
                Browse the full archive
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================== HOW IT WORKS */}
      <section className="border-b border-ink-800">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
              How it works
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
              Four steps. That&rsquo;s it.
            </h2>
          </div>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Step n={1} title="Subscribe">
              Drop your email. No password, no profile, no commitment.
            </Step>
            <Step n={2} title="Get the welcome">
              We&rsquo;ll send a quick welcome explaining the format and what
              to expect.
            </Step>
            <Step n={3} title="Sundays at 8pm ET">
              The Top 10 lands in your inbox every Sunday evening, before
              Monday&rsquo;s open.
            </Step>
            <Step n={4} title="Read. Decide. Act.">
              Five-minute read. Opinionated. Bull and bear case for every name.
              You decide what fits your portfolio.
            </Step>
          </ol>
        </div>
      </section>

      {/* =========================================================== PROMISE */}
      <section className="border-b border-ink-800 bg-ink-900/30">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
              Our promise
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
              What we will and won&rsquo;t do.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-up-500/30 bg-up-500/5 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-up-300">
                We will
              </div>
              <ul className="space-y-2 text-sm text-ash-200">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-up-400" />
                  Tell you the bear case alongside the bull case
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-up-400" />
                  Disclose when a stock is a paid sponsorship (clearly labeled)
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-up-400" />
                  Update conviction when our view changes
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-up-400" />
                  Keep it free, forever
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-down-500/30 bg-down-500/5 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-down-300">
                We won&rsquo;t
              </div>
              <ul className="space-y-2 text-sm text-ash-200">
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-down-400 text-center text-[10px] font-bold leading-[14px] text-down-300">
                    ✕
                  </span>
                  Send daily blasts, deals, or affiliate junk
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-down-400 text-center text-[10px] font-bold leading-[14px] text-down-300">
                    ✕
                  </span>
                  Sell your email or share your data
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-down-400 text-center text-[10px] font-bold leading-[14px] text-down-300">
                    ✕
                  </span>
                  Pretend to give personalized financial advice
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-down-400 text-center text-[10px] font-bold leading-[14px] text-down-300">
                    ✕
                  </span>
                  Hide behind a paywall to feel premium
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================== FAQ */}
      <section className="border-b border-ink-800">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
              Common questions
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
              Frequently asked.
            </h2>
          </div>
          <div className="space-y-3">
            <Faq q="Is this really free?">
              Yes. The newsletter and the entire site are free. We may run
              clearly-labeled sponsored content from listed companies in the
              future, but it will never replace the editor&rsquo;s top picks.
            </Faq>
            <Faq q="Is this investment advice?">
              No. AlphaBeat is an educational publication. Nothing we write is
              personalized financial, tax, or legal advice. Always do your own
              research and consult a qualified professional before acting on
              any idea here.
            </Faq>
            <Faq q="How do you choose the Top 10?">
              The editor reads earnings, watches sector flows, screens for
              business momentum lining up with technical setups, and ranks the
              names by conviction. Each pick has a written thesis, a time
              horizon, and a stated bear case.
            </Faq>
            <Faq q="What's the unsubscribe process?">
              Every email has a one-click unsubscribe link in the footer. No
              friction, no &ldquo;are you sure&rdquo; loops, no exit survey.
            </Faq>
            <Faq q="Do you cover crypto, options, or futures?">
              Not in v1. We focus on equities and ETFs in US and Canadian
              markets. Crypto and derivatives may come later — we&rsquo;ll tell
              you before we expand.
            </Faq>
            <Faq q="Can I forward the newsletter?">
              Please do. If a friend forwards it to you and you want it
              directly, just sign up here.
            </Faq>
          </div>
        </div>
      </section>

      {/* ====================================================== FINAL CTA */}
      <section className="border-b border-ink-800 bg-ink-950">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <NewsletterCTA
            source="subscribe-bottom"
            variant="banner"
            eyebrow="Last call"
            title="Start your Sunday with conviction."
            description="Free. Weekly. Unsubscribe anytime. Join investors who'd rather read ten well-argued ideas than scroll a feed of clickbait."
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Disclaimer />
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-5 transition-colors hover:border-ink-600 hover:bg-ink-800/60">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 ring-1 ring-inset ring-ink-700">
        {icon}
      </div>
      <h3 className="text-base font-bold text-ash-50">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ash-400">{body}</p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-2xl border border-ink-700 bg-ink-800/40 p-5">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-500/15 font-mono text-sm font-bold text-accent-300 ring-1 ring-inset ring-accent-500/30">
        {n}
      </div>
      <h3 className="text-base font-bold text-ash-50">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ash-400">{children}</p>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-ink-700 bg-ink-800/40 p-5 transition-colors open:bg-ink-800/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold text-ash-100">
        <span>{q}</span>
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-600 text-ash-400 transition-transform group-open:rotate-45">
          <Mail className="hidden" />
          <span aria-hidden>+</span>
        </span>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-ash-300">{children}</div>
    </details>
  );
}
