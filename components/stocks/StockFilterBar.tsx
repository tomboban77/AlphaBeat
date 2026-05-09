"use client";

import { useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import StockCard from "./StockCard";
import type { Stock, MarketQuote, CandlePoint } from "@/lib/types";
import type { Sector } from "@/lib/types";
import { cn } from "@/lib/utils";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";

interface StockFilterBarProps {
  stocks: Stock[];
  quotes: Record<string, MarketQuote>;
  sparks?: Record<string, CandlePoint[]>;
  sectors: Sector[];
}

type SortKey = "default" | "price-up" | "price-down" | "ticker";
type Country = "all" | "US" | "CA";

export default function StockFilterBar({
  stocks,
  quotes,
  sparks,
  sectors,
}: StockFilterBarProps) {
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [country, setCountry] = useState<Country>("all");
  const [sort, setSort] = useState<SortKey>("default");
  const [hideSponsored, setHideSponsored] = useState(false);

  const filtered = useMemo(() => {
    let list = [...stocks];
    if (sectorFilter !== "all") {
      list = list.filter((s) => s.sector?.slug.current === sectorFilter);
    }
    if (country !== "all") {
      list = list.filter((s) => (s.country || "US") === country);
    }
    if (hideSponsored) {
      list = list.filter((s) => !s.sponsored);
    }
    if (sort === "price-up" || sort === "price-down") {
      list.sort((a, b) => {
        const qa = quotes[normalizeFinnhubSymbol(a.ticker)]?.changePercent ?? 0;
        const qb = quotes[normalizeFinnhubSymbol(b.ticker)]?.changePercent ?? 0;
        return sort === "price-up" ? qb - qa : qa - qb;
      });
    } else if (sort === "ticker") {
      list.sort((a, b) => a.ticker.localeCompare(b.ticker));
    }
    return list;
  }, [stocks, sectorFilter, country, sort, hideSponsored, quotes]);

  const activeCount =
    (sectorFilter !== "all" ? 1 : 0) +
    (country !== "all" ? 1 : 0) +
    (sort !== "default" ? 1 : 0) +
    (hideSponsored ? 1 : 0);

  return (
    <>
      <div className="sticky top-[88px] z-20 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-y border-ink-700 bg-ink-950/80 px-4 py-3 backdrop-blur sm:top-[72px] sm:mx-0 sm:rounded-xl sm:border">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ash-400">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="rounded-md border border-ink-600 bg-ink-800 px-2 py-1.5 text-xs text-ash-100 focus:border-accent-500 focus:outline-none"
        >
          <option value="all">All sectors</option>
          {sectors.map((s) => (
            <option key={s._id} value={s.slug.current}>
              {s.title}
            </option>
          ))}
        </select>

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as Country)}
          className="rounded-md border border-ink-600 bg-ink-800 px-2 py-1.5 text-xs text-ash-100 focus:border-accent-500 focus:outline-none"
        >
          <option value="all">All markets</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-ink-600 bg-ink-800 px-2 py-1.5 text-xs text-ash-100 focus:border-accent-500 focus:outline-none"
        >
          <option value="default">Editor&rsquo;s order</option>
          <option value="price-up">Top gainers</option>
          <option value="price-down">Top losers</option>
          <option value="ticker">Ticker A-Z</option>
        </select>

        <label className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-md border border-ink-600 bg-ink-800 px-2 py-1.5 text-xs text-ash-200 hover:bg-ink-700">
          <input
            type="checkbox"
            checked={hideSponsored}
            onChange={(e) => setHideSponsored(e.target.checked)}
            className="h-3 w-3 accent-accent-500"
          />
          Hide sponsored
        </label>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setSectorFilter("all");
              setCountry("all");
              setSort("default");
              setHideSponsored(false);
            }}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-ash-400 hover:text-ash-100"
          >
            <X className="h-3 w-3" />
            Clear ({activeCount})
          </button>
        )}

        <span
          className={cn(
            "ml-auto text-xs text-ash-500",
            activeCount > 0 && "ml-0"
          )}
        >
          Showing <span className="font-bold text-ash-200">{filtered.length}</span> of {stocks.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 py-16 text-center">
          <p className="text-ash-400">No stocks match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((stock) => {
            const sym = normalizeFinnhubSymbol(stock.ticker);
            return (
              <StockCard
                key={stock._id}
                stock={stock}
                quote={quotes[sym]}
                spark={sparks?.[sym]}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
