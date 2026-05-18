"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Home, TrendingUp, Gem, Sprout,
  Shield, BarChart2, Rocket,
  ChevronLeft, ArrowRight, Check,
  Building2, RefreshCw, ExternalLink, Mail,
} from "lucide-react";
import {
  computeBlueprint,
  calcTFSARoom,
  type BlueprintInputs,
  type Blueprint,
  type Goal,
  type IncomeRange,
  type InvestAmount,
  type MonthlySavings,
  type InvestStyle,
  type PortfolioHolding,
} from "@/lib/blueprint";
import { cn } from "@/lib/utils";

// ---- Formatters ----

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString("en-CA")}`;
}

function fmtFull(n: number): string {
  return `$${n.toLocaleString("en-CA")}`;
}

// ============================================================
// Step 0 — Birth year
// ============================================================

function BirthYearStep({
  value,
  onChange,
  onContinue,
}: {
  value: number;
  onChange: (y: number) => void;
  onContinue: () => void;
}) {
  const age = 2026 - value;
  const room = calcTFSARoom(value);

  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
        Question 1 of 6
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
        What year were you born?
      </h2>
      <p className="mt-3 text-base text-ash-400">
        This determines your TFSA contribution room and how long your money can compound.
      </p>

      <div className="mt-10 rounded-2xl border border-ink-600/60 bg-ink-800/40 p-8 text-center">
        <div className="text-7xl font-bold tabular-nums tracking-tight text-ash-50 sm:text-8xl">
          {value}
        </div>
        <div className="mt-5 flex items-center justify-center gap-6 text-sm">
          <div>
            <span className="text-ash-500">Age in 2026</span>
            <span className="ml-2 font-bold text-ash-100">{age}</span>
          </div>
          <div className="h-4 w-px bg-ink-600" />
          <div>
            <span className="text-ash-500">TFSA room</span>
            <span className="ml-2 font-bold text-accent-300">{fmtFull(room)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <input
          type="range"
          min={1958}
          max={2008}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="w-full accent-cyan-400"
          aria-label="Select your birth year"
        />
        <div className="mt-2 flex justify-between text-xs text-ash-600">
          <span>1958 (age 68)</span>
          <span>2008 (age 18)</span>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-3.5 font-semibold text-ink-950 transition-colors hover:bg-accent-400"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ============================================================
// Shared card components
// ============================================================

function SelectCard<T extends string>({
  value,
  selected,
  onClick,
  icon: Icon,
  label,
  note,
}: {
  value: T;
  selected: boolean;
  onClick: (v: T) => void;
  icon: React.ElementType;
  label: string;
  note: string;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-150",
        selected
          ? "border-accent-500/60 bg-accent-500/10 ring-1 ring-accent-500/30"
          : "border-ink-600/60 bg-ink-800/50 hover:border-accent-500/30 hover:bg-ink-800"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
          selected ? "bg-accent-500/20 text-accent-300" : "bg-ink-700 text-ash-500"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn("font-semibold", selected ? "text-ash-50" : "text-ash-100")}>
          {label}
        </div>
        <div className="mt-0.5 text-xs text-ash-500">{note}</div>
      </div>
      {selected && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500 text-ink-950">
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

function ListCard<T extends string>({
  value,
  selected,
  onClick,
  label,
  note,
}: {
  value: T;
  selected: boolean;
  onClick: (v: T) => void;
  label: string;
  note: string;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-all duration-150",
        selected
          ? "border-accent-500/60 bg-accent-500/10 ring-1 ring-accent-500/30"
          : "border-ink-600/60 bg-ink-800/50 hover:border-accent-500/30 hover:bg-ink-800"
      )}
    >
      <div>
        <div className={cn("font-semibold", selected ? "text-ash-50" : "text-ash-100")}>{label}</div>
        <div className="mt-0.5 text-xs text-ash-500">{note}</div>
      </div>
      {selected && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500 text-ink-950">
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ============================================================
// Step 1 — Goal
// ============================================================

const GOALS = [
  { id: "home" as Goal, icon: Home, label: "Buy a Home", note: "First home purchase · FHSA eligible" },
  { id: "retire" as Goal, icon: TrendingUp, label: "Retire Early", note: "Financial independence before 60" },
  { id: "wealth" as Goal, icon: Gem, label: "Build Long-Term Wealth", note: "Generational compounding, no fixed date" },
  { id: "start" as Goal, icon: Sprout, label: "Just Getting Started", note: "New to investing — we'll guide you" },
];

function GoalStep({ selected, onSelect }: { selected?: Goal; onSelect: (g: Goal) => void }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
        Question 2 of 6
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
        What&apos;s your main goal?
      </h2>
      <p className="mt-3 text-base text-ash-400">
        We&apos;ll prioritize the right accounts and picks for your situation.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        {GOALS.map((g) => (
          <SelectCard
            key={g.id}
            value={g.id}
            selected={selected === g.id}
            onClick={onSelect}
            icon={g.icon}
            label={g.label}
            note={g.note}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Step 2 — Income
// ============================================================

const INCOMES: Array<{ id: IncomeRange; label: string; note: string }> = [
  { id: "under50", label: "Under $50,000", note: "TFSA is your most powerful tool" },
  { id: "50to80", label: "$50,000 – $80,000", note: "TFSA first, RRSP when income grows" },
  { id: "80to120", label: "$80,000 – $120,000", note: "Both accounts work hard for you" },
  { id: "over120", label: "Over $120,000", note: "RRSP delivers major tax savings now" },
];

function IncomeStep({
  selected,
  onSelect,
}: {
  selected?: IncomeRange;
  onSelect: (v: IncomeRange) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
        Question 3 of 6
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
        What&apos;s your annual income?
      </h2>
      <p className="mt-3 text-base text-ash-400">
        This determines which account gives your money the best tax treatment.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        {INCOMES.map((item) => (
          <SelectCard
            key={item.id}
            value={item.id}
            selected={selected === item.id}
            onClick={onSelect}
            icon={Building2}
            label={item.label}
            note={item.note}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Step 3 — Amount to invest
// ============================================================

const AMOUNTS: Array<{ id: InvestAmount; label: string; note: string }> = [
  { id: "under1k", label: "Under $1,000", note: "Every dollar counts — great time to start" },
  { id: "1to5k", label: "$1,000 – $5,000", note: "Enough for a focused starter portfolio" },
  { id: "5to25k", label: "$5,000 – $25,000", note: "Solid foundation across multiple positions" },
  { id: "25to100k", label: "$25,000 – $100,000", note: "Meaningful position sizing with conviction" },
  { id: "over100k", label: "Over $100,000", note: "Full portfolio construction from day one" },
];

function AmountStep({
  selected,
  onSelect,
}: {
  selected?: InvestAmount;
  onSelect: (v: InvestAmount) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
        Question 4 of 6
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
        How much are you investing today?
      </h2>
      <p className="mt-3 text-base text-ash-400">
        The lump sum you have ready to deploy right now.
      </p>
      <div className="mt-8 flex flex-col gap-2.5">
        {AMOUNTS.map((item) => (
          <ListCard
            key={item.id}
            value={item.id}
            selected={selected === item.id}
            onClick={onSelect}
            label={item.label}
            note={item.note}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Step 4 — Monthly savings
// ============================================================

const MONTHLY_OPTIONS: Array<{ id: MonthlySavings; label: string; note: string }> = [
  { id: "none", label: "Nothing right now", note: "Just the lump sum for now — that's a start" },
  { id: "100to250", label: "$100 – $250 / month", note: "Small and consistent beats large and sporadic" },
  { id: "250to500", label: "$250 – $500 / month", note: "This is where serious compounding begins" },
  { id: "500to1k", label: "$500 – $1,000 / month", note: "You're building real wealth every month" },
  { id: "over1k", label: "Over $1,000 / month", note: "Fast-track to financial independence" },
];

function MonthlyStep({
  selected,
  onSelect,
}: {
  selected?: MonthlySavings;
  onSelect: (v: MonthlySavings) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
        Question 5 of 6
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
        Monthly savings contribution?
      </h2>
      <p className="mt-3 text-base text-ash-400">
        How much you can add to your portfolio each month on top of the lump sum.
      </p>
      <div className="mt-8 flex flex-col gap-2.5">
        {MONTHLY_OPTIONS.map((item) => (
          <ListCard
            key={item.id}
            value={item.id}
            selected={selected === item.id}
            onClick={onSelect}
            label={item.label}
            note={item.note}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Step 5 — Style
// ============================================================

const STYLES: Array<{
  id: InvestStyle;
  icon: React.ElementType;
  label: string;
  tagline: string;
  picks: string;
  rate: string;
  rateColor: string;
}> = [
  {
    id: "income",
    icon: Shield,
    label: "Steady Income",
    tagline: "Dividends, stability, consistent cash flow",
    picks: "RY.TO · ENB.TO · FTS.TO",
    rate: "~7.5%",
    rateColor: "text-up-400",
  },
  {
    id: "balanced",
    icon: BarChart2,
    label: "Balanced Growth",
    tagline: "Income anchor paired with growth compounders",
    picks: "RY.TO · CNQ.TO · SHOP.TO",
    rate: "~9.2%",
    rateColor: "text-accent-400",
  },
  {
    id: "growth",
    icon: Rocket,
    label: "Full Growth",
    tagline: "Maximum compounding — higher swings expected",
    picks: "CNQ.TO · CSU.TO · AEM.TO",
    rate: "~11.8%",
    rateColor: "text-warn-400",
  },
];

function StyleStep({ selected, onSelect }: { selected?: InvestStyle; onSelect: (v: InvestStyle) => void }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
        Question 6 of 6
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
        What&apos;s your investing style?
      </h2>
      <p className="mt-3 text-base text-ash-400">
        This determines which Canadian stocks your Blueprint is built around.
        Annual return estimates are long-run targets, not historical guarantees.
      </p>
      <div className="mt-8 flex flex-col gap-4">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={cn(
              "w-full rounded-2xl border p-6 text-left transition-all duration-150",
              selected === s.id
                ? "border-accent-500/60 bg-accent-500/10 ring-1 ring-accent-500/30"
                : "border-ink-600/60 bg-ink-800/50 hover:border-accent-500/30 hover:bg-ink-800"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    selected === s.id ? "bg-accent-500/20" : "bg-ink-700"
                  )}
                >
                  <s.icon
                    className={cn(
                      "h-5 w-5",
                      selected === s.id ? "text-accent-300" : "text-ash-500"
                    )}
                  />
                </div>
                <div>
                  <div className="font-semibold text-ash-50">{s.label}</div>
                  <div className="text-xs text-ash-500">{s.tagline}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-xl font-bold tabular-nums", s.rateColor)}>{s.rate}</div>
                <div className="text-[10px] text-ash-600">est. / yr</div>
              </div>
            </div>
            <div className="mt-4 border-t border-ink-700/60 pt-4">
              <div className="text-[11px] uppercase tracking-wider text-ash-600">Key picks</div>
              <div className="mt-1 font-mono text-sm font-medium text-ash-300">{s.picks}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Blueprint Result
// ============================================================

function ScoreMini({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-up-400" : score >= 50 ? "bg-accent-400" : score >= 30 ? "bg-warn-400" : "bg-down-400";
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 flex-1 rounded-full bg-ink-700">
        <div className={cn("absolute inset-y-0 left-0 rounded-full", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="w-6 text-right font-mono text-xs tabular-nums text-ash-400">{score}</span>
    </div>
  );
}

function HoldingCard({ h }: { h: PortfolioHolding }) {
  return (
    <div className="flex flex-col rounded-2xl border border-ink-600/60 bg-ink-800/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-ash-50">{h.ticker}</span>
            {h.isETF && (
              <span className="rounded-md bg-ink-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ash-500">
                ETF
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ash-400">{h.companyName}</p>
          <p className="text-[10px] text-ash-600">{h.sector}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tabular-nums text-ash-50">{fmtFull(h.allocationAmt)}</div>
          <div className="text-sm font-semibold text-accent-400">{h.allocationPct}%</div>
        </div>
      </div>

      {h.score !== null && (
        <div className="mt-4">
          <div className="mb-1.5 text-[10px] text-ash-600">AlphaBeat Score</div>
          <ScoreMini score={h.score} />
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 rounded-lg bg-ink-700/60 px-2.5 py-1.5 text-xs">
          <span className="text-ash-500">5Y return</span>
          <span className={cn("font-semibold tabular-nums", h.fiveYearReturn >= 100 ? "text-up-300" : "text-up-400")}>
            +{h.fiveYearReturn}%
          </span>
        </div>
        {h.dividendYield != null && (
          <div className="flex items-center gap-1.5 rounded-lg bg-ink-700/60 px-2.5 py-1.5 text-xs">
            <span className="text-ash-500">Yield</span>
            <span className="font-semibold text-ash-200">{h.dividendYield}%</span>
          </div>
        )}
        {h.consecutiveDivGrowthYrs != null && (
          <div className="flex items-center gap-1.5 rounded-lg bg-ink-700/60 px-2.5 py-1.5 text-xs">
            <span className="text-ash-500">Div growth</span>
            <span className="font-semibold text-ash-200">{h.consecutiveDivGrowthYrs} yrs</span>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ash-400">{h.rationale}</p>

      {!h.isETF && h.slug && (
        <Link
          href={`/stocks/${h.slug}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-400 transition-colors hover:text-accent-300"
        >
          Full Stock File
          <ExternalLink className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function GrowthChart({ projection }: { projection: Blueprint["projection"] }) {
  const { lumpSum, yr10, yr20, yr30 } = projection;
  const max = yr30;
  const W = 440;
  const PX = 30;
  const PY = 38;
  const H = 100;
  const plotW = W - PX * 2;

  const toY = (v: number) => PY + H - Math.max((v / max) * H, 3);

  const pts = [
    { x: PX, y: toY(lumpSum), val: lumpSum, label: "Today" },
    { x: PX + plotW * 0.33, y: toY(yr10), val: yr10, label: "10 yrs" },
    { x: PX + plotW * 0.67, y: toY(yr20), val: yr20, label: "20 yrs" },
    { x: W - PX, y: toY(yr30), val: yr30, label: "30 yrs" },
  ];

  const curve = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y} ${cx} ${pt.y} ${pt.x} ${pt.y}`;
  }, "");

  const area = `${curve} L ${W - PX} ${PY + H} L ${PX} ${PY + H} Z`;
  const totalH = PY + H + 26;

  return (
    <svg
      viewBox={`0 0 ${W} ${totalH}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="30-year growth projection chart"
    >
      <defs>
        <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gfill)" />
      <path
        d={curve}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((pt, i) => (
        <g key={i}>
          <circle
            cx={pt.x}
            cy={pt.y}
            r={i === 3 ? 5.5 : 3.5}
            fill={i === 3 ? "#22d3ee" : "#0891b2"}
            stroke={i === 3 ? "#083344" : "none"}
            strokeWidth="2"
          />
          <text
            x={pt.x}
            y={pt.y - 11}
            textAnchor="middle"
            fill={i === 3 ? "#f1f5f9" : "#94a3b8"}
            fontSize={i === 3 ? "13" : "11"}
            fontFamily="ui-monospace, monospace"
            fontWeight={i === 3 ? "700" : "400"}
          >
            {fmt(pt.val)}
          </text>
          <text
            x={pt.x}
            y={PY + H + 18}
            textAnchor="middle"
            fill="#64748b"
            fontSize="10"
          >
            {pt.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SectionNumber({ n }: { n: number }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500/20 text-[10px] font-bold text-accent-300">
      {n}
    </span>
  );
}

function BlueprintResult({
  blueprint,
  onReset,
}: {
  blueprint: Blueprint;
  onReset: () => void;
}) {
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const { accountPlan, broker, brokerReason, holdings, projection, profileLabel, playbookSlug, playbookTitle, smallAmountNote } =
    blueprint;

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "blueprint" }),
      });
      const data = (await res.json()) as { ok: boolean };
      setSubState(data.ok ? "done" : "error");
    } catch {
      setSubState("error");
    }
  }

  const monthlyLabel =
    projection.monthly > 0 ? ` + ${fmtFull(projection.monthly)}/mo` : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* ── Hero header ── */}
      <div className="mb-8 rounded-3xl border border-accent-500/20 bg-linear-to-br from-accent-500/10 via-ink-800/60 to-ink-900 p-8 sm:p-10">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
          Your AlphaBeat Blueprint
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          {profileLabel}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ash-400">
          <span>
            Deploying{" "}
            <strong className="text-ash-100">{fmtFull(projection.lumpSum)}</strong>
            {monthlyLabel && (
              <span>
                {" "}+{" "}
                <strong className="text-ash-100">{fmtFull(projection.monthly)}/mo</strong>
              </span>
            )}
          </span>
          <span className="text-ash-600">·</span>
          <span>
            Est. annual return{" "}
            <strong className="text-accent-300">{projection.annualRate}%</strong>
          </span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-ink-700/50 pt-6 sm:gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ash-600">10 years</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-ash-200 sm:text-xl">
              {fmt(projection.yr10)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ash-600">20 years</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-ash-200 sm:text-xl">
              {fmt(projection.yr20)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ash-600">30 years</div>
            <div className="mt-1 text-xl font-bold tabular-nums text-accent-300 sm:text-2xl">
              {fmt(projection.yr30)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Step 1: Open account ── */}
        <section className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ash-500">
            <SectionNumber n={1} />
            Open your account
          </div>
          <h2 className="mt-3 text-xl font-bold text-ash-50">
            {broker === "both"
              ? "Use Wealthsimple + Questrade"
              : broker === "wealthsimple"
              ? "Open Wealthsimple"
              : "Open Questrade"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ash-400">{brokerReason}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://www.wealthsimple.com/invite/FLC4FE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-accent-400"
            >
              Open Wealthsimple — get $25
              <ArrowRight className="h-4 w-4" />
            </a>
            {broker === "both" && (
              <a
                href="https://questmobile.onelink.me/tX0y/419708l0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-4 py-2.5 text-sm font-semibold text-ash-200 transition-colors hover:border-ink-500 hover:text-ash-50"
              >
                Open Questrade — get $50
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="mt-3 text-[10px] text-ash-600">
            Referral disclosure: these are personal referral links. You get a bonus — so do we.
            Not financial advice.
          </p>
        </section>

        {/* ── Step 2: Account priority ── */}
        <section className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ash-500">
            <SectionNumber n={2} />
            Account priority
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-ash-50">
              Open your {accountPlan.primary} first
            </h2>
            {accountPlan.secondary && (
              <>
                <span className="text-ash-600">→ then</span>
                <span className="rounded-full border border-ink-600 bg-ink-700 px-2.5 py-0.5 text-sm font-semibold text-ash-300">
                  {accountPlan.secondary}
                </span>
              </>
            )}
          </div>
          {accountPlan.primary === "TFSA" && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-ink-700/80 px-3 py-2 text-sm">
              <span className="text-ash-500">Your 2026 TFSA room:</span>
              <span className="font-bold text-accent-300">
                {fmtFull(accountPlan.tfsaRoom)}
              </span>
            </div>
          )}
          <p className="mt-3 text-sm leading-relaxed text-ash-400">{accountPlan.reasoning}</p>
          {accountPlan.fhsaEligible && (
            <div className="mt-4 rounded-xl border border-accent-500/20 bg-accent-500/5 px-4 py-3 text-sm text-accent-200">
              FHSA: $8,000/year · $40,000 lifetime max · tax-deductible contributions +
              100% tax-free first-home withdrawal
            </div>
          )}
        </section>

        {/* ── Step 3: Portfolio ── */}
        <section className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ash-500">
            <SectionNumber n={3} />
            Your starter portfolio
          </div>
          <h2 className="mt-3 text-xl font-bold text-ash-50">
            {fmtFull(projection.lumpSum)} across {holdings.length} position
            {holdings.length !== 1 ? "s" : ""}
          </h2>
          {smallAmountNote && (
            <p className="mt-2 rounded-xl bg-ink-700/50 px-4 py-3 text-sm text-ash-400">
              {smallAmountNote}
            </p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {holdings.map((h) => (
              <HoldingCard key={h.ticker} h={h} />
            ))}
          </div>
          <p className="mt-5 text-[11px] text-ash-600">
            All picks are listed on the TSX. AlphaBeat scores are updated weekly. Past returns do
            not guarantee future results. This is not financial advice.
          </p>
        </section>

        {/* ── Step 4: Projection ── */}
        <section className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ash-500">
            <SectionNumber n={4} />
            30-year growth projection
          </div>
          <h2 className="mt-3 text-xl font-bold text-ash-50">
            {fmtFull(projection.lumpSum)}
            {projection.monthly > 0 && ` + ${fmtFull(projection.monthly)}/mo`} at{" "}
            {projection.annualRate}%/yr estimated
          </h2>
          <div className="mt-6">
            <GrowthChart projection={projection} />
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-ash-600">
            Projection assumes {projection.annualRate}%/yr compounded monthly — a conservative estimate
            for this portfolio style based on long-run Canadian equity returns. Actual results will vary.
            Returns shown are before taxes and fees.
          </p>
        </section>

        {/* ── Step 5: Save / Subscribe ── */}
        <section className="rounded-2xl border border-accent-500/20 bg-accent-500/5 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
            <SectionNumber n={5} />
            Keep your Blueprint current
          </div>
          <h2 className="mt-3 text-xl font-bold text-ash-50">
            Get The Brief every Sunday
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ash-400">
            AlphaBeat scores update weekly. When a stock in your Blueprint moves meaningfully — up or
            down — The Brief covers it. Free, every Sunday.
          </p>
          {subState === "done" ? (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-up-500/20 bg-up-500/10 px-4 py-3 text-sm text-up-300">
              <Check className="h-4 w-4 shrink-0" />
              You&apos;re in. First issue arrives this Sunday.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-5 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="min-w-0 flex-1 rounded-xl border border-ink-600 bg-ink-800 px-4 py-2.5 text-sm text-ash-50 placeholder-ash-600 outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30"
              />
              <button
                type="submit"
                disabled={subState === "loading"}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-accent-400 disabled:opacity-60"
              >
                <Mail className="h-4 w-4" />
                {subState === "loading" ? "Saving…" : "Save"}
              </button>
            </form>
          )}
          {subState === "error" && (
            <p className="mt-2 text-xs text-down-400">
              Something went wrong. Try again or{" "}
              <Link href="/subscribe" className="underline">
                visit the subscribe page
              </Link>
              .
            </p>
          )}
          <p className="mt-3 text-[10px] text-ash-600">
            Canadian investing, made clearer. Unsubscribe any time.
          </p>
        </section>

        {/* ── Playbook cross-link ── */}
        {playbookSlug && playbookTitle && (
          <div className="rounded-2xl border border-ink-700 bg-ink-800/30 p-5">
            <div className="text-xs text-ash-500">Recommended reading for your Blueprint</div>
            <Link
              href={`/playbooks/${playbookSlug}`}
              className="mt-2 flex items-center gap-2 text-sm font-semibold text-accent-300 transition-colors hover:text-accent-200"
            >
              <ArrowRight className="h-4 w-4 shrink-0" />
              {playbookTitle}
            </Link>
          </div>
        )}

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between pt-2 text-sm text-ash-500">
          <button
            onClick={onReset}
            className="flex items-center gap-2 transition-colors hover:text-ash-300"
          >
            <RefreshCw className="h-4 w-4" />
            Start over
          </button>
          <Link href="/stocks" className="transition-colors hover:text-ash-300">
            Browse all Stock Files →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main flow wrapper
// ============================================================

interface FormState {
  birthYear: number;
  goal?: Goal;
  income?: IncomeRange;
  investAmount?: InvestAmount;
  monthlySavings?: MonthlySavings;
  style?: InvestStyle;
}

export default function BlueprintFlow() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ birthYear: 1995 });
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  function advance(updates: Partial<FormState>) {
    const next = { ...form, ...updates };
    setForm(next);
    if (step < 5) {
      setStep((s) => s + 1);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setBlueprint(computeBlueprint(next as BlueprintInputs));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function back() {
    if (step > 0) {
      setStep((s) => s - 1);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (blueprint) {
    return (
      <BlueprintResult
        blueprint={blueprint}
        onReset={() => {
          setBlueprint(null);
          setStep(0);
          setForm({ birthYear: 1995 });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  const progress = Math.round((step / 5) * 100);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6" ref={topRef}>
      {/* Progress indicator */}
      <div className="mb-10">
        <div className="mb-2 flex items-center justify-between text-xs text-ash-500">
          <span>Step {step + 1} of 6</span>
          {step > 0 && (
            <button
              onClick={back}
              className="flex items-center gap-1 transition-colors hover:text-ash-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
        </div>
        <div className="h-1 w-full rounded-full bg-ink-700">
          <div
            className="h-1 rounded-full bg-accent-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Active step */}
      <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
        {step === 0 && (
          <BirthYearStep
            value={form.birthYear}
            onChange={(y) => setForm((f) => ({ ...f, birthYear: y }))}
            onContinue={() => advance({})}
          />
        )}
        {step === 1 && (
          <GoalStep selected={form.goal} onSelect={(g) => advance({ goal: g })} />
        )}
        {step === 2 && (
          <IncomeStep selected={form.income} onSelect={(v) => advance({ income: v })} />
        )}
        {step === 3 && (
          <AmountStep
            selected={form.investAmount}
            onSelect={(v) => advance({ investAmount: v })}
          />
        )}
        {step === 4 && (
          <MonthlyStep
            selected={form.monthlySavings}
            onSelect={(v) => advance({ monthlySavings: v })}
          />
        )}
        {step === 5 && (
          <StyleStep selected={form.style} onSelect={(v) => advance({ style: v })} />
        )}
      </div>
    </div>
  );
}
