import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Eye,
  LineChart,
  ShieldCheck,
  Users,
} from "lucide-react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sponsor your ticker",
  description:
    "Reach engaged retail and self-directed investors. AlphaBeat sponsorships are clearly disclosed, sit beside our independent editor's take, and never mimic editorial.",
  alternates: { canonical: absoluteUrl("/sponsor") },
};

const placements = [
  {
    name: "Spotlight Card",
    location: "Home + Sector pages",
    description:
      "A premium card that sits beside trending stocks. Custom logo, headline, and CTA button. 'Sponsored' ribbon is permanent and prominent.",
    cta: "Most popular",
    highlight: true,
  },
  {
    name: "Stock Page Takeover",
    location: "Your /stocks/[ticker] page",
    description:
      "A sponsored ribbon on your own stock detail page. Disclosure runs beside the editor's take — never replaces it.",
  },
  {
    name: "Weekly Top 10 Inclusion",
    location: "Editorial discretion only",
    description:
      "We do NOT sell positions in the weekly Top 10. Editorial decides. We do offer adjacent placements next to the weekly list.",
    cta: "Editorial firewall",
  },
  {
    name: "Insight Sponsorship",
    location: "Single insight article",
    description:
      "Brand the top of a relevant insight piece (analysis, earnings recap, etc.). Article remains independent — sponsorship is a placement, not an endorsement.",
  },
];

export default function SponsorPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Sponsor" }]} />

      <header className="mb-12 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-warn-500/30 bg-warn-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-warn-300">
          For listed companies &amp; IR teams
        </div>
        <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-ash-50 sm:text-5xl">
          Put your ticker in front of investors who actually read.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ash-300">
          AlphaBeat reaches engaged self-directed investors and IR-aware retail.
          Every sponsored placement is clearly labelled, sits beside an
          independent editor&rsquo;s take, and links to your IR materials. We are not
          for sale on substance — only on visibility.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="mailto:partners@alphabeat.io?subject=Sponsorship%20inquiry"
            className="inline-flex items-center gap-2 rounded-full bg-warn-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-warn-300"
          >
            Get a media kit
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="#policy"
            className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
          >
            Read sponsorship policy
          </Link>
        </div>
      </header>

      <section className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={<Users className="h-5 w-5 text-accent-400" />} value="Retail + IR" label="Audience" />
        <Stat icon={<Eye className="h-5 w-5 text-violet-400" />} value="Editor-led" label="Tone of voice" />
        <Stat icon={<LineChart className="h-5 w-5 text-up-400" />} value="US + TSX" label="Coverage" />
        <Stat icon={<ShieldCheck className="h-5 w-5 text-warn-300" />} value="Disclosed" label="Always labelled" />
      </section>

      <section className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight text-ash-50">
          Placement options
        </h2>
        <p className="mt-2 text-sm text-ash-400">
          All placements include the editor&rsquo;s-take disclosure and a clearly
          visible &ldquo;Sponsored&rdquo; ribbon.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {placements.map((p) => (
            <article
              key={p.name}
              className={`rounded-2xl border p-5 ${
                p.highlight
                  ? "ab-glow border-warn-500/60 bg-warn-500/5"
                  : "border-ink-700 bg-ink-800/60"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-ash-50">{p.name}</h3>
                {p.cta && (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      p.highlight ? "text-warn-300" : "text-ash-500"
                    }`}
                  >
                    {p.cta}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ash-400">
                {p.location}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ash-300">
                {p.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="policy"
        className="rounded-2xl border border-ink-700 bg-ink-900/60 p-6 sm:p-8"
      >
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-accent-400" />
          <h2 className="text-2xl font-bold tracking-tight text-ash-50">
            Sponsorship policy
          </h2>
        </div>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ash-200">
          {[
            "Sponsored placements are always labelled with a 'Sponsored' ribbon and disclosure adjacent to the placement, per SEC and CSA guidance on paid promotion.",
            "Sponsorship buys visibility, never editorial. Bull/bear cases, risk lists, and the Weekly Top 10 are decided by editors. Sponsors do not see editorial copy before publish.",
            "Sponsors get the right of reply — if we publish a critical piece, we offer 48 hours to provide a response, but we don't grant veto.",
            "We do not accept sponsorships from companies under active SEC/CSA enforcement, OTC pump-and-dump operators, or companies whose primary product is unregulated tokens.",
            "All sponsor links use rel=\"sponsored\" per Google guidelines. Disclosure text is required and editor-approved.",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-up-400" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-accent-500/30 bg-gradient-to-br from-ink-900 to-accent-950 p-6 text-center sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-ash-50 sm:text-3xl">
          Ready to talk?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-ash-300">
          Send us a note — we&rsquo;ll reply within one business day with rates,
          availability, and a media kit tailored to your ticker.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href="mailto:partners@alphabeat.io?subject=Sponsorship%20inquiry"
            className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
          >
            partners@alphabeat.io
          </a>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-800/60 p-4">
      <div>{icon}</div>
      <div className="mt-3 text-lg font-bold text-ash-50">{value}</div>
      <div className="text-xs text-ash-500">{label}</div>
    </div>
  );
}
