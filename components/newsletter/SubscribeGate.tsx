import { Lock, Mail, Clock } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

interface SubscribeGateProps {
  /** Headline shown at the top of the gate. */
  title: string;
  /** Short description under the headline. */
  description: string;
  /** Optional unlock label, e.g. "in 4 days" or "Sunday Nov 9". */
  unlocksLabel?: string;
  /** Source tag passed to NewsletterForm for attribution. */
  source?: string;
  /** Visual size — full = page-section CTA, compact = mid-content. */
  size?: "full" | "compact";
}

/**
 * The gate shown on newsletter-exclusive issues. It explains *why* the
 * content is gated, gives a clear unlock date so the experience feels
 * fair, and offers an inline subscribe form for instant access.
 */
export default function SubscribeGate({
  title,
  description,
  unlocksLabel,
  source = "weekly-pick-gate",
  size = "full",
}: SubscribeGateProps) {
  const compact = size === "compact";

  return (
    <aside
      className={
        "relative overflow-hidden rounded-2xl border border-accent-500/30 " +
        "bg-gradient-to-br from-accent-500/10 via-ink-900 to-ink-900 " +
        (compact ? "p-5 sm:p-6" : "p-6 sm:p-8")
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-500/15 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-300">
          <Lock className="h-3.5 w-3.5" />
          Newsletter exclusive
        </div>

        <h3
          className={
            "mt-3 text-balance font-bold tracking-tight text-ash-50 " +
            (compact ? "text-xl" : "text-2xl sm:text-3xl")
          }
        >
          {title}
        </h3>
        <p
          className={
            "mt-2 text-pretty text-ash-300 " +
            (compact ? "text-sm" : "text-base")
          }
        >
          {description}
        </p>

        <div className="mt-5 max-w-xl">
          <NewsletterForm
            source={source}
            ctaLabel="Get tonight's issue"
            placeholder="you@example.com"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ash-400">
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Free. One email per week.
          </span>
          {unlocksLabel && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Unlocks publicly {unlocksLabel}.
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
