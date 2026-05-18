import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart2, BookOpen, FileText, ShieldCheck } from "lucide-react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About AlphaBeat",
  description: `${SITE_NAME} helps Canadian millennials and Gen Z invest with clarity — tax-aware, account-aware, and TSX-fluent. This is what we do and why.`,
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "About" }]} />

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl">
          Canadian investing, made clearer.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ash-300">
          {SITE_NAME} helps Canadian millennials and Gen Z invest with clarity —
          tax-aware, account-aware, and TSX-fluent. We&rsquo;re built for the
          Wealthsimple and Questrade generation: people who know what a TFSA is
          but want deeper understanding of asset location, eligible dividends,
          and how to make the most of every registered account.
        </p>
      </header>

      <section className="space-y-6">
        <Card icon={<FileText className="h-6 w-6 text-accent-400" />} title="The Brief">
          <p>
            Every Sunday we publish a short, focused newsletter called The Brief.
            One featured Canadian stock with a full thesis, one tax or account tip
            (TFSA vs RRSP vs FHSA), and one TSX market note. 500–800 words.
            Free, always.
          </p>
        </Card>

        <Card icon={<BarChart2 className="h-6 w-6 text-up-400" />} title="Stock Files">
          <p>
            Every ticker on AlphaBeat gets a Stock File — a score-driven
            reference page built for Canadian investors. Six factors: Value,
            Growth, Quality, Dividend Safety, Momentum, and Canadian Tax
            Efficiency. Plus an Account Fit table that shows whether a stock
            belongs in your TFSA, RRSP, FHSA, or non-registered account, and
            why. Scores refresh daily from Finnhub data.
          </p>
        </Card>

        <Card icon={<BookOpen className="h-6 w-6 text-violet-400" />} title="Playbooks">
          <p>
            Deep evergreen guides on topics every Canadian investor needs to
            understand: TFSA asset location, eligible dividend investing,
            precious metals in a Canadian portfolio. Written once, kept current.
            Each Playbook answers one question completely.
          </p>
        </Card>

        <Card icon={<ShieldCheck className="h-6 w-6 text-warn-400" />} title="What this isn&rsquo;t">
          <p>
            {SITE_NAME} is not a brokerage, not a registered investment adviser,
            and not your fiduciary. We&rsquo;re not registered under IIROC, the OSC,
            or any provincial securities regulator. We publish opinions and
            educational content. Nothing here is a recommendation to buy, sell,
            or hold any security.{" "}
            <Link href="/disclaimer" className="font-medium text-accent-300 hover:text-accent-200">
              Read our full disclaimer
            </Link>
            .
          </p>
        </Card>

        <Card icon={<ArrowRight className="h-6 w-6 text-ash-400" />} title="How we make money">
          <p>
            Affiliate referrals to Canadian brokerages (Wealthsimple, Questrade,
            Qtrade) and, eventually, clearly-labelled sponsorships from listed
            companies. Sponsorships buy visibility — never editorial opinion.
            We do not run display ads.{" "}
            <Link href="/sponsor#policy" className="font-medium text-accent-300 hover:text-accent-200">
              Sponsorship policy →
            </Link>
          </p>
        </Card>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/brief"
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
        >
          Read The Brief
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/stocks"
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
        >
          Browse Stock Files
        </Link>
        <Link
          href="/methodology"
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
        >
          How scores work
        </Link>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-6">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-xl font-bold text-ash-50">{title}</h2>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-ash-300">{children}</div>
    </div>
  );
}
