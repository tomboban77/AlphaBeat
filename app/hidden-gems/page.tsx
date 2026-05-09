import type { Metadata } from "next";
import Link from "next/link";
import { Gem, ShieldCheck, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { hiddenGemsQuery } from "@/lib/sanity/queries";
import type { Stock, MarketQuote, CandlePoint } from "@/lib/types";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";
import { getQuotes, getCandles } from "@/lib/market/finnhub";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";

import Breadcrumb from "@/components/ui/Breadcrumb";
import Disclaimer from "@/components/ui/Disclaimer";
import HiddenGemCard from "@/components/stocks/HiddenGemCard";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Hidden Gems — Top stocks under $20 with huge upside",
  description: `Editor-led list of stocks under $20 with asymmetric upside. ${SITE_NAME} surfaces the small caps and turnaround stories worth watching — with the bull case, bear case, and risk score for each.`,
  alternates: { canonical: absoluteUrl("/hidden-gems") },
  openGraph: {
    title: "Hidden Gems — Stocks under $20 with asymmetric upside",
    description: "Editor-led, opinionated, risk-scored. The small caps worth watching.",
    type: "website",
  },
};

export default async function HiddenGemsPage() {
  const gems = await client.fetch<Stock[]>(hiddenGemsQuery).catch(() => []);

  const symbols = gems.map((s) => s.ticker);
  const [quoteMap, sparkResults] = await Promise.all([
    getQuotes(symbols),
    Promise.all(symbols.map(async (s) => [s, await getCandles(s, "1M")] as const)),
  ]);

  const quotes: Record<string, MarketQuote> = {};
  for (const [sym, q] of quoteMap.entries()) quotes[sym] = q;

  const sparks: Record<string, CandlePoint[]> = {};
  for (const [s, c] of sparkResults) sparks[normalizeFinnhubSymbol(s)] = c;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Hidden Gems" }]} />

      <header className="relative mb-10 overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-ink-900 via-violet-950/50 to-ink-900 p-6 sm:p-10">
        <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,theme(colors.violet.500/0.4),transparent_50%),radial-gradient(circle_at_80%_70%,theme(colors.fuchsia.500/0.3),transparent_55%)]" />

        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-200">
          <Gem className="h-3.5 w-3.5" />
          Hidden Gems
        </div>
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl">
          Sub-$20 names with asymmetric upside.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ash-300">
          A small, hand-picked list of stocks priced under $20 where the
          editor sees outsized return potential relative to the downside. Each
          pick comes with an entry price, a bull case, the risks, and a risk
          score. These are speculative ideas. Position size accordingly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#picks"
            className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-violet-400"
          >
            See the picks
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#how-we-pick"
            className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800/60 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
          >
            How we pick
          </Link>
        </div>
      </header>

      <section className="mb-10 grid gap-3 sm:grid-cols-3">
        <Stat
          icon={<TrendingUp className="h-5 w-5 text-violet-300" />}
          label="Asymmetric upside"
          value="2-5×"
          sub="Target return profile across a 24-36 month view"
        />
        <Stat
          icon={<ShieldCheck className="h-5 w-5 text-up-300" />}
          label="Risk-scored"
          value="Every pick"
          sub="Low → Speculative, marked clearly on each card"
        />
        <Stat
          icon={<AlertTriangle className="h-5 w-5 text-warn-300" />}
          label="Position size"
          value="Small"
          sub="These are option-like bets, not core holdings"
        />
      </section>

      <section id="picks" className="mb-12 scroll-mt-24">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
            This month&rsquo;s picks
            <span className="ml-2 text-base font-medium text-ash-500">
              ({gems.length})
            </span>
          </h2>
        </div>

        {gems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
            <p className="text-ash-300">
              No Hidden Gems published yet. Tag a stock with{" "}
              <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-xs text-violet-200">
                hidden-gem
              </code>{" "}
              in Studio to add it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gems.map((stock) => (
              <HiddenGemCard
                key={stock._id}
                stock={stock}
                quote={quotes[normalizeFinnhubSymbol(stock.ticker)]}
                spark={sparks[normalizeFinnhubSymbol(stock.ticker)]}
              />
            ))}
          </div>
        )}
      </section>

      <section
        id="how-we-pick"
        className="mb-12 scroll-mt-24 grid gap-5 rounded-2xl border border-ink-700 bg-ink-900/50 p-6 sm:p-8 md:grid-cols-2"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ash-50">How we pick</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ash-300">
            <li>
              <span className="font-semibold text-ash-100">Price under $20.</span>{" "}
              Lower share price doesn&rsquo;t mean &ldquo;cheap,&rdquo; but it gives
              retail investors the optionality to size a real position.
            </li>
            <li>
              <span className="font-semibold text-ash-100">A real business.</span>{" "}
              Revenue, a product, customers — we skip pre-revenue concept stocks
              and shell companies.
            </li>
            <li>
              <span className="font-semibold text-ash-100">A specific catalyst.</span>{" "}
              Every pick has a clear thesis for what gets the stock re-rated.
            </li>
            <li>
              <span className="font-semibold text-ash-100">Risk on the front of the card.</span>{" "}
              No buried disclaimers. Every Hidden Gem carries a visible risk
              score so you can size accordingly.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ash-50">
            How to read the risk score
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ash-300">
            <li>
              <span className="rounded-full bg-up-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-up-300 ring-1 ring-inset ring-up-500/30">
                Low risk
              </span>{" "}
              — Profitable, durable, modest drawdown profile.
            </li>
            <li>
              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-500/30">
                Medium risk
              </span>{" "}
              — Mainstream growth story; volatile but fundamentals visible.
            </li>
            <li>
              <span className="rounded-full bg-warn-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warn-300 ring-1 ring-inset ring-warn-500/30">
                High risk
              </span>{" "}
              — Earlier-stage or higher beta — meaningful drawdown possible.
            </li>
            <li>
              <span className="rounded-full bg-down-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-down-300 ring-1 ring-inset ring-down-500/30">
                Speculative
              </span>{" "}
              — Story stock or unproven model — treat as a small option position.
            </li>
          </ul>
        </div>
      </section>

      <div className="mb-10">
        <NewsletterCTA
          source="hidden-gems"
          variant="card"
          eyebrow="Get gem alerts"
          title="Be first when a new Hidden Gem lands."
          description="We add 1-2 sub-$20 ideas a month. Subscribers get them in their inbox the same day they go live, with the editor's full thesis."
        />
      </div>

      <Disclaimer variant="block">
        Hidden Gems are smaller, more volatile, and more illiquid than the
        large-cap names elsewhere on {SITE_NAME}. Drawdowns of 30-70% are
        possible and have happened to many small caps. Treat these as
        position-sized speculative ideas, not portfolio core. Always do your
        own research and consult a qualified financial professional.
      </Disclaimer>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ash-400">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-ash-50">{value}</div>
      <p className="mt-1 text-xs leading-relaxed text-ash-500">{sub}</p>
    </div>
  );
}
