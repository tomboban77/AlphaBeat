import Link from "next/link";
import Image from "next/image";
import { Crown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Stock, MarketQuote, CandlePoint } from "@/lib/types";
import { urlFor } from "@/lib/sanity/image";
import { cn, displayTicker, formatPercent, formatPrice } from "@/lib/utils";
import SectorBadge from "@/components/sectors/SectorBadge";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import Sparkline from "@/components/market/Sparkline";

interface StockCardProps {
  stock: Stock;
  quote?: MarketQuote;
  spark?: CandlePoint[];
  variant?: "default" | "compact" | "spotlight";
  rank?: number;
  className?: string;
}

export default function StockCard({
  stock,
  quote,
  spark,
  variant = "default",
  rank,
  className,
}: StockCardProps) {
  const tone =
    !quote ? "flat" :
    quote.changePercent > 0 ? "up" :
    quote.changePercent < 0 ? "down" : "flat";

  const sponsored = stock.sponsored && stock.sponsorship;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-ink-800/60 p-5 backdrop-blur transition-all",
        sponsored
          ? "border-warn-500/40 hover:border-warn-500/70 hover:bg-ink-800"
          : "border-ink-600/80 hover:border-ink-500 hover:bg-ink-800",
        variant === "spotlight" && "ab-glow",
        className
      )}
    >
      {sponsored && (
        <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-warn-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warn-300 ring-1 ring-inset ring-warn-500/30">
          <Crown className="h-3 w-3" />
          Sponsored
        </span>
      )}

      {rank != null && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold tabular-nums text-ink-950">
          #{rank}
        </span>
      )}

      <Link
        href={`/stocks/${stock.slug.current}`}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`${stock.ticker} ${stock.name}`}
      />

      <header className="relative z-20 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-700 text-sm font-bold text-ash-200">
          {stock.logo?.asset ? (
            <Image
              src={urlFor(stock.logo).width(80).height(80).url()}
              alt={`${stock.name} logo`}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{displayTicker(stock.ticker).slice(0, 2)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate font-mono text-sm font-bold tracking-tight text-ash-50">
              {displayTicker(stock.ticker)}
            </h3>
            <span className="truncate text-xs text-ash-400">
              {stock.exchange}
            </span>
          </div>
          <p className="truncate text-sm text-ash-300 group-hover:text-ash-100">
            {stock.name}
          </p>
        </div>
        <div className="relative z-30 -mr-1 -mt-1">
          <WatchlistButton symbol={stock.ticker} />
        </div>
      </header>

      {variant !== "compact" && stock.headline && (
        <p className="relative z-20 mt-3 line-clamp-2 text-sm leading-relaxed text-ash-200">
          {stock.headline}
        </p>
      )}

      <div className="relative z-20 mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="font-semibold tabular-nums text-ash-50">
            {quote ? formatPrice(quote.price, quote.currency) : "—"}
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
              tone === "up" && "text-up-400",
              tone === "down" && "text-down-400",
              tone === "flat" && "text-ash-500"
            )}
          >
            {tone === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : tone === "down" ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : null}
            {quote ? formatPercent(quote.changePercent) : "—"}
            {quote?.stale && (
              <span className="ml-1 rounded bg-warn-500/20 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-warn-300">
                sample
              </span>
            )}
          </div>
        </div>
        <Sparkline candles={spark || []} positive={tone === "up"} />
      </div>

      {variant !== "compact" && (
        <footer className="relative z-20 mt-4 flex items-center justify-between border-t border-ink-700 pt-3">
          {stock.sector ? (
            <div>
              <SectorBadge sector={stock.sector} asLink={false} />
            </div>
          ) : (
            <span />
          )}
          {stock.industry && (
            <span className="truncate text-xs text-ash-500">
              {stock.industry}
            </span>
          )}
        </footer>
      )}
    </article>
  );
}
