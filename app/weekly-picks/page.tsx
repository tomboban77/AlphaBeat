import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { client } from "@/lib/sanity/client";
import { weeklyPicksListQuery } from "@/lib/sanity/queries";
import type { WeeklyPick } from "@/lib/types";
import { absoluteUrl, formatDate, formatRelativeWeek } from "@/lib/utils";
import { urlFor } from "@/lib/sanity/image";

import Breadcrumb from "@/components/ui/Breadcrumb";
import Disclaimer from "@/components/ui/Disclaimer";
import NewsletterCTA from "@/components/newsletter/NewsletterCTA";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Weekly Top 10",
  description:
    "Every week, our editors publish a Top 10. Each pick comes with a thesis, conviction level, time horizon, and the risks. Read the latest, browse the archive.",
  alternates: { canonical: absoluteUrl("/weekly-picks") },
};

const TONE_LABEL: Record<string, { label: string; cls: string }> = {
  "risk-on": { label: "Risk on", cls: "text-up-400 bg-up-500/10 ring-up-500/30" },
  "risk-off": { label: "Risk off", cls: "text-down-400 bg-down-500/10 ring-down-500/30" },
  neutral: { label: "Neutral", cls: "text-ash-300 bg-ink-700 ring-ink-500" },
  choppy: { label: "Choppy", cls: "text-warn-300 bg-warn-500/10 ring-warn-500/30" },
};

export default async function WeeklyPicksPage() {
  const picks = await client
    .fetch<WeeklyPick[]>(weeklyPicksListQuery)
    .catch(() => []);

  const [latest, ...rest] = picks;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Weekly Top 10" }]} />

      <header className="mb-10 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
          The flagship product
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ash-50 sm:text-4xl">
          Weekly Top 10
        </h1>
        <p className="mt-3 text-ash-300">
          Ten stocks worth your attention this week, ranked by the
          editor&rsquo;s conviction. Every issue includes a thesis, a time
          horizon, and a stated bear case for each name. New issue published
          every Sunday night, before Monday&rsquo;s open.
        </p>
      </header>

      {!latest ? (
        <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 px-6 py-16 text-center">
          <p className="text-ash-300">
            No weekly picks published yet. Create one in{" "}
            <Link
              href="/studio"
              className="font-semibold text-accent-300 underline-offset-2 hover:underline"
            >
              Sanity Studio
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          {/* Latest — feature card */}
          <Link
            href={`/weekly-picks/${latest.slug.current}`}
            className="group relative grid overflow-hidden rounded-2xl border border-accent-500/30 bg-gradient-to-br from-ink-800 via-ink-900 to-accent-950 transition-all hover:border-accent-500/60 hover:shadow-2xl hover:shadow-accent-500/10 sm:grid-cols-2"
          >
            <div className="relative aspect-[16/10] sm:aspect-auto">
              {latest.heroImage?.asset ? (
                <Image
                  src={urlFor(latest.heroImage).width(900).height(600).url()}
                  alt={latest.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink-700 to-accent-900">
                  <span className="text-7xl font-black tracking-tighter text-accent-300/40">
                    α
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/15 px-2.5 py-1 font-semibold uppercase tracking-wider text-accent-300 ring-1 ring-inset ring-accent-500/30">
                  Latest · {formatRelativeWeek(latest.weekOf)}
                </span>
                {latest.marketTone && TONE_LABEL[latest.marketTone] && (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 font-semibold uppercase tracking-wider ring-1 ring-inset ${TONE_LABEL[latest.marketTone].cls}`}
                  >
                    {TONE_LABEL[latest.marketTone].label}
                  </span>
                )}
                <span className="text-ash-400">
                  · {formatDate(latest.weekOf)}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
                {latest.title}
              </h2>
              {latest.author?.name && (
                <p className="text-sm text-ash-400">
                  by {latest.author.name}
                  {latest.author.credentials && (
                    <span className="text-ash-500"> · {latest.author.credentials}</span>
                  )}
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent-300">
                Read all 10 picks
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {rest.length > 0 && (
            <section className="mt-14 border-t border-ink-700 pt-10">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-ash-50">
                The archive
              </h2>
              <ul className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/40 divide-y divide-ink-700">
                {rest.map((p) => (
                  <li key={p._id}>
                    <Link
                      href={`/weekly-picks/${p.slug.current}`}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-ink-800"
                    >
                      <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-md bg-ink-700 sm:block">
                        {p.heroImage?.asset ? (
                          <Image
                            src={urlFor(p.heroImage).width(120).height(120).url()}
                            alt=""
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl font-black text-accent-300/40">
                            α
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded bg-ink-700 px-1.5 py-0.5 font-mono text-ash-300">
                            {formatDate(p.weekOf)}
                          </span>
                          {p.marketTone && TONE_LABEL[p.marketTone] && (
                            <span
                              className={`rounded px-1.5 py-0.5 font-semibold uppercase tracking-wider ring-1 ring-inset ${TONE_LABEL[p.marketTone].cls}`}
                            >
                              {TONE_LABEL[p.marketTone].label}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 truncate font-semibold text-ash-100">
                          {p.title}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-ash-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <div className="mt-12">
        <NewsletterCTA
          source="weekly-picks"
          variant="card"
          eyebrow="Don't miss a week"
          title="Get the Top 10 in your inbox every Sunday."
          description="The full ranked list, with thesis and conviction, hitting your inbox before Monday's open. Free, no spam."
        />
      </div>

      <div className="mt-12">
        <Disclaimer variant="block" />
      </div>
    </div>
  );
}
