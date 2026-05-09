"use client";

import dynamic from "next/dynamic";
import type { CandlePoint } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StockChartProps {
  symbol: string;
  initialRange?: "1D" | "1W" | "1M" | "6M" | "1Y" | "5Y";
  initialCandles?: CandlePoint[];
  currency?: string;
  className?: string;
}

/**
 * Public chart wrapper. Defers Recharts to client-only render so we don't
 * hit ResponsiveContainer's "width(-1) height(-1)" warning during SSR /
 * static prerender.
 */
const StockChartInner = dynamic(() => import("./StockChartInner"), {
  ssr: false,
  loading: () => (
    <ChartSkeleton />
  ),
});

export default function StockChart(props: StockChartProps) {
  return <StockChartInner {...props} />;
}

function ChartSkeleton({ className }: { className?: string } = {}) {
  return (
    <div className={cn("relative", className)}>
      <div className="mb-3 flex items-center justify-end gap-1">
        {["1D", "1W", "1M", "6M", "1Y", "5Y"].map((r) => (
          <div
            key={r}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-ash-500"
          >
            {r}
          </div>
        ))}
      </div>
      <div className="h-[280px] w-full animate-pulse rounded-xl border border-ink-700 bg-ink-900/40 sm:h-[360px]" />
    </div>
  );
}
