/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Mail,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useWatchlist, useWatchlistActions } from "@/lib/watchlist";
import { cn, formatDate, formatPercent, formatPrice } from "@/lib/utils";

interface WatchlistItem {
  ticker:        string;
  companyName:   string;
  sectorLabel:   string;
  slug:          string | null;
  price:         number;
  change:        number;
  changePercent: number;
  currency:      string;
  stale:         boolean;
  overallScore:  number | null;
  lastReviewed:  string | null;
  reviewType:    string | null;
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-ash-600">N/A</span>;
  const tone = score >= 70 ? "text-up-400" : score >= 50 ? "text-accent-400" : score >= 30 ? "text-warn-400" : "text-down-400";
  return <span className={cn("font-mono text-sm font-bold tabular-nums", tone)}>{score}</span>;
}

function DigestForm({ tickers }: { tickers: string[] }) {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState<"idle" | "loading" | "done" | "error">("idle");
  const [website, setWebsite] = useState(""); // honeypot

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/digest-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), watchlistTickers: tickers, website }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-up-500/30 bg-up-500/5 px-5 py-4 text-sm text-up-300">
        ✓ You&apos;re on the list. Every Sunday you&apos;ll get a digest for the {tickers.length} ticker{tickers.length !== 1 ? "s" : ""} in your watchlist.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-accent-500/20 bg-accent-500/5 p-5">
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-ash-100">Get a weekly digest of your watchlist</p>
          <p className="mt-0.5 text-xs text-ash-400">
            Every Sunday — price change, score, and one headline per ticker. Free. Separate from The Brief.
          </p>
          <div className="mt-3 flex gap-2">
            {/* honeypot */}
            <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="min-w-0 flex-1 rounded-lg border border-ink-600 bg-ink-800/80 px-3 py-2 text-sm text-ash-100 placeholder-ash-500 focus:border-accent-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-accent-400 disabled:opacity-60"
            >
              {status === "loading" ? "…" : "Subscribe"}
            </button>
          </div>
          {status === "error" && (
            <p className="mt-2 text-xs text-down-400">Something went wrong — please try again.</p>
          )}
        </div>
      </div>
    </form>
  );
}

export default function WatchlistTracker() {
  const tickers = useWatchlist();
  const { remove } = useWatchlistActions();
  const [items, setItems]   = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef<string>("");

  useEffect(() => {
    const key = tickers.join(",");
    if (!key || key === fetchedRef.current) return;
    fetchedRef.current = key;
    setLoading(true);
    fetch(`/api/watchlist-data?tickers=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((data: WatchlistItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tickers]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
            My Watchlist
          </h1>
          {tickers.length > 0 && (
            <span className="text-sm text-ash-500">
              {tickers.length} ticker{tickers.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="mt-2 text-ash-300">
          Saved on this device — no account required. Click any row to open the full Stock File.
        </p>
      </header>

      {tickers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Digest subscribe */}
          <DigestForm tickers={tickers} />

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-ink-700">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-ink-700 bg-ink-900/60">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ash-500">Ticker</th>
                  <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ash-500 sm:table-cell">Company</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ash-500">Price</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ash-500">Day</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ash-500">Score</th>
                  <th scope="col" className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ash-500 lg:table-cell">Reviewed</th>
                  <th scope="col" className="w-10 px-2 py-3"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {loading && tickers.map((t) => (
                  <tr key={t} className="animate-pulse">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-4 w-32 rounded bg-ink-700" />
                    </td>
                  </tr>
                ))}

                {!loading && items.map((item) => {
                  const tone = item.changePercent > 0 ? "up" : item.changePercent < 0 ? "down" : "flat";
                  const href = item.slug ? `/stocks/${item.slug}` : "/stocks";
                  return (
                    <tr
                      key={item.ticker}
                      className="group relative transition-colors hover:bg-ink-800/60"
                    >
                      {/* Ticker */}
                      <td className="px-4 py-4">
                        <Link href={href} className="absolute inset-0" aria-label={`Open ${item.ticker} Stock File`} />
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-ash-50">{item.ticker}</span>
                          {item.stale && (
                            <span className="rounded bg-warn-500/20 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-warn-300">
                              Sample
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 block text-xs text-ash-500 sm:hidden">
                          {item.companyName}
                        </span>
                      </td>

                      {/* Company */}
                      <td className="hidden px-4 py-4 sm:table-cell">
                        <span className="text-ash-300">{item.companyName}</span>
                        {item.sectorLabel && (
                          <span className="ml-2 text-xs text-ash-600">{item.sectorLabel}</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-mono tabular-nums text-ash-100">
                          {item.price > 0 ? formatPrice(item.price, item.currency) : "—"}
                        </span>
                      </td>

                      {/* Day change */}
                      <td className="px-4 py-4 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 font-mono text-xs tabular-nums",
                            tone === "up" && "text-up-400",
                            tone === "down" && "text-down-400",
                            tone === "flat" && "text-ash-500"
                          )}
                        >
                          {tone === "up" ? <ArrowUpRight className="h-3 w-3" /> : tone === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
                          {item.price > 0 ? formatPercent(item.changePercent) : "—"}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-4 text-right">
                        <ScorePill score={item.overallScore} />
                      </td>

                      {/* Reviewed */}
                      <td className="hidden px-4 py-4 text-right lg:table-cell">
                        {item.lastReviewed ? (
                          <span className="text-xs text-ash-500">{formatDate(item.lastReviewed)}</span>
                        ) : (
                          <span className="text-xs text-ash-700">—</span>
                        )}
                      </td>

                      {/* Remove */}
                      <td className="relative z-10 px-2 py-4">
                        <button
                          type="button"
                          onClick={() => remove(item.ticker)}
                          className="rounded p-1 text-ash-600 transition-colors hover:bg-ink-700 hover:text-down-400"
                          aria-label={`Remove ${item.ticker} from watchlist`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-ash-600">
            Quotes are delayed ~15 min and may be sample data without a Finnhub key. Scores refresh daily.
            Nothing here is investment advice — see the{" "}
            <Link href="/disclaimer" className="underline hover:text-ash-400">disclaimer</Link>.
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-12 text-center">
      <Star className="mx-auto mb-4 h-10 w-10 text-ash-600" />
      <h2 className="text-xl font-bold text-ash-50">Your watchlist is empty</h2>
      <p className="mt-2 text-sm leading-relaxed text-ash-400">
        Click the star on any Stock File to save a ticker here. No account — it lives in your browser.
      </p>
      <Link
        href="/stocks"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
      >
        Browse Stock Files
        <ArrowRight className="h-4 w-4" />
      </Link>
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ash-500">
        <TrendingUp className="h-3.5 w-3.5" />
        Add stocks from any Stock File page, Top List, or search (⌘K)
      </div>
    </div>
  );
}
