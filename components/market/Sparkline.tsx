import type { CandlePoint } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SparklineProps {
  candles: CandlePoint[];
  width?: number;
  height?: number;
  className?: string;
  positive?: boolean;
}

/**
 * Tiny inline SVG sparkline — no client JS required, used in stock cards.
 * Color is driven by `positive` (green up / red down).
 */
export default function Sparkline({
  candles,
  width = 120,
  height = 40,
  className,
  positive,
}: SparklineProps) {
  if (!candles || candles.length < 2) {
    return (
      <svg width={width} height={height} className={className} aria-hidden="true">
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2 3"
          className="text-ink-600"
        />
      </svg>
    );
  }

  const values = candles.map((c) => c.c);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values
    .map((v, i) => `${(i * stepX).toFixed(2)},${(height - ((v - min) / range) * height).toFixed(2)}`)
    .join(" ");

  const isUp =
    positive !== undefined ? positive : values[values.length - 1] >= values[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn(className)}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={isUp ? "var(--color-up-400)" : "var(--color-down-400)"}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
