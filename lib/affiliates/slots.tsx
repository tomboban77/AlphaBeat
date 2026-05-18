/**
 * lib/affiliates/slots.tsx
 *
 * Affiliate CTA component. Renders nothing when enableAffiliates is false.
 * Shows both Wealthsimple ($25) and Questrade ($50) referral links.
 */

import Link from "next/link";
import { PROVIDERS } from "./providers";

type SlotContext = "stock-file" | "top-list" | "playbook" | "sidebar";

interface AffiliateSlotProps {
  context?:          SlotContext;
  enableAffiliates?: boolean;
}

export default function AffiliateSlot({
  context = "stock-file",
  enableAffiliates = false,
}: AffiliateSlotProps) {
  if (!enableAffiliates) return null;

  const headline =
    context === "sidebar"
      ? "Open an account"
      : "Ready to invest? Open a Canadian account";

  const sub =
    context === "stock-file"
      ? "Both platforms offer commission-free TSX trading with no account minimums."
      : "Commission-free TSX trading. TFSA, RRSP, and FHSA accounts.";

  return (
    <div className="rounded-2xl border border-accent-500/20 bg-accent-500/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">
        {headline}
      </p>
      <p className="mt-1 text-sm text-ash-400">{sub}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {PROVIDERS.map((p) => (
          <Link
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-between rounded-xl border border-ink-600 bg-ink-800/60 px-4 py-3 text-sm transition-colors hover:border-accent-500/40 hover:bg-ink-800"
          >
            <span className="font-semibold text-ash-100">{p.name}</span>
            <span className="rounded-full bg-up-500/15 px-2 py-0.5 text-xs font-bold text-up-300">
              {p.bonus}
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-ash-600">
        Referral links — AlphaBeat earns a bonus if you sign up. T&amp;Cs apply.
        Editorial content is always independent of affiliate relationships.
      </p>
    </div>
  );
}
