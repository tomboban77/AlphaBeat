"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <AlertTriangle className="h-12 w-12 text-warn-400" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ash-50">
        Something glitched on our side.
      </h1>
      <p className="mt-3 max-w-md text-ash-300">
        The market data feed or our CMS may be temporarily down. Try refreshing
        — usually it clears within a minute.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-400"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm font-semibold text-ash-200 hover:border-ink-500"
        >
          Home
        </Link>
      </div>
      {error.digest && (
        <code className="mt-6 rounded bg-ink-800 px-2 py-1 font-mono text-xs text-ash-500">
          {error.digest}
        </code>
      )}
    </div>
  );
}
