import Link from "next/link";
import SectorIcon, { ACCENT_RING } from "./SectorIcon";
import { cn } from "@/lib/utils";
import type { Sector } from "@/lib/types";

interface SectorBadgeProps {
  sector: Pick<Sector, "title" | "slug" | "accent" | "icon">;
  size?: "sm" | "md";
  asLink?: boolean;
  className?: string;
}

export default function SectorBadge({
  sector,
  size = "sm",
  asLink = true,
  className,
}: SectorBadgeProps) {
  const accent = sector.accent || "cyan";
  const sizeCls =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset",
        ACCENT_RING[accent] || ACCENT_RING.cyan,
        sizeCls,
        className
      )}
    >
      <SectorIcon
        icon={sector.icon}
        className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
      />
      {sector.title}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link href={`/sectors/${sector.slug.current}`} className="inline-block">
      {content}
    </Link>
  );
}
