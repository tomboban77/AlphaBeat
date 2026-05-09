import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { Insight } from "@/lib/types";
import { urlFor } from "@/lib/sanity/image";
import { cn, formatDate } from "@/lib/utils";
import SectorBadge from "@/components/sectors/SectorBadge";

const KIND_LABEL: Record<string, string> = {
  analysis: "Analysis",
  news: "News",
  earnings: "Earnings",
  macro: "Macro",
  explainer: "Explainer",
  opinion: "Opinion",
};

interface InsightCardProps {
  insight: Insight;
  variant?: "default" | "compact" | "feature";
  className?: string;
}

export default function InsightCard({
  insight,
  variant = "default",
  className,
}: InsightCardProps) {
  const isFeature = variant === "feature";
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-ink-600/80 bg-ink-800/60 transition-all hover:border-ink-500 hover:bg-ink-800",
        isFeature && "lg:flex-row",
        className
      )}
    >
      <Link
        href={`/insights/${insight.slug.current}`}
        className="absolute inset-0 z-10"
        aria-label={insight.title}
      />
      {insight.mainImage?.asset ? (
        <div
          className={cn(
            "relative aspect-[16/9] overflow-hidden",
            isFeature && "lg:aspect-auto lg:w-1/2"
          )}
        >
          <Image
            src={urlFor(insight.mainImage).width(800).height(450).url()}
            alt={insight.mainImage.alt || insight.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={isFeature ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        </div>
      ) : (
        <div
          className={cn(
            "relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-ink-700 via-ink-800 to-accent-900",
            isFeature && "lg:aspect-auto lg:w-1/2"
          )}
        >
          <div className="text-4xl font-black tracking-tighter text-accent-400/60">
            α
          </div>
        </div>
      )}
      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-5",
          isFeature && "lg:p-8"
        )}
      >
        <div className="flex items-center gap-2 text-xs">
          {insight.kind && (
            <span className="rounded-full bg-ink-700 px-2 py-0.5 font-semibold uppercase tracking-wider text-ash-300">
              {KIND_LABEL[insight.kind] || insight.kind}
            </span>
          )}
          {insight.sector && (
            <div>
              <SectorBadge sector={insight.sector} asLink={false} />
            </div>
          )}
        </div>
        <h3
          className={cn(
            "font-semibold leading-tight text-ash-50 group-hover:text-ash-50",
            isFeature ? "text-2xl" : "text-base"
          )}
        >
          {insight.title}
        </h3>
        {insight.excerpt && (
          <p
            className={cn(
              "line-clamp-2 text-sm leading-relaxed text-ash-300",
              isFeature && "text-base"
            )}
          >
            {insight.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center gap-3 text-xs text-ash-500">
          {insight.author?.name && (
            <span className="font-medium text-ash-400">
              {insight.author.name}
            </span>
          )}
          {insight.publishedAt && (
            <time dateTime={insight.publishedAt}>
              {formatDate(insight.publishedAt)}
            </time>
          )}
          {insight.readingTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {insight.readingTime} min
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
