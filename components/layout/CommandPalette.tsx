"use client";

import { Command } from "cmdk";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Layers, Newspaper, Search, Star, TrendingUp } from "lucide-react";
import { useWatchlist } from "@/lib/watchlist";

interface SearchHit {
  type: "stock";
  title: string;
  subtitle?: string;
  href: string;
  ticker?: string;
}

interface RemoteHit {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [local, setLocal] = useState<SearchHit[]>([]);
  const [remote, setRemote] = useState<RemoteHit[]>([]);
  const [loading, setLoading] = useState(false);
  const watchlist = useWatchlist();
  const inflight = useRef<AbortController | null>(null);

  // Keyboard: cmd+k / ctrl+k toggles
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setLocal([]);
      setRemote([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setLocal([]);
      setRemote([]);
      return;
    }
    if (inflight.current) inflight.current.abort();
    const ctl = new AbortController();
    inflight.current = ctl;
    setLoading(true);

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctl.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { local: SearchHit[]; remote: RemoteHit[] };
        setLocal(data.local || []);
        setRemote(data.remote || []);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setLocal([]);
          setRemote([]);
        }
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [query, open]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  if (!open) return null;

  const showQuickLinks = !query.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search AlphaBeat"
      cmdk-overlay=""
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        className="absolute left-1/2 top-[12vh] -translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="AlphaBeat search" loop>
          <div className="flex items-center px-4">
            <Search className="h-4 w-4 shrink-0 text-ash-400" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search tickers, sectors, ETFs, insights…"
              autoFocus
            />
            <kbd className="ml-2 rounded border border-ink-600 bg-ink-700 px-1.5 py-0.5 text-[10px] font-medium text-ash-400">
              ESC
            </kbd>
          </div>

          <Command.List>
            {loading && <Command.Loading>Searching…</Command.Loading>}
            <Command.Empty>
              {query.trim() ? "No matches. Try another ticker or keyword." : ""}
            </Command.Empty>

            {showQuickLinks && (
              <>
                <Command.Group heading="Jump to">
                  <Command.Item onSelect={() => go("/")}>
                    <TrendingUp className="h-4 w-4 text-accent-400" />
                    <span>Home</span>
                  </Command.Item>
                  <Command.Item onSelect={() => go("/brief")}>
                    <Newspaper className="h-4 w-4 text-accent-400" />
                    <span>The Brief — weekly investing newsletter</span>
                  </Command.Item>
                  <Command.Item onSelect={() => go("/stocks")}>
                    <LineChart className="h-4 w-4 text-up-400" />
                    <span>Stock Files — score-driven reference pages</span>
                  </Command.Item>
                  <Command.Item onSelect={() => go("/playbooks")}>
                    <Layers className="h-4 w-4 text-violet-400" />
                    <span>Playbooks — deep-dive investing guides</span>
                  </Command.Item>
                  <Command.Item onSelect={() => go("/best")}>
                    <Search className="h-4 w-4 text-amber-400" />
                    <span>Top Lists — best Canadian stocks by category</span>
                  </Command.Item>
                  <Command.Item onSelect={() => go("/watchlist")}>
                    <Star className="h-4 w-4 text-accent-400" />
                    <span>My watchlist ({watchlist.length})</span>
                  </Command.Item>
                </Command.Group>
              </>
            )}

            {local.length > 0 && (
              <Command.Group heading="Stock Files">
                {local.map((h) => (
                  <Command.Item
                    key={`s-${h.href}`}
                    onSelect={() => go(h.href)}
                    value={`${h.ticker || ""} ${h.title}`}
                  >
                    <LineChart className="h-4 w-4 text-up-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-ash-100">{h.title}</div>
                      {h.subtitle && (
                        <div className="truncate text-xs text-ash-400">
                          {h.subtitle}
                        </div>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {remote.length > 0 && (
              <Command.Group heading="Markets (live ticker search)">
                {remote.map((r) => (
                  <Command.Item
                    key={`r-${r.symbol}`}
                    value={`${r.symbol} ${r.description}`}
                    onSelect={() =>
                      go(`/stocks/${r.symbol.toLowerCase().replace(/\./g, "-")}`)
                    }
                  >
                    <TrendingUp className="h-4 w-4 text-accent-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-ash-100">
                        {r.displaySymbol || r.symbol}
                      </div>
                      <div className="truncate text-xs text-ash-400">
                        {r.description} · {r.type}
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
