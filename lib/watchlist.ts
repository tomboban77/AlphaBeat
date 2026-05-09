"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "ab.watchlist.v1";
const EVENT_NAME = "ab:watchlist-change";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(symbols: string[]) {
  if (typeof window === "undefined") return;
  try {
    const unique = Array.from(new Set(symbols.map((s) => s.toUpperCase())));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // ignore
  }
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

const EMPTY: string[] = [];

/**
 * Read-only snapshot of the current watchlist.
 * Hydration-safe: returns [] on server / first client render, then updates.
 */
export function useWatchlist(): string[] {
  const symbols = useSyncExternalStore(
    subscribe,
    () => {
      const raw = read();
      return raw.join("|");
    },
    () => ""
  );
  return useMemo(() => (symbols ? symbols.split("|") : EMPTY), [symbols]);
}

export function useWatchlistActions() {
  const add = useCallback((symbol: string) => {
    if (!symbol) return;
    const cur = read();
    const sym = symbol.toUpperCase();
    if (cur.includes(sym)) return;
    write([sym, ...cur]);
  }, []);
  const remove = useCallback((symbol: string) => {
    const sym = symbol.toUpperCase();
    write(read().filter((s) => s !== sym));
  }, []);
  const toggle = useCallback((symbol: string): boolean => {
    const sym = symbol.toUpperCase();
    const cur = read();
    if (cur.includes(sym)) {
      write(cur.filter((s) => s !== sym));
      return false;
    }
    write([sym, ...cur]);
    return true;
  }, []);
  const clear = useCallback(() => write([]), []);
  const has = useCallback((symbol: string) => {
    return read().includes(symbol.toUpperCase());
  }, []);
  return { add, remove, toggle, clear, has };
}
