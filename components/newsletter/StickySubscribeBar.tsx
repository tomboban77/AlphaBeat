"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, X } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

const DISMISS_KEY = "alphabeat:sticky-bar-dismissed";
const DISMISS_DAYS = 7;

/** Pathname prefixes where the sticky bar should NOT show. */
const HIDDEN_PATHS = [
  "/subscribe",
  "/newsletter",
  "/studio",
  "/watchlist",
];

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    const elapsedMs = Date.now() - ts;
    return elapsedMs < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
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
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Reset on route change so each page gets a fresh evaluation, but keep the
  // dismissed status sticky across the whole session.
  useEffect(() => {
    setVisible(false);
    setDismissed(isDismissed());
  }, [pathname]);

  useEffect(() => {
    if (dismissed) return;

    const isHidden =
      pathname === "/" ||
      HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (isHidden) return;

    let frame = 0;
    function check() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = (doc.scrollHeight || 0) - window.innerHeight;
      if (max <= 0) return;
      const ratio = scrollTop / max;
      if (ratio >= 0.5) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
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
  }, [pathname, dismissed]);

  if (dismissed || !visible) return null;

  function dismiss() {
    setVisible(false);
    setDismissed(true);
    markDismissed();
  }

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
              Get the weekly Top 10 in your inbox.
            </p>
            <p className="hidden text-xs text-ash-400 sm:block">
              Free Sundays. Unsubscribe in one click. No spam, ever.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
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
