import { Mail, Zap } from "lucide-react";
import NewsletterForm from "./NewsletterForm";
import { cn } from "@/lib/utils";

interface NewsletterCTAProps {
  source: string;
  /** Visual style. `card` = bordered panel; `banner` = full-width gradient strip; `inline` = compact. */
  variant?: "card" | "banner" | "inline";
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_TITLE = "Get the Top 10 a week before the web.";
const DEFAULT_DESC =
  "Subscribers get the full Top 10 every Sunday at 8pm ET, before Monday's open. The web archive shows picks 1-3 in full and unlocks the rest seven days later. Free.";

export default function NewsletterCTA({
  source,
  variant = "card",
  eyebrow = "Newsletter",
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  className,
}: NewsletterCTAProps) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-ink-700 bg-ink-800/40 p-5 sm:flex-row sm:items-center sm:gap-5",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-300">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ash-50">{title}</div>
            <p className="text-xs text-ash-400">{description}</p>
          </div>
        </div>
        <div className="sm:ml-auto sm:max-w-sm sm:flex-1">
          <NewsletterForm source={source} ctaLabel="Subscribe" />
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl border border-accent-500/30 bg-gradient-to-br from-ink-900 via-ink-900 to-accent-950/40 p-8 sm:p-10",
          className
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.15),transparent_55%)]"
        />
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-300">
              <Zap className="h-3 w-3" />
              {eyebrow}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 max-w-xl text-ash-300">{description}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-ash-400">
              <li>• Full Top 10 thesis, 7 days before the web</li>
              <li>• Same-day Hidden Gem alerts on sub-$20 ideas</li>
              <li>• &ldquo;What I&rsquo;m Watching&rdquo; macro read &mdash; email-only</li>
              <li>• Unsubscribe in one click. No filler.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <NewsletterForm source={source} ctaLabel="Get the newsletter" />
            <p className="text-xs text-ash-500">
              By subscribing you agree to our{" "}
              <a href="/privacy-policy" className="underline-offset-2 hover:underline">
                privacy policy
              </a>
              . Educational only — not investment advice.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Default: card
  return (
    <section
      className={cn(
        "rounded-2xl border border-ink-700 bg-ink-800/40 p-6 sm:p-8",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-300 sm:flex">
          <Mail className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent-300">
            {eyebrow}
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ash-50">
            {title}
          </h3>
          <p className="mt-1.5 max-w-xl text-sm text-ash-300">{description}</p>
        </div>
      </div>
      <div className="mt-5">
        <NewsletterForm source={source} ctaLabel="Subscribe" />
      </div>
      <p className="mt-3 text-xs text-ash-500">
        Free. Unsubscribe anytime. We never share your address.
      </p>
    </section>
  );
}
