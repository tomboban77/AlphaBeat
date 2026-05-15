"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockScore, FactorScore } from "@/lib/types";

interface ScoreDisplayProps {
  score: StockScore;
  compact?: boolean;
}

const FACTOR_META: Record<
  keyof StockScore["factors"],
  { label: string; description: string; weight: string }
> = {
  value: {
    label: "Value",
    weight: "~20%",
    description: "P/E vs sector median, P/B, EV/EBITDA, FCF yield.",
  },
  growth: {
    label: "Growth",
    weight: "~20%",
    description: "Revenue 3yr CAGR, EPS 3yr CAGR, forward revenue estimate.",
  },
  quality: {
    label: "Quality",
    weight: "~20%",
    description: "ROE, ROIC, debt/equity, gross margin stability.",
  },
  dividendSafety: {
    label: "Dividend Safety",
    weight: "~15%",
    description: "Payout ratio, growth streak, FCF coverage, yield penalty >10%.",
  },
  momentum: {
    label: "Momentum",
    weight: "~10%",
    description: "6m + 12m return vs ^GSPTSE, 50/200 DMA position.",
  },
  taxEfficiency: {
    label: "Tax Efficiency",
    weight: "~15%",
    description:
      "Rule-based: eligible dividend credit, withholding on US-listed in TFSA, REIT treatment.",
  },
};

function scoreTone(v: number | null): "great" | "good" | "fair" | "poor" | "none" {
  if (v === null) return "none";
  if (v >= 70) return "great";
  if (v >= 50) return "good";
  if (v >= 30) return "fair";
  return "poor";
}

function FactorBar({ factor, name, compact }: { factor: FactorScore; name: keyof StockScore["factors"]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const meta = FACTOR_META[name];
  const tone = scoreTone(factor.value);
  const barColor =
    tone === "great" ? "bg-up-400" :
    tone === "good"  ? "bg-accent-400" :
    tone === "fair"  ? "bg-warn-400" :
    tone === "poor"  ? "bg-down-400" :
    "bg-ink-600";
  const pct = factor.value ?? 0;

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => !compact && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-3",
          !compact && "cursor-pointer hover:opacity-80"
        )}
        disabled={compact}
        aria-expanded={open}
      >
        <span className="w-28 shrink-0 text-left text-xs font-medium text-ash-300">
          {meta.label}
        </span>
        <div className="relative flex-1 h-2 rounded-full bg-ink-700" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={meta.label}>
          {!factor.insufficient && (
            <div
              className={cn("absolute inset-y-0 left-0 rounded-full transition-all", barColor)}
              style={{ width: `${pct}%` }}
            />
          )}
          {factor.insufficient && (
            <div className="absolute inset-0 rounded-full bg-ink-600/50" />
          )}
        </div>
        <span className={cn("w-14 shrink-0 text-right font-mono text-xs tabular-nums", factor.insufficient ? "text-ash-500" : "text-ash-200")}>
          {factor.insufficient ? "N/A" : `${Math.round(pct)}/100`}
        </span>
        {!compact && (
          open ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-ash-500" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ash-500" />
        )}
      </button>

      {open && !compact && (
        <div className="ml-28 rounded-lg border border-ink-700 bg-ink-900/80 px-3 py-2 text-xs leading-relaxed text-ash-400">
          <p>{meta.description}</p>
          {factor.insufficient && (
            <p className="mt-1 text-warn-400">
              <Info className="mr-1 inline h-3 w-3" />
              Insufficient data from Finnhub — using neutral 50 baseline.
            </p>
          )}
          {factor.overridden && (
            <p className="mt-1 text-accent-400">
              Editor override applied. See editor notes on this Stock File.
            </p>
          )}
          <p className="mt-1 text-ash-500">
            Weight: {meta.weight} ·{" "}
            <Link href="/methodology" className="underline hover:text-ash-300">
              Full methodology →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function ScoreDisplay({ score, compact = false }: ScoreDisplayProps) {
  const overall = score.overall;
  const tone = scoreTone(overall);
  const ringColor =
    tone === "great" ? "ring-up-400/40 text-up-300" :
    tone === "good"  ? "ring-accent-400/40 text-accent-300" :
    tone === "fair"  ? "ring-warn-400/40 text-warn-300" :
    tone === "poor"  ? "ring-down-400/40 text-down-300" :
    "ring-ink-600 text-ash-500";

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-5 sm:p-6">
      {!compact && (
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
              AlphaBeat Score
            </div>
            <h2 className="mt-0.5 text-lg font-bold text-ash-50">6-factor analysis</h2>
          </div>
          <div
            className={cn(
              "flex h-16 w-16 flex-col items-center justify-center rounded-full ring-2",
              ringColor
            )}
            aria-label={overall !== null ? `Overall score: ${Math.round(overall)} out of 100` : "Score pending"}
          >
            {overall !== null ? (
              <>
                <span className="text-xl font-bold tabular-nums leading-none">
                  {Math.round(overall)}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70">
                  /100
                </span>
              </>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ash-500">
                Pending
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(Object.keys(FACTOR_META) as (keyof StockScore["factors"])[]).map((k) => (
          <FactorBar key={k} factor={score.factors[k]} name={k} compact={compact} />
        ))}
      </div>

      {score.insufficient && !compact && (
        <p className="mt-4 flex items-start gap-1.5 text-xs text-ash-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          One or more factors show N/A — Finnhub data is incomplete for this ticker. Neutral 50
          used as baseline.{" "}
          <Link href="/methodology" className="underline hover:text-ash-300">
            Methodology
          </Link>
        </p>
      )}

      {!compact && (
        <p className="mt-3 text-xs text-ash-600">
          Scores refresh daily ·{" "}
          <Link href="/methodology" className="underline hover:text-ash-500">
            How scores work
          </Link>
        </p>
      )}
    </div>
  );
}
