import Link from "next/link";
import { BarChart2, BookOpen, FileText, Search, Star } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <div className="font-mono text-8xl font-black tracking-tighter text-accent-400/30">
          404
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ash-50">
          Page not found
        </h1>
        <p className="mt-3 text-ash-400">
          This URL doesn&apos;t exist. It may have moved, or you may have followed
          an old link from before AlphaBeat was rebuilt.
        </p>
      </div>

      <div className="mt-12">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-ash-500">
          Everything that does exist
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <SectionLink
            href="/brief"
            icon={<FileText className="h-5 w-5 text-accent-400" />}
            title="The Brief"
            desc="Weekly Canadian investing newsletter — every Sunday"
          />
          <SectionLink
            href="/stocks"
            icon={<BarChart2 className="h-5 w-5 text-up-400" />}
            title="Stock Files"
            desc="6-factor scored reference pages for 38 TSX + US tickers"
          />
          <SectionLink
            href="/playbooks"
            icon={<BookOpen className="h-5 w-5 text-violet-400" />}
            title="Playbooks"
            desc="Deep-dive guides — TFSA strategy, dividends, precious metals"
          />
          <SectionLink
            href="/watchlist"
            icon={<Star className="h-5 w-5 text-warn-400" />}
            title="Watchlist"
            desc="Track tickers with live scores — no account needed"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm font-semibold text-ash-200 transition-colors hover:border-ink-500 hover:text-ash-50"
        >
          <Search className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

function SectionLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-ink-700 bg-ink-800/40 p-5 transition-all hover:border-accent-500/40 hover:bg-ink-800"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-900/80 ring-1 ring-inset ring-ink-700">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-ash-100 group-hover:text-accent-200">{title}</div>
        <div className="mt-0.5 text-sm text-ash-400">{desc}</div>
      </div>
    </Link>
  );
}
