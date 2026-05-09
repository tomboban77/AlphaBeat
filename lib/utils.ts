import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const SITE_NAME = "AlphaBeat";
export const SITE_TAGLINE = "Investing intelligence, beautifully simple.";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeWeek(date: string | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return "this week";
  if (diffDays < 14) return "last week";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 225;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://alphabeat.io";
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path}`;
}

export function shouldOpenLinkInNewTab(
  href: string | undefined,
  blankFromCms?: boolean
): boolean {
  if (blankFromCms === false) return false;
  if (!href?.trim()) return false;
  const h = href.trim();
  if (h.startsWith("#")) return false;
  if (/^(mailto:|tel:)/i.test(h)) return false;
  if (h.startsWith("/") && !h.startsWith("//")) return false;
  const base = siteUrl();
  try {
    const resolved = h.startsWith("http")
      ? new URL(h)
      : new URL(h, base.endsWith("/") ? base : `${base}/`);
    const site = new URL(base);
    return resolved.origin !== site.origin;
  } catch {
    return false;
  }
}

// ============================================================================
// Stock / market formatting helpers
// ============================================================================

export function formatPrice(value: number | null | undefined, currency = "USD"): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const fractionDigits = value < 1 ? 4 : value < 100 ? 2 : 2;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return value.toFixed(fractionDigits);
  }
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatChange(value: number | null | undefined, currency = "USD"): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${formatPrice(value, currency)}`;
}

/**
 * Format a market cap (in millions, like Finnhub returns).
 * Returns "$1.42T", "$324B", "$8.2B", "$420M".
 */
export function formatMarketCap(millions: number | null | undefined, currency = "USD"): string {
  if (millions == null || !Number.isFinite(millions) || millions <= 0) return "—";
  const symbol = currency === "CAD" ? "C$" : "$";
  if (millions >= 1_000_000) return `${symbol}${(millions / 1_000_000).toFixed(2)}T`;
  if (millions >= 1_000) return `${symbol}${(millions / 1_000).toFixed(2)}B`;
  return `${symbol}${millions.toFixed(0)}M`;
}

export function formatVolume(volume: number | null | undefined): string {
  if (volume == null || !Number.isFinite(volume)) return "—";
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return String(volume);
}

/**
 * Tone-aware utility: returns "up", "down", or "flat" based on value sign.
 */
export function trendOf(value: number | null | undefined): "up" | "down" | "flat" {
  if (value == null || !Number.isFinite(value) || value === 0) return "flat";
  return value > 0 ? "up" : "down";
}

/**
 * Strip the "exchange suffix" from a ticker for display. e.g. "SHOP.TO" -> "SHOP".
 */
export function displayTicker(ticker: string): string {
  return ticker.replace(/\.[A-Z]+$/, "").toUpperCase();
}

/**
 * Convert CMS exchange code → currency.
 */
export function currencyFor(exchange: string | undefined): string {
  if (!exchange) return "USD";
  if (exchange === "TSX" || exchange === "TSXV") return "CAD";
  return "USD";
}

// ============================================================================
// Risk score helpers
// ============================================================================

export type RiskTone = "low" | "medium" | "high" | "speculative";

export const RISK_LABEL: Record<RiskTone, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  speculative: "Speculative",
};

export const RISK_CLASSES: Record<RiskTone, string> = {
  low: "bg-up-500/15 text-up-300 ring-up-500/30",
  medium: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  high: "bg-warn-500/15 text-warn-300 ring-warn-500/30",
  speculative: "bg-down-500/15 text-down-300 ring-down-500/30",
};
