import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowDownRight, Gem, AlertTriangle } from "lucide-react";
import type { Stock, MarketQuote, CandlePoint } from "@/lib/types";
import { urlFor } from "@/lib/sanity/image";
import {
  cn,
  displayTicker,
  formatPercent,
  formatPrice,
  RISK_CLASSES,
  RISK_LABEL,
  type RiskTone,
} from "@/lib/utils";
import SectorBadge from "@/components/sectors/SectorBadge";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import Sparkline from "@/components/market/Sparkline";

interface HiddenGemCardProps {
  stock: Stock;
  quote?: MarketQuote;
  spark?: CandlePoint[];
  className?: string;
}

const PRICE_CEILING = 25; // soft alert if live price exceeds this

export default function HiddenGemCard({
  stock,
  quote,
  spark,
  className,
}: HiddenGemCardProps) {
  const tone =
    !quote
      ? "flat"
      : quote.changePercent > 0
      ? "up"
      : quote.changePercent < 0
      ? "down"
      : "flat";

  const risk = (stock.riskScore || "high") as RiskTone;
  const overThreshold = quote && quote.price > PRICE_CEILING;
  const pickedDelta =
    quote && stock.pickedPrice
      ? ((quote.price - stock.pickedPrice) / stock.pickedPrice) * 100
      : null;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-ink-800/80 via-ink-900 to-violet-950/30 p-5 transition-all hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-500/10",
        className
      )}
    >
      <Link
        href={`/stocks/${stock.slug.current}`}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`${stock.ticker} ${stock.name}`}
      />

      <div className="relative z-20 mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-violet-900/40">
          <Gem className="h-3 w-3" />
          Hidden Gem
        </span>
        {stock.pickedAt && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-ash-500">
            picked {formatPickedDate(stock.pickedAt)}
          </span>
        )}
      </div>

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
            <span className="truncate text-xs text-ash-400">{stock.exchange}</span>
          </div>
          <p className="truncate text-sm text-ash-300 group-hover:text-ash-100">
            {stock.name}
          </p>
        </div>
        <div className="relative z-30 -mr-1 -mt-1">
          <WatchlistButton symbol={stock.ticker} />
        </div>
      </header>

      {stock.headline && (
        <p className="relative z-20 mt-3 line-clamp-3 text-sm leading-relaxed text-ash-200">
          {stock.headline}
        </p>
      )}

      <div className="relative z-20 mt-4 flex items-end justify-between gap-3">
        <div className="space-y-0.5">
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

      {(stock.pickedPrice || pickedDelta != null) && (
        <div className="relative z-20 mt-3 flex items-baseline justify-between rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2 text-xs">
          <span className="text-ash-500">
            Picked at{" "}
            <span className="font-semibold tabular-nums text-ash-200">
              {formatPrice(stock.pickedPrice, currencyForExchange(stock.exchange))}
            </span>
          </span>
          {pickedDelta != null && (
            <span
              className={cn(
                "font-semibold tabular-nums",
                pickedDelta > 0 ? "text-up-400" : pickedDelta < 0 ? "text-down-400" : "text-ash-400"
              )}
            >
              {pickedDelta > 0 ? "+" : ""}
              {pickedDelta.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {overThreshold && (
        <div className="relative z-20 mt-2 inline-flex items-center gap-1.5 rounded-md border border-warn-500/40 bg-warn-500/10 px-2 py-1 text-[11px] text-warn-200">
          <AlertTriangle className="h-3 w-3" />
          Trading above the $20 threshold today.
        </div>
      )}

      <footer className="relative z-20 mt-4 flex items-center justify-between gap-2 border-t border-ink-700 pt-3">
        {stock.sector ? (
          <div className="min-w-0">
            <SectorBadge sector={stock.sector} asLink={false} />
          </div>
        ) : (
          <span />
        )}
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
            RISK_CLASSES[risk]
          )}
        >
          {RISK_LABEL[risk]}
        </span>
      </footer>
    </article>
  );
}

function currencyForExchange(exchange?: string) {
  if (exchange === "TSX" || exchange === "TSXV") return "CAD";
  return "USD";
}

function formatPickedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
