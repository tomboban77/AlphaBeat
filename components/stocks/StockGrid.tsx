import StockCard from "./StockCard";
import { getCandles, getQuotes } from "@/lib/market/finnhub";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";
import type { Stock } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StockGridProps {
  stocks: Stock[];
  withSparklines?: boolean;
  variant?: "default" | "compact" | "spotlight";
  rankFromIndex?: boolean;
  className?: string;
  cols?: 2 | 3 | 4;
}

/**
 * Server component. Batch-fetches quotes (and optionally sparklines) for all stocks
 * in one go and renders cards. Cached at the Finnhub layer (60s for quotes, 1h for candles).
 */
export default async function StockGrid({
  stocks,
  withSparklines = false,
  variant = "default",
  rankFromIndex = false,
  className,
  cols = 3,
}: StockGridProps) {
  if (!stocks.length) return null;

  const symbols = stocks.map((s) => s.ticker);
  const quoteMap = await getQuotes(symbols);

  let sparkMap: Map<string, Awaited<ReturnType<typeof getCandles>>> = new Map();
  if (withSparklines) {
    const sparks = await Promise.all(
      symbols.map(async (sym) => [sym, await getCandles(sym, "1M")] as const)
    );
    sparkMap = new Map(
      sparks.map(([sym, candles]) => [normalizeFinnhubSymbol(sym), candles])
    );
  }

  const colsClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[cols];

  return (
    <div className={cn("grid grid-cols-1 gap-4", colsClass, className)}>
      {stocks.map((stock, idx) => {
        const sym = normalizeFinnhubSymbol(stock.ticker);
        return (
          <StockCard
            key={stock._id}
            stock={stock}
            quote={quoteMap.get(sym)}
            spark={sparkMap.get(sym)}
            variant={variant}
            rank={rankFromIndex ? idx + 1 : undefined}
          />
        );
      })}
    </div>
  );
}
