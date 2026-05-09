import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="text-8xl font-black tracking-tighter text-accent-400/40">
        404
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ash-50">
        That page isn&rsquo;t on our radar.
      </h1>
      <p className="mt-3 max-w-md text-ash-300">
        The ticker, sector, or article you&rsquo;re looking for doesn&rsquo;t exist — at
        least not yet. Try the search, or jump back to the home page.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Link
          href="/screener"
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
        >
          <Search className="h-4 w-4" />
          Browse stocks
        </Link>
      </div>
    </div>
  );
}
