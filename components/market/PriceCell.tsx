import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatPercent, formatPrice } from "@/lib/utils";
import type { MarketQuote } from "@/lib/types";

interface PriceCellProps {
  quote?: MarketQuote;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  showStaleBadge?: boolean;
  className?: string;
}

export default function PriceCell({
  quote,
  size = "md",
  align = "left",
  showStaleBadge = false,
  className,
}: PriceCellProps) {
  if (!quote) {
    return (
      <div className={cn("text-ash-500", className)}>
        <div className="text-sm tabular-nums">—</div>
      </div>
    );
  }

  const tone =
    quote.changePercent > 0 ? "up" : quote.changePercent < 0 ? "down" : "flat";

  const sizes = {
    sm: { price: "text-sm", change: "text-xs" },
    md: { price: "text-lg", change: "text-sm" },
    lg: { price: "text-3xl", change: "text-base" },
  }[size];

  return (
    <div
      className={cn(
        "leading-tight",
        align === "right" && "text-right",
        className
      )}
    >
      <div className={cn("font-semibold tabular-nums text-ash-50", sizes.price)}>
        {formatPrice(quote.price, quote.currency)}
      </div>
      <div
        className={cn(
          "inline-flex items-center gap-1 font-medium tabular-nums",
          sizes.change,
          tone === "up" && "text-up-400",
          tone === "down" && "text-down-400",
          tone === "flat" && "text-ash-500"
        )}
      >
        {tone === "up" ? (
          <ArrowUpRight className="h-3.5 w-3.5" />
        ) : tone === "down" ? (
          <ArrowDownRight className="h-3.5 w-3.5" />
        ) : (
          <Minus className="h-3.5 w-3.5" />
        )}
        <span>{formatPercent(quote.changePercent)}</span>
        {showStaleBadge && quote.stale && (
          <span className="ml-1 rounded bg-warn-500/20 px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warn-300">
            Sample
          </span>
        )}
      </div>
    </div>
  );
}
