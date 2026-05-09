import EtfCard from "./EtfCard";
import { getQuotes } from "@/lib/market/finnhub";
import { normalizeFinnhubSymbol } from "@/lib/market/symbols";
import type { EtfEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EtfGridProps {
  etfs: EtfEntry[];
  cols?: 2 | 3 | 4;
  className?: string;
}

export default async function EtfGrid({ etfs, cols = 3, className }: EtfGridProps) {
  if (!etfs.length) return null;

  const symbols = etfs.map((e) => e.primaryTicker).filter((s): s is string => Boolean(s));
  const quoteMap = symbols.length ? await getQuotes(symbols) : new Map();

  const colsClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[cols];

  return (
    <div className={cn("grid grid-cols-1 gap-4", colsClass, className)}>
      {etfs.map((etf) => {
        const sym = etf.primaryTicker ? normalizeFinnhubSymbol(etf.primaryTicker) : null;
        return (
          <EtfCard
            key={etf._id}
            etf={etf}
            quote={sym ? quoteMap.get(sym) : undefined}
          />
        );
      })}
    </div>
  );
}
