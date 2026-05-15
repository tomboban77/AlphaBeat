"use client";

import { Star } from "lucide-react";
import { useWatchlist, useWatchlistActions } from "@/lib/watchlist";
import { cn } from "@/lib/utils";
import { trackWatchlistAdd } from "@/lib/analytics";

interface WatchlistButtonProps {
  symbol: string;
  variant?: "icon" | "pill";
  className?: string;
  ariaLabel?: string;
}

export default function WatchlistButton({
  symbol,
  variant = "icon",
  className,
  ariaLabel,
}: WatchlistButtonProps) {
  const list = useWatchlist();
  const { toggle } = useWatchlistActions();
  const active = list.includes(symbol.toUpperCase());

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(symbol);
    if (added) trackWatchlistAdd(symbol);
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-pressed={active}
        aria-label={ariaLabel || (active ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          active
            ? "border-accent-500 bg-accent-500/10 text-accent-300 hover:bg-accent-500/20"
            : "border-ink-600 bg-ink-800 text-ash-300 hover:border-ink-500 hover:text-ash-100",
          className
        )}
      >
        <Star className={cn("h-3.5 w-3.5", active && "fill-accent-400 text-accent-400")} />
        {active ? "Watching" : "Watch"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={active}
      aria-label={ariaLabel || (active ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`)}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        active
          ? "text-accent-400 hover:bg-accent-500/10"
          : "text-ash-500 hover:bg-ink-700 hover:text-ash-200",
        className
      )}
    >
      <Star className={cn("h-4 w-4", active && "fill-accent-400")} />
    </button>
  );
}
