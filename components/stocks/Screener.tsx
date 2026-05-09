"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Search,
  Star,
  X,
} from "lucide-react";
import type { Stock, Sector, MarketQuote } from "@/lib/types";
import {
  cn,
  displayTicker,
  formatPercent,
  formatPrice,
} from "@/lib/utils";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";
import { useWatchlist, useWatchlistActions } from "@/lib/watchlist";
import SectorBadge from "@/components/sectors/SectorBadge";

type SortKey = "ticker" | "name" | "change-asc" | "change-desc" | "price-asc" | "price-desc";
type Country = "all" | "US" | "CA";
type Cap = "all" | "mega" | "large" | "mid" | "small" | "micro";

interface ScreenerProps {
  stocks: Stock[];
  quotes: Record<string, MarketQuote>;
  sectors: Sector[];
}

export default function Screener({ stocks, quotes, sectors }: ScreenerProps) {
  const watchlist = useWatchlist();
  const { toggle } = useWatchlistActions();
  const [q, setQ] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [country, setCountry] = useState<Country>("all");
  const [cap, setCap] = useState<Cap>("all");
  const [moverFilter, setMoverFilter] = useState<"all" | "up" | "down">("all");
  const [minChange, setMinChange] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("change-desc");
  const [hideSponsored, setHideSponsored] = useState(false);

  const rows = useMemo(() => {
    let list = stocks.map((s) => ({
      stock: s,
      quote: quotes[normalizeFinnhubSymbol(s.ticker)],
    }));
    const Q = q.trim().toLowerCase();
    if (Q) {
      list = list.filter(
        (r) =>
          r.stock.ticker.toLowerCase().includes(Q) ||
          r.stock.name.toLowerCase().includes(Q) ||
          r.stock.industry?.toLowerCase().includes(Q)
      );
    }
    if (sectorFilter !== "all") {
      list = list.filter((r) => r.stock.sector?.slug.current === sectorFilter);
    }
    if (country !== "all") {
      list = list.filter((r) => (r.stock.country || "US") === country);
    }
    if (cap !== "all") {
      list = list.filter((r) => r.stock.marketCapBand === cap);
    }
    if (moverFilter === "up") {
      list = list.filter((r) => (r.quote?.changePercent ?? 0) > 0);
    } else if (moverFilter === "down") {
      list = list.filter((r) => (r.quote?.changePercent ?? 0) < 0);
    }
    if (minChange) {
      const m = Number(minChange);
      if (Number.isFinite(m)) {
        list = list.filter(
          (r) => Math.abs(r.quote?.changePercent ?? 0) >= m
        );
      }
    }
    if (hideSponsored) {
      list = list.filter((r) => !r.stock.sponsored);
    }

    const get = (r: (typeof list)[number]) => ({
      ticker: r.stock.ticker,
      name: r.stock.name,
      change: r.quote?.changePercent ?? 0,
      price: r.quote?.price ?? 0,
    });

    list.sort((a, b) => {
      const A = get(a);
      const B = get(b);
      switch (sort) {
        case "ticker":
          return A.ticker.localeCompare(B.ticker);
        case "name":
          return A.name.localeCompare(B.name);
        case "change-asc":
          return A.change - B.change;
        case "change-desc":
          return B.change - A.change;
        case "price-asc":
          return A.price - B.price;
        case "price-desc":
          return B.price - A.price;
      }
    });
    return list;
  }, [stocks, quotes, q, sectorFilter, country, cap, moverFilter, minChange, hideSponsored, sort]);

  const activeCount =
    (q ? 1 : 0) +
    (sectorFilter !== "all" ? 1 : 0) +
    (country !== "all" ? 1 : 0) +
    (cap !== "all" ? 1 : 0) +
    (moverFilter !== "all" ? 1 : 0) +
    (minChange ? 1 : 0) +
    (hideSponsored ? 1 : 0);

  const reset = () => {
    setQ("");
    setSectorFilter("all");
    setCountry("all");
    setCap("all");
    setMoverFilter("all");
    setMinChange("");
    setHideSponsored(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4 rounded-2xl border border-ink-700 bg-ink-800/40 p-4 lg:sticky lg:top-[88px] lg:self-start">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ash-400">
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="ml-auto inline-flex items-center gap-1 rounded text-xs font-semibold normal-case text-ash-400 hover:text-accent-300"
            >
              <X className="h-3 w-3" /> Clear ({activeCount})
            </button>
          )}
        </div>

        <FieldLabel>Search</FieldLabel>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ticker, name, or industry"
            className="w-full rounded-md border border-ink-600 bg-ink-800 py-2 pl-8 pr-2 text-sm text-ash-100 placeholder:text-ash-500 focus:border-accent-500 focus:outline-none"
          />
        </div>

        <FieldLabel>Sector</FieldLabel>
        <Select value={sectorFilter} onChange={(v) => setSectorFilter(v)}>
          <option value="all">All sectors</option>
          {sectors.map((s) => (
            <option key={s._id} value={s.slug.current}>
              {s.title}
            </option>
          ))}
        </Select>

        <FieldLabel>Market</FieldLabel>
        <Select value={country} onChange={(v) => setCountry(v as Country)}>
          <option value="all">United States + Canada</option>
          <option value="US">United States only</option>
          <option value="CA">Canada only</option>
        </Select>

        <FieldLabel>Market cap</FieldLabel>
        <Select value={cap} onChange={(v) => setCap(v as Cap)}>
          <option value="all">Any cap</option>
          <option value="mega">Mega ($200B+)</option>
          <option value="large">Large ($10B–$200B)</option>
          <option value="mid">Mid ($2B–$10B)</option>
          <option value="small">Small ($300M–$2B)</option>
          <option value="micro">Micro (&lt;$300M)</option>
        </Select>

        <FieldLabel>Movers</FieldLabel>
        <div className="grid grid-cols-3 gap-1">
          {(["all", "up", "down"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMoverFilter(m)}
              className={cn(
                "rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors",
                moverFilter === m
                  ? m === "up"
                    ? "border-up-500/50 bg-up-500/10 text-up-300"
                    : m === "down"
                    ? "border-down-500/50 bg-down-500/10 text-down-300"
                    : "border-accent-500/50 bg-accent-500/10 text-accent-300"
                  : "border-ink-600 bg-ink-800 text-ash-400 hover:text-ash-100"
              )}
            >
              {m === "all" ? "All" : m === "up" ? "Up" : "Down"}
            </button>
          ))}
        </div>

        <FieldLabel>Min |% change|</FieldLabel>
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          value={minChange}
          onChange={(e) => setMinChange(e.target.value)}
          placeholder="e.g. 1.5"
          className="w-full rounded-md border border-ink-600 bg-ink-800 px-2 py-2 text-sm text-ash-100 placeholder:text-ash-500 focus:border-accent-500 focus:outline-none"
        />

        <label className="flex cursor-pointer select-none items-center gap-2 rounded-md border border-ink-600 bg-ink-800 px-2 py-2 text-sm text-ash-200 hover:bg-ink-700">
          <input
            type="checkbox"
            checked={hideSponsored}
            onChange={(e) => setHideSponsored(e.target.checked)}
            className="h-3.5 w-3.5 accent-accent-500"
          />
          Hide sponsored placements
        </label>
      </aside>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-ash-400">
            <span className="font-bold text-ash-50">{rows.length}</span> of{" "}
            {stocks.length} stocks
          </div>
          <Select value={sort} onChange={(v) => setSort(v as SortKey)}>
            <option value="change-desc">Top gainers</option>
            <option value="change-asc">Top losers</option>
            <option value="price-desc">Price: high → low</option>
            <option value="price-asc">Price: low → high</option>
            <option value="ticker">Ticker A-Z</option>
            <option value="name">Name A-Z</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 py-16 text-center">
            <p className="text-ash-300">No stocks match your filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/40">
            {/* Header (desktop) */}
            <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_64px] items-center gap-4 border-b border-ink-700 bg-ink-900/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ash-400 sm:grid">
              <div>Stock</div>
              <div className="text-right">Price</div>
              <div className="text-right">Change</div>
              <div>Sector</div>
              <div className="text-center">Watch</div>
            </div>

            <ul className="divide-y divide-ink-700">
              {rows.map(({ stock, quote }) => {
                const tone = !quote
                  ? "flat"
                  : quote.changePercent > 0
                  ? "up"
                  : quote.changePercent < 0
                  ? "down"
                  : "flat";
                const isWatched = watchlist.includes(stock.ticker.toUpperCase());
                return (
                  <li
                    key={stock._id}
                    className="group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-800 sm:grid-cols-[1.6fr_1fr_1fr_1fr_64px]"
                  >
                    <Link
                      href={`/stocks/${stock.slug.current}`}
                      className="min-w-0"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-sm font-bold text-ash-50">
                          {displayTicker(stock.ticker)}
                        </span>
                        <span className="text-[10px] text-ash-500">
                          {stock.exchange}
                        </span>
                        {stock.sponsored && (
                          <span className="rounded bg-warn-500/20 px-1 py-0.5 text-[9px] font-semibold uppercase text-warn-300">
                            Sponsored
                          </span>
                        )}
                      </div>
                      <div className="truncate text-sm text-ash-300">
                        {stock.name}
                      </div>
                    </Link>

                    <div className="hidden text-right font-mono text-sm tabular-nums text-ash-100 sm:block">
                      {quote ? formatPrice(quote.price, quote.currency) : "—"}
                    </div>

                    <div
                      className={cn(
                        "hidden items-center justify-end gap-1 text-right text-sm font-medium tabular-nums sm:flex",
                        tone === "up" && "text-up-400",
                        tone === "down" && "text-down-400",
                        tone === "flat" && "text-ash-400"
                      )}
                    >
                      {tone === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : tone === "down" ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : null}
                      {quote ? formatPercent(quote.changePercent) : "—"}
                    </div>

                    <div className="hidden sm:block">
                      {stock.sector ? (
                        <SectorBadge sector={stock.sector} size="sm" />
                      ) : (
                        <span className="text-xs text-ash-500">—</span>
                      )}
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggle(stock.ticker);
                        }}
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                          isWatched
                            ? "text-accent-400 hover:bg-accent-500/10"
                            : "text-ash-500 hover:bg-ink-700 hover:text-ash-200"
                        )}
                        aria-label={isWatched ? `Remove ${stock.ticker}` : `Watch ${stock.ticker}`}
                      >
                        <Star className={cn("h-4 w-4", isWatched && "fill-accent-400")} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-ash-500">
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-ink-600 bg-ink-800 px-2 py-2 text-sm text-ash-100 focus:border-accent-500 focus:outline-none"
    >
      {children}
    </select>
  );
}
