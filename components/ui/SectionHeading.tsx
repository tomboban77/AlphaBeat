import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "View all",
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col",
        className
      )}
    >
      <div>
        {eyebrow && (
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ash-300 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-sm font-semibold text-accent-300 transition-colors hover:text-accent-200"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
