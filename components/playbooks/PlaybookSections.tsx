"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PortableProse from "@/components/portable/PortableProse";
import { trackPlaybookSectionExpand } from "@/lib/analytics";
import type { PlaybookSection, StockFile } from "@/lib/types";

interface Props {
  sections: PlaybookSection[];
  slug: string;
}

export default function PlaybookSections({ sections, slug }: Props) {
  const [open, setOpen] = useState<Set<number>>(new Set([0])); // first section open by default

  function toggle(i: number, heading: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
        trackPlaybookSectionExpand(slug, heading);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {sections.map((sec, i) => {
        const isOpen = open.has(i);
        return (
          <section key={sec._key ?? i} className="rounded-2xl border border-ink-700 bg-ink-800/40">
            <button
              type="button"
              onClick={() => toggle(i, sec.heading)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
            >
              <h2 className="text-lg font-bold text-ash-50">{sec.heading}</h2>
              {isOpen
                ? <ChevronUp className="h-5 w-5 shrink-0 text-ash-400" aria-hidden />
                : <ChevronDown className="h-5 w-5 shrink-0 text-ash-400" aria-hidden />
              }
            </button>

            {isOpen && (
              <div className="border-t border-ink-700 px-6 pb-6 pt-4">
                {sec.body && sec.body.length > 0 && (
                  <PortableProse value={sec.body} size="md" />
                )}
                {sec.relatedStocks && sec.relatedStocks.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
                      Related Stock Files
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(sec.relatedStocks as StockFile[]).map((sf) => (
                        <Link
                          key={sf._id}
                          href={`/stocks/${sf.slug.current}`}
                          className="group flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/40 px-4 py-3 transition-all hover:border-accent-500/40"
                        >
                          <span className="font-mono font-bold text-ash-100 group-hover:text-accent-200">
                            {sf.ticker}
                          </span>
                          <span className="truncate text-xs text-ash-400">{sf.companyName}</span>
                          <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-ash-600 group-hover:text-accent-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
