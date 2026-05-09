import Image from "next/image";
import { Info } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { Sponsorship } from "@/lib/types";

interface SponsoredRibbonProps {
  sponsorship: Sponsorship;
  ticker?: string;
}

export default function SponsoredRibbon({ sponsorship, ticker }: SponsoredRibbonProps) {
  const hasLogo = !!sponsorship.sponsorLogo?.asset;
  return (
    <aside
      className="rounded-xl border border-warn-500/40 bg-warn-500/5 p-4 text-sm"
      aria-label="Sponsored placement disclosure"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {hasLogo ? (
            <Image
              src={urlFor(sponsorship.sponsorLogo!).width(80).height(80).url()}
              alt={`${sponsorship.sponsorName} logo`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-contain bg-ink-900 p-1"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warn-500/20 text-warn-300">
              <Info className="h-5 w-5" />
            </div>
          )}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-warn-300">
              Sponsored {ticker ? `· ${ticker}` : ""}
            </div>
            <div className="mt-0.5 font-semibold text-ash-100">
              Brought to you by {sponsorship.sponsorName}
            </div>
            <p className="mt-1.5 max-w-prose text-xs leading-relaxed text-ash-300">
              {sponsorship.disclosure ||
                "This placement is sponsored. AlphaBeat has been compensated for this listing. It is not investment advice or an endorsement."}
            </p>
          </div>
        </div>
        {sponsorship.ctaUrl && (
          <a
            href={sponsorship.ctaUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-warn-500 px-4 text-xs font-semibold text-ink-950 transition-colors hover:bg-warn-300"
          >
            {sponsorship.ctaLabel || "Learn more"}
          </a>
        )}
      </div>
    </aside>
  );
}
