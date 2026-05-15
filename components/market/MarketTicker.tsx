import { client } from "@/lib/sanity/client";
import { tickerSymbolsQuery } from "@/lib/sanity/queries";
import { getQuotes } from "@/lib/market/finnhub";
import { displayLabel } from "@/lib/market/symbols";
import { formatPercent, formatPrice } from "@/lib/utils";

const FALLBACK_SYMBOLS = [
  "^GSPTSE",
  "^GSPC",
  "RY.TO",
  "SHOP.TO",
  "ENB.TO",
  "CNQ.TO",
  "TD.TO",
  "BNS.TO",
  "OTEX.TO",
  "WCN.TO",
];

/**
 * Top-of-page scrolling ticker. Server-rendered, server-cached (60s on quote).
 * Designed to never block: symbol fetch is best-effort with a fallback list.
 */
export default async function MarketTicker() {
  const symbols = await client
    .fetch<string[] | null>(tickerSymbolsQuery)
    .catch(() => null);
  const list = symbols && symbols.length > 0 ? symbols : FALLBACK_SYMBOLS;
  const quoteMap = await getQuotes(list);

  const items = list
    .map((sym) => {
      const q = quoteMap.get(sym);
      if (!q) return null;
      return { sym, ...q };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (items.length === 0) return null;

  // Render twice for seamless infinite-scroll loop
  const rendered = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden border-b border-ink-700 bg-ink-900"
      role="marquee"
      aria-label="Market overview"
    >
      <div className="ab-marquee-track flex w-max gap-8 py-2">
        {rendered.map((item, idx) => {
          const tone =
            item.changePercent > 0 ? "up" : item.changePercent < 0 ? "down" : "flat";
          return (
            <span
              key={`${item.sym}-${idx}`}
              className="inline-flex shrink-0 items-center gap-2 px-2 text-xs font-medium tabular-nums"
            >
              <span className="text-ash-300">{displayLabel(item.sym)}</span>
              <span className="text-ash-100">{formatPrice(item.price, item.currency)}</span>
              <span
                className={
                  tone === "up"
                    ? "text-up-400"
                    : tone === "down"
                    ? "text-down-400"
                    : "text-ash-500"
                }
              >
                {formatPercent(item.changePercent)}
              </span>
              <span className="text-ink-600">·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
