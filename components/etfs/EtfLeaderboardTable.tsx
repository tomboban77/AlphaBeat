import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, Layers } from "lucide-react";
import type { EtfEntry, MarketQuote } from "@/lib/types";
import { urlFor } from "@/lib/sanity/image";
import { cn, formatPercent, formatPrice } from "@/lib/utils";

interface EtfLeaderboardTableProps {
  etfs: EtfEntry[];
  quotes: Record<string, MarketQuote>;
  /** Default column we sort/visually emphasize. */
  emphasizedReturn?: "return1Y" | "returnYTD" | "return3Y" | "return5Y";
  className?: string;
}

const RETURN_LABEL: Record<string, string> = {
  returnYTD: "YTD",
  return1Y: "1Y",
  return3Y: "3Y ann.",
  return5Y: "5Y ann.",
};

export default function EtfLeaderboardTable({
  etfs,
  quotes,
  emphasizedReturn = "return1Y",
  className,
}: EtfLeaderboardTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/40",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-900/60 text-[10px] font-semibold uppercase tracking-wider text-ash-500">
            <tr>
              <th scope="col" className="w-10 py-3 pl-4 pr-2 text-left">
                #
              </th>
              <th scope="col" className="py-3 pr-3 text-left">
                ETF
              </th>
              <th scope="col" className="hidden py-3 pr-3 text-right md:table-cell">
                Price
              </th>
              <th scope="col" className="py-3 pr-3 text-right">
                {RETURN_LABEL.returnYTD}
              </th>
              <th
                scope="col"
                className={cn(
                  "py-3 pr-3 text-right",
                  emphasizedReturn === "return1Y" && "text-accent-300"
                )}
              >
                {RETURN_LABEL.return1Y}
              </th>
              <th scope="col" className="hidden py-3 pr-3 text-right sm:table-cell">
                {RETURN_LABEL.return3Y}
              </th>
              <th scope="col" className="hidden py-3 pr-3 text-right lg:table-cell">
                {RETURN_LABEL.return5Y}
              </th>
              <th scope="col" className="hidden py-3 pr-4 text-right md:table-cell">
                MER
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {etfs.map((etf, idx) => {
              const sym = etf.primaryTicker || "";
              const quote = sym ? quotes[sym] : undefined;
              const dayTone =
                !quote
                  ? "flat"
                  : quote.changePercent > 0
                  ? "up"
                  : quote.changePercent < 0
                  ? "down"
                  : "flat";
              return (
                <tr
                  key={etf._id}
                  className="group relative transition-colors hover:bg-ink-800/80"
                >
                  <td className="py-3 pl-4 pr-2 align-middle">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-bold tabular-nums",
                        idx === 0 && "bg-accent-500/20 text-accent-200 ring-1 ring-accent-500/40",
                        idx > 0 && idx < 3 && "bg-ink-700/80 text-ash-100",
                        idx >= 3 && "bg-ink-900 text-ash-400"
                      )}
                    >
                      {idx + 1}
                    </span>
                  </td>

                  <td className="py-3 pr-3 align-middle">
                    <Link
                      href={`/etfs/${etf.slug.current}`}
                      className="flex items-center gap-3 outline-none focus-visible:underline"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink-700">
                        {etf.logo?.asset ? (
                          <Image
                            src={urlFor(etf.logo).width(72).height(72).url()}
                            alt=""
                            width={36}
                            height={36}
                            className="h-full w-full rounded-md object-cover"
                          />
                        ) : (
                          <Layers className="h-4 w-4 text-accent-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {etf.primaryTicker && (
                            <span className="font-mono text-xs font-bold text-ash-50">
                              {etf.primaryTicker.replace(/\.TO$/, "")}
                            </span>
                          )}
                          {etf.tracksIndexName && (
                            <span className="hidden truncate text-[10px] font-medium uppercase tracking-wider text-ash-500 md:inline">
                              · {etf.tracksIndexName}
                            </span>
                          )}
                        </div>
                        <div className="line-clamp-1 text-[13px] font-semibold text-ash-100 group-hover:text-ash-50">
                          {etf.title}
                        </div>
                      </div>
                    </Link>
                  </td>

                  <td className="hidden py-3 pr-3 text-right align-middle md:table-cell">
                    <div className="font-mono text-xs font-semibold tabular-nums text-ash-100">
                      {quote ? formatPrice(quote.price, quote.currency) : "—"}
                    </div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-0.5 text-[10px] font-medium tabular-nums",
                        dayTone === "up" && "text-up-400",
                        dayTone === "down" && "text-down-400",
                        dayTone === "flat" && "text-ash-500"
                      )}
                    >
                      {dayTone === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : dayTone === "down" ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : null}
                      {quote ? formatPercent(quote.changePercent) : "—"}
                    </div>
                  </td>

                  <ReturnCell value={etf.returnYTD} />
                  <ReturnCell value={etf.return1Y} emphasized={emphasizedReturn === "return1Y"} />
                  <ReturnCell value={etf.return3Y} className="hidden sm:table-cell" />
                  <ReturnCell value={etf.return5Y} className="hidden lg:table-cell" />

                  <td className="hidden py-3 pr-4 text-right align-middle md:table-cell">
                    <span className="font-mono text-xs tabular-nums text-ash-200">
                      {etf.merPercent != null ? `${etf.merPercent.toFixed(2)}%` : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReturnCell({
  value,
  emphasized,
  className,
}: {
  value?: number;
  emphasized?: boolean;
  className?: string;
}) {
  const positive = (value ?? 0) > 0;
  const negative = (value ?? 0) < 0;
  return (
    <td className={cn("py-3 pr-3 text-right align-middle", className)}>
      <span
        className={cn(
          "font-mono text-sm tabular-nums",
          emphasized && "font-bold",
          value == null && "text-ash-500",
          positive && "text-up-400",
          negative && "text-down-400"
        )}
      >
        {value == null ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
      </span>
    </td>
  );
}
