/**
 * Newsletter provider abstraction.
 *
 * Today we ship one implementation — Beehiiv. The provider can be swapped
 * (Buttondown, ConvertKit/Kit, Resend Audiences, etc.) without touching the
 * API route or UI.
 *
 * Each provider exposes a single `subscribe()` function that returns a
 * uniform `SubscribeResult`. The route handler maps that into HTTP responses.
 */

export interface SubscribeInput {
  email: string;
  /** Where this signup happened, e.g. "home-cta", "hidden-gems-footer". */
  source?: string;
  /** Optional UTM context if available. */
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export type SubscribeStatus =
  | "subscribed" // brand-new subscriber created
  | "already-subscribed" // email already on list (treat as success)
  | "pending-confirmation" // double-opt-in pending
  | "invalid-email"
  | "rate-limited"
  | "provider-error"
  | "not-configured";

export interface SubscribeResult {
  status: SubscribeStatus;
  /** Human-friendly message we surface to the visitor. */
  message: string;
}

export interface NewsletterProvider {
  name: string;
  isConfigured(): boolean;
  subscribe(input: SubscribeInput): Promise<SubscribeResult>;
}

import { beehiivProvider } from "./beehiiv";

/** Returns the active provider based on environment. Beehiiv by default. */
export function getNewsletterProvider(): NewsletterProvider {
  // Future: switch on NEWSLETTER_PROVIDER env to support buttondown / resend.
  return beehiivProvider;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isPlausibleEmail(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length > 254) return false;
  return EMAIL_RE.test(trimmed);
}
