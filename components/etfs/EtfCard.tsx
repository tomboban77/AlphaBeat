import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";
import type { EtfEntry, MarketQuote } from "@/lib/types";
import { urlFor } from "@/lib/sanity/image";
import { cn, formatPercent, formatPrice } from "@/lib/utils";

const TAG_LABELS: Record<string, string> = {
  "us-broad": "US broad",
  "us-tech": "US tech",
  "us-dividend": "US dividend",
  canada: "Canada",
  global: "Global",
  emerging: "Emerging mkts",
  bonds: "Bonds",
  thematic: "Thematic",
  commodities: "Commodities",
  other: "Other",
};

interface EtfCardProps {
  etf: EtfEntry;
  quote?: MarketQuote;
  variant?: "default" | "compact";
  className?: string;
}

export default function EtfCard({ etf, quote, variant = "default", className }: EtfCardProps) {
  const tag = etf.categoryTag ? TAG_LABELS[etf.categoryTag] || etf.categoryTag : null;
  const tone =
    !quote ? "flat" :
    quote.changePercent > 0 ? "up" :
    quote.changePercent < 0 ? "down" : "flat";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-ink-600/80 bg-ink-800/60 p-5 backdrop-blur transition-all hover:border-ink-500 hover:bg-ink-800",
        className
      )}
    >
      <Link
        href={`/etfs/${etf.slug.current}`}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={etf.title}
      />

      <header className="relative z-20 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-700 text-ash-200">
          {etf.logo?.asset ? (
            <Image
              src={urlFor(etf.logo).width(80).height(80).url()}
              alt=""
              width={40}
              height={40}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <Layers className="h-5 w-5 text-accent-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {etf.primaryTicker && (
              <span className="font-mono text-xs font-bold tracking-tight text-ash-50">
                {etf.primaryTicker.replace(/\.TO$/, "")}
              </span>
            )}
            {tag && (
              <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-300 ring-1 ring-inset ring-accent-500/30">
                {tag}
              </span>
            )}
          </div>
          <h3 className="mt-0.5 truncate text-sm font-semibold text-ash-100 group-hover:text-ash-50">
            {etf.title}
          </h3>
        </div>
      </header>

      {variant !== "compact" && etf.headline && (
        <p className="relative z-20 mt-3 line-clamp-2 text-sm leading-relaxed text-ash-300">
          {etf.headline}
        </p>
      )}

      {etf.tracksIndexName && (
        <p className="relative z-20 mt-2 text-xs font-medium text-ash-400">
          Tracks <span className="text-ash-200">{etf.tracksIndexName}</span>
        </p>
      )}

      <footer className="relative z-20 mt-4 grid grid-cols-3 gap-2 border-t border-ink-700 pt-3 text-xs">
        <div>
          <div className="text-ash-500">Price</div>
          <div className="mt-0.5 font-semibold tabular-nums text-ash-100">
            {quote ? formatPrice(quote.price, quote.currency) : "—"}
          </div>
        </div>
        <div>
          <div className="text-ash-500">Change</div>
          <div
            className={cn(
              "mt-0.5 font-semibold tabular-nums",
              tone === "up" && "text-up-400",
              tone === "down" && "text-down-400",
              tone === "flat" && "text-ash-300"
            )}
          >
            {quote ? formatPercent(quote.changePercent) : "—"}
          </div>
        </div>
        <div>
          <div className="text-ash-500">MER</div>
          <div className="mt-0.5 font-semibold tabular-nums text-ash-100">
            {etf.merPercent != null ? `${etf.merPercent}%` : "—"}
          </div>
        </div>
      </footer>
    </article>
  );
}
