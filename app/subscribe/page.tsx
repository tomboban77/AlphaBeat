import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart2, BookOpen, FileText, Star } from "lucide-react";

import { absoluteUrl, SITE_NAME } from "@/lib/utils";

import NewsletterForm from "@/components/newsletter/NewsletterForm";
import Disclaimer from "@/components/ui/Disclaimer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Subscribe — The AlphaBeat Brief",
  description:
    `Free weekly newsletter for Canadian investors. One featured stock, one tax tip, one TSX note. Every Sunday. ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl("/subscribe") },
  openGraph: {
    title: "Subscribe to The AlphaBeat Brief",
    description:
      "One featured Canadian stock. One tax or account tip. One TSX market note. Every Sunday, free.",
    type: "website",
    url: absoluteUrl("/subscribe"),
  },
};

export default function SubscribePage() {
  return (
    <div className="bg-ink-950">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-800">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_-10%,rgba(34,211,238,0.18),transparent_50%),radial-gradient(circle_at_85%_15%,rgba(167,139,250,0.12),transparent_55%)]"
        />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-300">
            Free · Every Sunday
          </div>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl lg:text-6xl">
            The Brief.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg leading-relaxed text-ash-300">
            One featured Canadian stock with a full thesis. One tax or account tip.
            One TSX market note. Done in under 10 minutes. Free, every Sunday.
          </p>

          <div className="mx-auto mt-8 max-w-md">
            <NewsletterForm
              source="subscribe-hero"
              ctaLabel="Subscribe free"
              variant="inline"
              placeholder="your@email.com"
            />
            <p className="mt-3 text-xs text-ash-500">
              No spam. Educational only — not investment advice.{" "}
              <Link href="/privacy-policy" className="underline hover:text-ash-400">Privacy policy</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="border-b border-ink-800">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-ash-50">
            What&apos;s in each issue
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-6">
              <FileText className="mb-3 h-6 w-6 text-accent-400" />
              <h3 className="font-bold text-ash-50">Featured stock</h3>
              <p className="mt-2 text-sm leading-relaxed text-ash-400">
                One Canadian stock with a full thesis — what the company does, why it&apos;s
                interesting now, the bull case, the bear case. 400–500 words.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-6">
              <BarChart2 className="mb-3 h-6 w-6 text-up-400" />
              <h3 className="font-bold text-ash-50">Tax or account tip</h3>
              <p className="mt-2 text-sm leading-relaxed text-ash-400">
                One practical tip on TFSA, RRSP, FHSA, eligible dividends, or
                asset location — connected to the stock featured that week.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-6">
              <BookOpen className="mb-3 h-6 w-6 text-violet-400" />
              <h3 className="font-bold text-ash-50">TSX market note</h3>
              <p className="mt-2 text-sm leading-relaxed text-ash-400">
                One sentence on what moved the TSX this week and why it matters.
                Context, not noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for */}
      <section className="border-b border-ink-800 bg-ink-900/30">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-ash-50">
            Built for Canadian DIY investors
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "You use Wealthsimple or Questrade — not a full-service broker",
              "You know what a TFSA is but want to understand asset location better",
              "You care about the after-tax return, not just the headline yield",
              "You want to understand eligible dividends, not just collect them",
              "You&apos;re tired of generic investing content that doesn&apos;t mention Canada",
              "You want to learn, not be told what to buy",
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-ink-700 bg-ink-800/40 p-4">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                <span className="text-sm text-ash-300" dangerouslySetInnerHTML={{ __html: point }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Also on the site */}
      <section className="border-b border-ink-800">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="mb-2 text-xl font-bold text-ash-50">Also on the site — free, no subscription needed</h2>
          <p className="mb-6 text-ash-400">The Brief is the email layer. Everything else is on the site.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/stocks" className="group rounded-xl border border-ink-700 bg-ink-800/40 p-4 transition-all hover:border-accent-500/40">
              <div className="font-semibold text-ash-100 group-hover:text-accent-200">Stock Files</div>
              <p className="mt-1 text-xs text-ash-500">38 TSX and US stocks scored on 6 factors</p>
            </Link>
            <Link href="/playbooks" className="group rounded-xl border border-ink-700 bg-ink-800/40 p-4 transition-all hover:border-accent-500/40">
              <div className="font-semibold text-ash-100 group-hover:text-accent-200">Playbooks</div>
              <p className="mt-1 text-xs text-ash-500">TFSA asset location, dividend investing, precious metals</p>
            </Link>
            <Link href="/best" className="group rounded-xl border border-ink-700 bg-ink-800/40 p-4 transition-all hover:border-accent-500/40">
              <div className="font-semibold text-ash-100 group-hover:text-accent-200">Top Lists</div>
              <p className="mt-1 text-xs text-ash-500">Best Canadian dividend, bank, and ETF picks by category</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-ink-950">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-ash-50">Ready to read?</h2>
          <p className="mt-2 text-ash-400">Free. Unsubscribe in one click. No spam.</p>
          <div className="mx-auto mt-6 max-w-sm">
            <NewsletterForm source="subscribe-bottom" ctaLabel="Subscribe free" variant="stacked" />
          </div>
          <div className="mt-6">
            <Link href="/brief" className="inline-flex items-center gap-1 text-sm text-ash-500 hover:text-ash-300">
              Read recent issues first <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
          <Disclaimer variant="block" />
        </div>
      </section>
    </div>
  );
}
