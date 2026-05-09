import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageHref = (page: number) =>
    page === 1 ? basePath : `${basePath}?page=${page}`;

  const pages: number[] = [];
  const window = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - window && i <= currentPage + window)
    ) {
      pages.push(i);
    }
  }

  return (
    <nav
      className={cn("mt-10 flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      {currentPage > 1 && (
        <Link
          href={pageHref(currentPage - 1)}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-ink-600 bg-ink-800 px-3 text-sm text-ash-200 hover:bg-ink-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Link>
      )}
      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <span key={p} className="contents">
            {showEllipsis && (
              <span className="px-2 text-ash-500">…</span>
            )}
            <Link
              href={pageHref(p)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium",
                p === currentPage
                  ? "border-accent-500 bg-accent-500/10 text-accent-300"
                  : "border-ink-600 bg-ink-800 text-ash-200 hover:bg-ink-700"
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}
      {currentPage < totalPages && (
        <Link
          href={pageHref(currentPage + 1)}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-ink-600 bg-ink-800 px-3 text-sm text-ash-200 hover:bg-ink-700"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
