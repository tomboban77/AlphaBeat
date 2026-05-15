import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology — How AlphaBeat Scores Stocks",
  description:
    "A plain-English explanation of AlphaBeat's 6-factor scoring system: Value, Growth, Quality, Dividend Safety, Momentum, and Canadian Tax Efficiency — with the exact formulas.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
          How it works
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          Methodology
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ash-300">
          Every Stock File carries a score from 0–100 built from six factors.
          The score is computed daily from{" "}
          <strong className="text-ash-200">Finnhub</strong> data and cached as a
          snapshot in Sanity. Editor overrides supersede computed values factor by
          factor — when an override is active, you&apos;ll see an editor note on the
          Stock File. If Finnhub data is missing for a factor, that factor shows{" "}
          <code className="rounded bg-ink-800 px-1.5 py-0.5 text-xs text-ash-300">
            N/A
          </code>{" "}
          and defaults to a neutral 50 baseline — it never silently inflates or
          penalises the overall score.
        </p>
      </div>

      {/* Overall score */}
      <div className="mb-10 rounded-2xl border border-ink-700 bg-ink-800/40 p-6">
        <h2 className="text-lg font-bold text-ash-50">Overall score</h2>
        <p className="mt-2 text-sm leading-relaxed text-ash-300">
          Weighted average of the six factor scores, using only the factors that
          have data. If every factor is N/A, the overall is also N/A.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {WEIGHTS.map((w) => (
            <div key={w.name} className="rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2 text-sm">
              <span className="text-ash-200">{w.name}</span>
              <span className="ml-2 font-mono text-accent-400">{w.weight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Six factors */}
      <div className="space-y-10">
        {FACTORS.map((f) => (
          <section key={f.name} className="border-t border-ink-700 pt-8">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-ash-50">{f.name}</h2>
              <span className="font-mono text-sm text-ash-500">{f.weight} of total</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ash-300">{f.description}</p>

            <div className="mt-5 space-y-4">
              {f.subScores.map((s) => (
                <div key={s.label} className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-ash-200">{s.label}</span>
                    <span className="font-mono text-xs text-ash-500">{s.weight} weight</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ash-400">{s.source}</p>
                  <div className="mt-3 space-y-1">
                    {s.breakpoints.map(([threshold, score]) => (
                      <div key={threshold} className="flex justify-between font-mono text-xs">
                        <span className="text-ash-500">{threshold}</span>
                        <span className="text-ash-200">→ {score}/100</span>
                      </div>
                    ))}
                  </div>
                  {s.note && (
                    <p className="mt-2 text-[11px] leading-relaxed text-ash-500">{s.note}</p>
                  )}
                </div>
              ))}
            </div>

            {f.penalty && (
              <div className="mt-4 rounded-xl border border-warn-500/30 bg-warn-500/5 p-4 text-xs text-warn-300">
                <strong className="text-warn-200">Penalty:</strong> {f.penalty}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Data source */}
      <div className="mt-14 rounded-2xl border border-ink-700 bg-ink-800/40 p-6">
        <h2 className="text-lg font-bold text-ash-50">Data source &amp; cadence</h2>
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-ash-300">
          <p>
            All market data comes from <strong className="text-ash-200">Finnhub</strong> (free tier).
            Scores are refreshed <strong className="text-ash-200">daily at 06:00 ET</strong> via a
            GitHub Actions cron job that writes snapshots to Sanity.
          </p>
          <p>
            Fundamentals for smaller TSX stocks may be incomplete. Where data is
            missing, the factor shows{" "}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 text-xs text-ash-300">N/A</code>{" "}
            and contributes a neutral 50 to the overall score.
          </p>
          <p>
            Quotes are delayed ~15 minutes. Scores are not investment advice —
            see the{" "}
            <Link href="/disclaimer" className="text-accent-300 underline hover:text-accent-200">
              disclaimer
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const WEIGHTS = [
  { name: "Value",            weight: "20%" },
  { name: "Growth",           weight: "20%" },
  { name: "Quality",          weight: "20%" },
  { name: "Dividend Safety",  weight: "15%" },
  { name: "Momentum",         weight: "10%" },
  { name: "Tax Efficiency",   weight: "15%" },
];

const FACTORS = [
  {
    name: "Value",
    weight: "20%",
    description:
      "How cheap the stock is relative to its fundamentals. Four sub-scores are combined — P/E is the heaviest because it reflects earnings power most directly.",
    subScores: [
      {
        label: "P/E vs sector median",
        weight: "35%",
        source: "Finnhub peNormalizedAnnual ÷ hardcoded sector median P/E (e.g. Canadian Banks = 12×, Technology = 32×)",
        breakpoints: [
          ["Ratio ≤ 0.60 (deep discount)", 95],
          ["Ratio ≤ 0.80", 80],
          ["Ratio ≤ 1.00 (in-line)", 65],
          ["Ratio ≤ 1.25", 45],
          ["Ratio ≤ 1.50", 30],
          ["Ratio > 1.50 (expensive)", 15],
        ],
      },
      {
        label: "Price / Book",
        weight: "25%",
        source: "Finnhub pbAnnual",
        breakpoints: [
          ["P/B < 1", 90],
          ["P/B < 2", 75],
          ["P/B < 3", 60],
          ["P/B < 5", 40],
          ["P/B ≥ 5", 20],
        ],
      },
      {
        label: "EV / EBITDA",
        weight: "25%",
        source: "Finnhub evEbitdaTTM",
        breakpoints: [
          ["EV/EBITDA < 8", 90],
          ["EV/EBITDA < 12", 75],
          ["EV/EBITDA < 18", 55],
          ["EV/EBITDA < 25", 35],
          ["EV/EBITDA ≥ 25", 15],
        ],
      },
      {
        label: "FCF yield (1 ÷ PFCF × 100)",
        weight: "15%",
        source: "Finnhub pfcfShareTTM or pfcfShareAnnual",
        breakpoints: [
          ["FCF yield > 10%", 90],
          ["FCF yield > 7%",  75],
          ["FCF yield > 5%",  60],
          ["FCF yield > 3%",  40],
          ["FCF yield ≤ 3%",  20],
        ],
      },
    ],
  },
  {
    name: "Growth",
    weight: "20%",
    description:
      "How fast the business is compounding. Revenue and EPS 3-year CAGRs anchor the score; quarterly YoY gives a forward-looking signal.",
    subScores: [
      {
        label: "Revenue 3yr CAGR",
        weight: "40%",
        source: "Finnhub revenueGrowth3Y (%). Values above 200% are capped — acquisition spikes can distort this metric.",
        breakpoints: [
          ["> 20%", 95], ["> 15%", 85], ["> 10%", 72],
          ["> 5%",  58], ["> 0%",  45], ["> −5%", 30], ["≤ −5%", 15],
        ],
      },
      {
        label: "EPS 3yr CAGR",
        weight: "35%",
        source: "Finnhub epsGrowth3Y (%)",
        breakpoints: [
          ["> 20%", 95], ["> 15%", 85], ["> 10%", 72],
          ["> 5%",  58], ["> 0%",  45], ["> −5%", 30], ["≤ −5%", 15],
        ],
      },
      {
        label: "Quarterly revenue YoY",
        weight: "25%",
        source: "Finnhub revenueGrowthQuarterlyYoy (%) — proxy for recent growth momentum",
        breakpoints: [
          ["> 20%", 95], ["> 15%", 85], ["> 10%", 72],
          ["> 5%",  58], ["> 0%",  45], ["> −5%", 30], ["≤ −5%", 15],
        ],
      },
    ],
  },
  {
    name: "Quality",
    weight: "20%",
    description:
      "How durable and efficient the business is. Debt/equity is assessed differently for banks — structural leverage from deposits is not the same as financial stress.",
    subScores: [
      {
        label: "Return on Equity (ROE)",
        weight: "30%",
        source: "Finnhub roeTTM (%)",
        breakpoints: [
          ["> 25%", 95], ["> 18%", 82], ["> 12%", 68],
          ["> 6%",  50], ["> 0%",  32], ["≤ 0%",  12],
        ],
      },
      {
        label: "Return on Invested Capital (ROIC)",
        weight: "30%",
        source: "Finnhub roiTTM (%)",
        breakpoints: [
          ["> 25%", 95], ["> 18%", 82], ["> 12%", 68],
          ["> 6%",  50], ["> 0%",  32], ["≤ 0%",  12],
        ],
      },
      {
        label: "Debt / Equity",
        weight: "20%",
        source: "Finnhub totalDebt/totalEquityAnnual. Banks use a separate scale (D/E 5–15× is structurally normal).",
        breakpoints: [
          ["< 0.3×", 95], ["< 0.5×", 82], ["< 1.0×", 65],
          ["< 2.0×", 45], ["≥ 2.0×", 25],
        ],
        note: "Bank scale: D/E < 5 → 70, < 10 → 55, < 15 → 40, ≥ 15 → 30",
      },
      {
        label: "Net profit margin",
        weight: "20%",
        source: "Finnhub netProfitMarginTTM (falls back to grossMarginTTM if missing) (%)",
        breakpoints: [
          ["> 25%", 95], ["> 15%", 80], ["> 8%",  65],
          ["> 3%",  48], ["> 0%",  32], ["≤ 0%",  12],
        ],
      },
    ],
  },
  {
    name: "Dividend Safety",
    weight: "15%",
    description:
      "Can the company keep paying and growing its dividend? If no dividend is paid, the factor returns a neutral 50 — neither rewarded nor penalised.",
    penalty: "If the indicated annual yield exceeds 10%, 20 points are deducted from the final Dividend Safety score. A yield above 10% typically signals the market doubts sustainability.",
    subScores: [
      {
        label: "Payout ratio",
        weight: "35%",
        source: "Finnhub payoutRatioAnnual or payoutRatioTTM (%)",
        breakpoints: [
          ["20–50% (sustainable)", 95],
          ["50–65%", 78],
          ["65–80%", 55],
          ["80–90%", 35],
          ["> 90% (danger zone)", 15],
        ],
        note: "0% (no dividend) → 50 neutral",
      },
      {
        label: "Dividend growth rate (5Y)",
        weight: "35%",
        source: "Finnhub dividendGrowthRate5Y (% per year)",
        breakpoints: [
          ["> 10%", 95], ["> 7%", 82], ["> 5%", 70],
          ["> 3%",  57], ["> 0%", 44], ["≤ 0% (cut or flat)", 22],
        ],
      },
      {
        label: "FCF coverage (1 ÷ PFCF × 100)",
        weight: "30%",
        source: "Finnhub pfcfShareTTM or pfcfShareAnnual — FCF yield as a coverage signal",
        breakpoints: [
          ["FCF yield > 10%", 95], ["FCF yield > 7%", 80],
          ["FCF yield > 5%",  65], ["FCF yield > 3%", 45],
          ["FCF yield ≤ 3%",  25],
        ],
      },
    ],
  },
  {
    name: "Momentum",
    weight: "10%",
    description:
      "Is the stock trending in the right direction? Returns are compared to the TSX Composite (^GSPTSE). If index candles are unavailable, we use long-run TSX averages (4% over 6 months, 8% over 12 months) as the benchmark.",
    subScores: [
      {
        label: "6-month excess return vs ^GSPTSE",
        weight: "35%",
        source: "Finnhub 26WeekPriceReturnDaily minus GSPTSE 6M return (or 4% benchmark)",
        breakpoints: [
          ["Excess > +15pp", 95], ["Excess > +8pp", 82], ["Excess > +3pp", 68],
          ["Excess > 0",     55], ["Excess > −5pp", 42], ["Excess > −10pp", 28],
          ["Excess ≤ −10pp", 15],
        ],
      },
      {
        label: "12-month excess return vs ^GSPTSE",
        weight: "35%",
        source: "Finnhub 52WeekPriceReturnDaily minus GSPTSE 12M return (or 8% benchmark)",
        breakpoints: [
          ["Excess > +15pp", 95], ["Excess > +8pp", 82], ["Excess > +3pp", 68],
          ["Excess > 0",     55], ["Excess > −5pp", 42], ["Excess > −10pp", 28],
          ["Excess ≤ −10pp", 15],
        ],
      },
      {
        label: "50/200 DMA position",
        weight: "30%",
        source: "Computed from 1-year daily Finnhub candles",
        breakpoints: [
          ["Price > 50DMA AND 50DMA > 200DMA (uptrend)", 90],
          ["Price > 50DMA AND 50DMA ≤ 200DMA (bounce)",  60],
          ["Price ≤ 50DMA AND price > 200DMA (pullback)", 45],
          ["Price ≤ 50DMA AND price ≤ 200DMA (downtrend)", 20],
        ],
      },
    ],
  },
  {
    name: "Canadian Tax Efficiency",
    weight: "15%",
    description:
      "Rule-based. Measures how advantageous this stock is for a Canadian investor in the optimal account type. The Account Fit table on each Stock File page shows the per-account breakdown.",
    subScores: [
      {
        label: "Tax efficiency rule table",
        weight: "100%",
        source: "Determined by exchange (TSX/TSXV vs NYSE/NASDAQ), sector label, and dividend yield",
        breakpoints: [
          ["Canadian-listed eligible dividend payer → TFSA/non-reg", 80],
          ["Canadian-listed growth stock (no dividend)", 55],
          ["Canadian REIT → registered account",         50],
          ["US-listed dividend payer → RRSP (treaty)",  50],
          ["US-listed growth stock",                     50],
        ],
        note: "US dividend stocks score 30 in a TFSA (15% IRS withholding is irrecoverable). The Account Fit table shows this penalty explicitly.",
      },
    ],
  },
];
