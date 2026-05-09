import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Sector } from "@/lib/types";
import SectorIcon, { ACCENT_BORDER, ACCENT_RING } from "./SectorIcon";
import { cn } from "@/lib/utils";

interface SectorTileProps {
  sector: Sector;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export default function SectorTile({ sector, count, size = "md", className }: SectorTileProps) {
  const accent = sector.accent || "cyan";
  return (
    <Link
      href={`/sectors/${sector.slug.current}`}
      className={cn(
        "group flex h-full flex-col gap-3 overflow-hidden rounded-2xl border bg-ink-800/60 p-5 transition-all hover:bg-ink-800",
        ACCENT_BORDER[accent] || ACCENT_BORDER.cyan,
        size === "sm" ? "p-4" : "p-5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset",
            ACCENT_RING[accent] || ACCENT_RING.cyan
          )}
        >
          <SectorIcon
            icon={sector.icon}
            className="h-5 w-5"
          />
        </div>
        <ArrowUpRight className="h-4 w-4 text-ash-500 transition-colors group-hover:text-ash-200" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-ash-50">{sector.title}</h3>
        {sector.tagline && (
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-ash-400">
            {sector.tagline}
          </p>
        )}
      </div>
      {count != null && (
        <div className="mt-2 text-xs font-medium text-ash-500">
          {count} {count === 1 ? "stock" : "stocks"} tracked
        </div>
      )}
    </Link>
  );
}
