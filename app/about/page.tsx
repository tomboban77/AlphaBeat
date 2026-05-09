import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, Sparkles } from "lucide-react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE_NAME} is the editor-led investing platform for stocks worth watching across US and Canadian markets.`,
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "About" }]} />

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl">
          We pick stocks worth watching. <br />
          We tell you why. We tell you the risks.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ash-300">
          {SITE_NAME} is an editor-led investing platform covering US and
          Canadian markets. We cut through the noise of generic &ldquo;buy
          ratings&rdquo; and clickbait price targets — and replace it with
          hand-picked tickers, a one-line thesis, the bull case, and the risks
          nobody else writes down.
        </p>
      </header>

      <section className="space-y-10">
        <Card icon={<Eye className="h-6 w-6 text-accent-400" />} title="What we do">
          <p>
            Every week we publish a Top 10 — the stocks our editors think
            deserve your attention right now. Every day we surface trending
            tickers and themes by sector. Every stock has an editor&rsquo;s take, a
            chart, key catalysts, and the risks. ETFs get the same treatment.
          </p>
        </Card>

        <Card icon={<ShieldCheck className="h-6 w-6 text-up-400" />} title="How we make money">
          <p>
            Three streams: programmatic ads (think AdSense / Ezoic), affiliate
            referrals to brokerages, and clearly-labelled sponsorships from
            listed companies. Sponsorships buy visibility — never editorial.
            See <Link href="/sponsor#policy" className="font-medium text-accent-300 hover:text-accent-200">our sponsorship policy</Link>.
          </p>
        </Card>

        <Card icon={<Sparkles className="h-6 w-6 text-violet-400" />} title="What this isn&rsquo;t">
          <p>
            {SITE_NAME} is not a brokerage, not a registered investment adviser,
            and not your fiduciary. We don&rsquo;t manage money. We publish opinions
            and educational content. Always do your own research and consult a
            qualified adviser before investing.
          </p>
        </Card>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/weekly-picks"
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
        >
          See this week&rsquo;s Top 10
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/disclaimer"
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
        >
          Read our disclaimer
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
      <div className="prose prose-ab mt-3 max-w-none text-ash-200">
        {children}
      </div>
    </div>
  );
}
