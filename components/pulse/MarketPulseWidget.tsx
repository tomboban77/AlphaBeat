import Link from "next/link";
import { ArrowRight, Compass, Flame } from "lucide-react";

import {
  classifyRegime,
  getIndicators,
  getSectorHeat,
  type ComputedRegime,
} from "@/lib/market/pulse";
import { client } from "@/lib/sanity/client";
import { latestMarketNoteQuery } from "@/lib/sanity/queries";
import type { MarketNote } from "@/lib/types";
import { cn, formatPercent } from "@/lib/utils";

import SectorIcon, { ACCENT_RING } from "@/components/sectors/SectorIcon";

const REGIME_TONE: Record<
  ComputedRegime,
  { label: string; classes: string; ring: string }
> = {
  "risk-on": {
    label: "Risk-on",
    classes:
      "border-up-500/40 bg-up-500/10 from-up-500/15 via-ink-900 to-ink-900",
    ring: "ring-up-500/40 text-up-300 bg-up-500/15",
  },
  mixed: {
    label: "Mixed",
    classes:
      "border-warn-500/40 bg-warn-500/10 from-warn-500/15 via-ink-900 to-ink-900",
    ring: "ring-warn-500/40 text-warn-300 bg-warn-500/15",
  },
  "risk-off": {
    label: "Risk-off",
    classes:
      "border-down-500/40 bg-down-500/10 from-down-500/15 via-ink-900 to-ink-900",
    ring: "ring-down-500/40 text-down-300 bg-down-500/15",
  },
};

function isFreshNote(note: MarketNote | null): boolean {
  if (!note) return false;
  if (note.pinned) return true;
  if (!note.publishedAt) return false;
  const t = new Date(note.publishedAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < 24 * 60 * 60 * 1000;
}

/**
 * Compact pulse widget for the homepage. Renders three things in one card:
 *   1. Today's regime label (risk-on / mixed / risk-off)
 *   2. The editor's daily summary line (if a fresh note exists)
 *   3. Three hottest and three coldest sector tiles
 *
 * Always renders \u2014 falls back to the computed regime + heat-map even
 * when no editor note has been published.
 */
export default async function MarketPulseWidget() {
  const [indicators, sectorHeat, marketNote] = await Promise.all([
    getIndicators(),
    getSectorHeat(),
    client
      .fetch<MarketNote | null>(latestMarketNoteQuery)
      .catch(() => null),
  ]);

  const computed = classifyRegime(indicators);
  const regimeFromNote =
    marketNote &&
    isFreshNote(marketNote) &&
    marketNote.regime &&
    marketNote.regime !== "auto"
      ? (marketNote.regime as ComputedRegime)
      : computed.regime;
  const tone = REGIME_TONE[regimeFromNote];
  const showNote = isFreshNote(marketNote);

  const hottest = sectorHeat.slice(0, 3);
  const coldest = sectorHeat.slice(-3).reverse();

  return (
    <Link
      href="/pulse"
      className={cn(
        "group relative block overflow-hidden rounded-3xl border bg-gradient-to-br p-5 transition-all hover:shadow-2xl sm:p-6",
        tone.classes
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ash-200 ring-1 ring-inset ring-ink-700">
          <Flame className="h-3 w-3 text-accent-300" />
          Market Pulse
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset",
            tone.ring
          )}
        >
          <Compass className="h-3 w-3" />
          {tone.label}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-accent-300 transition-transform group-hover:translate-x-0.5">
          See full pulse
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>

      <p className="mt-3 text-balance text-base font-semibold leading-snug text-ash-50 sm:text-lg">
        {showNote && marketNote?.summary
          ? marketNote.summary
          : computed.rationale + "."}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PulseStrip title="Hot today" rows={hottest} tone="up" />
        <PulseStrip title="Cold today" rows={coldest} tone="down" />
      </div>

      <div className="mt-3 text-[11px] uppercase tracking-wider text-ash-500">
        Updated every 5 minutes &middot; powered by sector ETFs
      </div>
    </Link>
  );
}

function PulseStrip({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: { tile: { title: string; etf: string; icon: string; accent: string }; quote: { changePercent: number } }[];
  tone: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-ink-700/70 bg-ink-900/40 p-3">
      <div
        className={cn(
          "mb-2 text-[10px] font-bold uppercase tracking-wider",
          tone === "up" ? "text-up-300" : "text-down-300"
        )}
      >
        {title}
      </div>
      <ul className="space-y-1.5">
        {rows.map((r) => {
          const dp = r.quote.changePercent;
          return (
            <li
              key={r.tile.etf}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded ring-1 ring-inset",
                  ACCENT_RING[r.tile.accent || "cyan"]
                )}
              >
                <SectorIcon
                  icon={r.tile.icon}
                  className="h-3 w-3"
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-ash-200">
                {r.tile.title}
              </span>
              <span
                className={cn(
                  "font-mono text-xs font-semibold tabular-nums",
                  dp > 0 && "text-up-300",
                  dp < 0 && "text-down-300",
                  dp === 0 && "text-ash-400"
                )}
              >
                {formatPercent(dp)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
