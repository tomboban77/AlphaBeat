"use client";

import { useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CandlePoint } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

const RANGES = ["1D", "1W", "1M", "6M", "1Y", "5Y"] as const;
type Range = (typeof RANGES)[number];

export interface StockChartInnerProps {
  symbol: string;
  initialRange?: Range;
  initialCandles?: CandlePoint[];
  currency?: string;
  className?: string;
}

interface ChartDatum {
  t: number;
  date: string;
  c: number;
}

export default function StockChartInner({
  symbol,
  initialRange = "1M",
  initialCandles = [],
  currency = "USD",
  className,
}: StockChartInnerProps) {
  const [range, setRange] = useState<Range>(initialRange);
  const [cache, setCache] = useState<Partial<Record<Range, CandlePoint[]>>>(
    () => ({ [initialRange]: initialCandles })
  );
  const [isPending, startTransition] = useTransition();

  const candles = cache[range] ?? [];

  const handleRange = (next: Range) => {
    setRange(next);
    if (cache[next]) return;
    startTransition(() => {
      fetch(`/api/candles?symbol=${encodeURIComponent(symbol)}&range=${next}`)
        .then((r) => r.json())
        .then((data: { candles?: CandlePoint[] }) => {
          setCache((prev) => ({ ...prev, [next]: data.candles || [] }));
        })
        .catch(() => {
          setCache((prev) => ({ ...prev, [next]: [] }));
        });
    });
  };

  const data: ChartDatum[] = candles.map((c) => ({
    t: c.t,
    date: new Date(c.t * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: range === "5Y" ? "2-digit" : undefined,
    }),
    c: c.c,
  }));

  const first = data[0]?.c ?? 0;
  const last = data[data.length - 1]?.c ?? 0;
  const isUp = last >= first;
  const stroke = isUp ? "var(--color-up-400)" : "var(--color-down-400)";
  const fill = isUp ? "var(--color-up-500)" : "var(--color-down-500)";

  return (
    <div className={cn("relative", className)}>
      <div className="mb-3 flex items-center justify-end gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => handleRange(r)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors",
              range === r
                ? "bg-accent-500 text-ink-950"
                : "text-ash-400 hover:bg-ink-700 hover:text-ash-100"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "h-[280px] w-full overflow-hidden rounded-xl border border-ink-700 bg-ink-900/40 p-3 transition-opacity sm:h-[360px]",
          isPending && "opacity-60"
        )}
      >
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fill} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink-700)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--color-ash-500)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={32}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "var(--color-ash-500)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) => formatPrice(v, currency).replace(/[$C]+/, "")}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-ink-500)", strokeDasharray: "4 4" }}
                contentStyle={{
                  background: "var(--color-ink-800)",
                  border: "1px solid var(--color-ink-600)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--color-ash-100)",
                }}
                labelStyle={{ color: "var(--color-ash-400)" }}
                formatter={(value) => {
                  const n = typeof value === "number" ? value : Number(value);
                  return [formatPrice(n, currency), "Price"];
                }}
              />
              <Area
                type="monotone"
                dataKey="c"
                stroke={stroke}
                strokeWidth={2}
                fill={`url(#grad-${symbol})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ash-500">
            No chart data for {range}
          </div>
        )}
      </div>
    </div>
  );
}
