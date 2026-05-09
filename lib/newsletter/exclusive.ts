/**
 * Helpers that drive the newsletter-exclusivity window.
 *
 * Strategy: a weekly issue is "newsletter-exclusive" for 7 days from its
 * `weekOf` date. During that window, the full per-pick thesis is gated on
 * the website — only subscribers see the full version (in their inbox).
 *
 * After 7 days, the gate lifts and the issue's full content publishes to
 * the web archive.
 */

const EXCLUSIVITY_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDate(input: string | undefined | null): Date | null {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * True if the issue's weekOf date is within the last 7 days (inclusive).
 */
export function isExclusiveIssue(weekOf: string | undefined | null): boolean {
  const issued = parseDate(weekOf);
  if (!issued) return false;
  const now = Date.now();
  const elapsed = now - issued.getTime();
  return elapsed >= 0 && elapsed < EXCLUSIVITY_DAYS * MS_PER_DAY;
}

/**
 * Returns the Date when the issue unlocks publicly on the web.
 * Returns null if `weekOf` is missing/invalid.
 */
export function getUnlockDate(weekOf: string | undefined | null): Date | null {
  const issued = parseDate(weekOf);
  if (!issued) return null;
  return new Date(issued.getTime() + EXCLUSIVITY_DAYS * MS_PER_DAY);
}

/**
 * Friendly relative-time label for when the issue unlocks publicly.
 * Examples: "in 3 days", "tomorrow", "Sunday Oct 27".
 */
export function formatUnlockLabel(weekOf: string | undefined | null): string {
  const unlock = getUnlockDate(weekOf);
  if (!unlock) return "";
  const now = Date.now();
  const diffMs = unlock.getTime() - now;
  if (diffMs <= 0) return "now";
  const days = Math.ceil(diffMs / MS_PER_DAY);
  if (days === 1) return "tomorrow";
  if (days <= 6) return `in ${days} days`;
  return unlock.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * How many picks are shown in full as a teaser when an issue is exclusive.
 */
export const EXCLUSIVE_TEASER_PICKS = 3;
