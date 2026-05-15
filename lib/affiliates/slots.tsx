/**
 * lib/affiliates/slots.tsx
 *
 * Affiliate CTA component. Renders nothing when enableAffiliates is false
 * in siteSettings (the default at launch).
 *
 * Usage:
 *   <AffiliateSlot exchange="TSX" context="stock-file" />
 *   <AffiliateSlot exchange="NYSE" context="top-list" />
 */

import Link from "next/link";
import { pickProvider } from "./providers";

type SlotContext = "stock-file" | "top-list" | "playbook";

interface AffiliateSlotProps {
  exchange?:       string;
  context?:        SlotContext;
  enableAffiliates?: boolean;
}

export default function AffiliateSlot({
  exchange,
  context = "stock-file",
  enableAffiliates = false,
}: AffiliateSlotProps) {
  if (!enableAffiliates) return null;

  const provider = pickProvider(exchange);

  const label =
    context === "stock-file"
      ? `Buy this stock on ${provider.name} →`
      : context === "top-list"
      ? `Invest in these stocks on ${provider.name} →`
      : `Start investing on ${provider.name} →`;

  return (
    <div className="rounded-xl border border-accent-500/20 bg-accent-500/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">
        Ready to invest?
      </p>
      <p className="mt-1 text-sm text-ash-300">{provider.description}</p>
      <Link
        href={provider.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-accent-400"
      >
        {label}
      </Link>
      <p className="mt-2 text-[10px] text-ash-600">
        Affiliate link — AlphaBeat may earn a commission at no cost to you.
        Editorial content is always independent.
      </p>
    </div>
  );
}
