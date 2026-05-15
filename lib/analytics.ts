/**
 * lib/analytics.ts
 *
 * GA4 custom event helpers. All functions are no-ops when GA4 is not loaded.
 * Call only from client components (never from server components or API routes).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function track(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params ?? {});
}

/** Fired when a user successfully subscribes to The Brief. */
export function trackBriefSubscribe(source: string) {
  track("brief_subscribe", { source });
}

/** Fired when a user scrolls past 90% of a Brief issue. */
export function trackBriefReadComplete(slug: string) {
  track("brief_read_complete", { slug });
}

/** Fired on mount of a Stock File detail page. */
export function trackStockFileView(ticker: string, sectorLabel: string) {
  track("stock_file_view", { ticker, sector: sectorLabel });
}

/** Fired when a ticker is added to the watchlist (not on remove). */
export function trackWatchlistAdd(ticker: string) {
  track("watchlist_add", { ticker });
}

/** Fired when a user expands a Playbook section. */
export function trackPlaybookSectionExpand(slug: string, sectionHeading: string) {
  track("playbook_section_expand", { slug, section: sectionHeading });
}

/** Fired on mount of a Top List page. */
export function trackTopListView(slug: string, category: string) {
  track("top_list_view", { slug, category: category ?? "" });
}
