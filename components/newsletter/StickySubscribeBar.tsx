"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Mail, X } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

const DISMISS_KEY = "alphabeat:sticky-bar-dismissed";
const DISMISS_EVENT = "alphabeat:sticky-bar-dismissed-change";
const DISMISS_DAYS = 7;

/** Pathname prefixes where the sticky bar should NOT show. */
const HIDDEN_PATHS = [
  "/subscribe",
  "/newsletter",
  "/studio",
  "/watchlist",
];

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function persistDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    window.dispatchEvent(new CustomEvent(DISMISS_EVENT));
  } catch {
    // ignore
  }
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(DISMISS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(DISMISS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function useDismissed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => (readDismissed() ? "1" : "0"),
    () => "0"
  ) === "1";
}

/**
 * Sticky bar that slides up from the bottom after the user scrolls 50%+ of
 * the page. Hidden on signup-heavy / utility pages and on first viewport.
 *
 * Why: most newsletter conversion happens AFTER the reader engages with
 * content. A scroll-anchored CTA captures that intent without being annoying.
 */
export default function StickySubscribeBar() {
  const pathname = usePathname();
  const dismissed = useDismissed();

  // Visibility resets per route. We model this with the "track previous
  // pathname during render" pattern so the lint rule (no setState in effect)
  // stays satisfied.
  const [visible, setVisible] = useState(false);
  const [trackedPath, setTrackedPath] = useState(pathname);
  if (trackedPath !== pathname) {
    setTrackedPath(pathname);
    setVisible(false);
  }

  const isHidden =
    pathname === "/" ||
    HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (dismissed || isHidden || visible) return;

    let frame = 0;
    function check() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = (doc.scrollHeight || 0) - window.innerHeight;
      if (max <= 0) return;
      const ratio = scrollTop / max;
      if (ratio >= 0.5) {
        setVisible(true);
      }
    }
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(check);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname, dismissed, isHidden, visible]);

  if (dismissed || isHidden || !visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:px-6 sm:pb-5"
      role="region"
      aria-label="Newsletter subscription"
    >
      <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-accent-500/40 bg-ink-900/95 px-4 py-3 shadow-2xl shadow-accent-500/10 ring-1 ring-accent-500/10 backdrop-blur-md sm:px-5 sm:py-4">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-300 sm:flex">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ash-50">
              The Brief — every Sunday. Canadian investing, made clearer.
            </p>
            <p className="hidden text-xs text-ash-400 sm:block">
              One stock, one tax tip, one TSX note. Free. Unsubscribe anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={persistDismissed}
            className="ml-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ash-500 transition-colors hover:bg-ink-700 hover:text-ash-200"
            aria-label="Dismiss newsletter prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3">
          <NewsletterForm
            source="sticky-bar"
            ctaLabel="Subscribe"
            placeholder="you@example.com"
          />
        </div>
      </div>
    </div>
  );
}
