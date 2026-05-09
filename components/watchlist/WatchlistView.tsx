"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { useWatchlist, useWatchlistActions } from "@/lib/watchlist";
import {
  cn,
  displayTicker,
  formatPercent,
  formatPrice,
} from "@/lib/utils";
import type { MarketQuote, Stock } from "@/lib/types";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";

interface WatchlistViewProps {
  curatedStocks: Stock[];
}

export default function WatchlistView({ curatedStocks }: WatchlistViewProps) {
  const watchlist = useWatchlist();
  const { remove, clear } = useWatchlistActions();
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Build a lookup from normalized symbol → curated stock metadata, if available
  const curatedBySymbol = new Map<string, Stock>();
  for (const s of curatedStocks) {
    curatedBySymbol.set(normalizeFinnhubSymbol(s.ticker), s);
  }

  const refresh = async () => {
    if (watchlist.length === 0) {
      setQuotes({});
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/quote?symbols=${encodeURIComponent(watchlist.join(","))}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as { quotes?: Record<string, MarketQuote> };
      setQuotes(data.quotes || {});
      setUpdatedAt(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist.join("|")]);

  if (watchlist.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 p-10 text-center">
        <Star className="mx-auto h-10 w-10 text-ash-500" />
        <h2 className="mt-4 text-lg font-semibold text-ash-100">
          Your watchlist is empty
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ash-400">
          Browse stocks and tap the star to start watching. Your watchlist is
          stored on this device — no signup required.
        </p>
        <Link
          href="/stocks"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-accent-400"
        >
          Find stocks
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-md border border-ink-600 bg-ink-800 px-3 py-1.5 text-xs font-semibold text-ash-200 hover:border-ink-500"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </button>
        {updatedAt && (
          <span className="text-xs text-ash-500">
            Updated {updatedAt.toLocaleTimeString()}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear your watchlist? This can't be undone.")) clear();
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-down-500/30 bg-down-500/5 px-3 py-1.5 text-xs font-semibold text-down-400 hover:border-down-500/60"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/40">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_64px] items-center gap-4 border-b border-ink-700 bg-ink-900/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ash-400 sm:grid">
          <div>Ticker</div>
          <div className="text-right">Price</div>
          <div className="text-right">Change</div>
          <div>Day range</div>
          <div className="text-center">Remove</div>
        </div>

        <ul className="divide-y divide-ink-700">
          {watchlist.map((sym) => {
            const norm = normalizeFinnhubSymbol(sym);
            const quote = quotes[norm];
            const curated = curatedBySymbol.get(norm);
            const tone = !quote
              ? "flat"
              : quote.changePercent > 0
              ? "up"
              : quote.changePercent < 0
              ? "down"
              : "flat";
            return (
              <li
                key={sym}
                className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr_64px]"
              >
                <div>
                  {curated ? (
                    <Link
                      href={`/stocks/${curated.slug.current}`}
                      className="block min-w-0"
                    >
                      <div className="font-mono text-sm font-bold text-ash-50">
                        {displayTicker(sym)}
                      </div>
                      <div className="truncate text-sm text-ash-300">
                        {curated.name}
                      </div>
                    </Link>
                  ) : (
                    <div className="min-w-0">
                      <div className="font-mono text-sm font-bold text-ash-50">
                        {displayTicker(sym)}
                      </div>
                      <div className="text-xs text-ash-500">
                        {/* No curated entry yet */}
                        Live quote only
                      </div>
                    </div>
                  )}
                </div>

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

                <div className="hidden text-xs text-ash-400 sm:block">
                  {quote && quote.high != null && quote.low != null
                    ? `${formatPrice(quote.low, quote.currency)} – ${formatPrice(quote.high, quote.currency)}`
                    : "—"}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => remove(sym)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ash-500 transition-colors hover:bg-ink-700 hover:text-down-400"
                    aria-label={`Remove ${sym}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-4 text-xs text-ash-500">
        Watchlist is stored locally on this device only. Switch devices to a new
        watchlist; we&rsquo;ll add cross-device sync later.
      </p>
    </div>
  );
}
