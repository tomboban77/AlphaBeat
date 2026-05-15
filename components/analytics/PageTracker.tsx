"use client";

import { useEffect, useRef } from "react";
import { trackBriefReadComplete, trackStockFileView, trackTopListView } from "@/lib/analytics";

// ---------------------------------------------------------------------------
// Stock File view tracker — fires on mount
// ---------------------------------------------------------------------------
export function StockFileTracker({ ticker, sectorLabel }: { ticker: string; sectorLabel: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackStockFileView(ticker, sectorLabel);
  }, [ticker, sectorLabel]);
  return null;
}

// ---------------------------------------------------------------------------
// Top List view tracker — fires on mount
// ---------------------------------------------------------------------------
export function TopListTracker({ slug, category }: { slug: string; category: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackTopListView(slug, category);
  }, [slug, category]);
  return null;
}

// ---------------------------------------------------------------------------
// Brief read-complete tracker — fires once when 90% of page is scrolled
// ---------------------------------------------------------------------------
export function ScrollTracker({ slug }: { slug: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    const check = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total    = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.9) {
        fired.current = true;
        trackBriefReadComplete(slug);
        window.removeEventListener("scroll", check, { passive: true } as EventListenerOptions);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check, { passive: true } as EventListenerOptions);
  }, [slug]);
  return null;
}
