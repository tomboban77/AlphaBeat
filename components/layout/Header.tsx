"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Menu, Search, Star, X } from "lucide-react";
import Logo from "./Logo";
import CommandPalette from "./CommandPalette";
import { useWatchlist } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

const NAV = [
  { name: "Top 10", href: "/weekly-picks" },
  { name: "Hidden Gems", href: "/hidden-gems" },
  { name: "By Sector", href: "/top" },
  { name: "ETFs", href: "/etfs" },
  { name: "Insights", href: "/insights" },
  { name: "Newsletter", href: "/newsletter" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const watchlist = useWatchlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-ink-700/80 bg-ink-950/80 backdrop-blur transition-all",
          scrolled ? "bg-ink-950/95 shadow-lg shadow-ink-950/40" : ""
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Logo />

          <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-ink-700 text-ash-50"
                    : "text-ash-300 hover:bg-ink-800 hover:text-ash-50"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-md border border-ink-600 bg-ink-800/80 px-3 py-1.5 text-sm text-ash-400 transition-colors hover:border-ink-500 hover:text-ash-200 sm:inline-flex"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Search ticker, sector…</span>
              <span className="hidden md:inline">
                <kbd className="ml-1 rounded border border-ink-600 bg-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-ash-400">
                  ⌘K
                </kbd>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-600 bg-ink-800/80 text-ash-300 transition-colors hover:text-ash-50 sm:hidden"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link
              href="/watchlist"
              className={cn(
                "relative inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-2.5 text-sm font-medium transition-colors sm:px-3",
                watchlist.length > 0
                  ? "border-accent-500/50 bg-accent-500/10 text-accent-300 hover:bg-accent-500/20"
                  : "border-ink-600 bg-ink-800/80 text-ash-300 hover:text-ash-50"
              )}
              aria-label={`Watchlist (${watchlist.length})`}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  watchlist.length > 0 && "fill-accent-400 text-accent-400"
                )}
              />
              <span className="hidden sm:inline">Watchlist</span>
              {watchlist.length > 0 && (
                <span className="ml-0.5 rounded bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-ink-950">
                  {watchlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/subscribe"
              className="hidden h-9 items-center justify-center gap-1.5 rounded-md bg-accent-500 px-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-accent-400 lg:inline-flex"
            >
              <Mail className="h-4 w-4" />
              Subscribe
            </Link>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-600 bg-ink-800/80 text-ash-300 hover:text-ash-50 md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="border-t border-ink-700 bg-ink-900 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobile}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive(item.href)
                      ? "bg-ink-700 text-ash-50"
                      : "text-ash-200 hover:bg-ink-800"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/subscribe"
                onClick={closeMobile}
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-accent-500 px-3 py-2 text-sm font-semibold text-ink-950"
              >
                <Mail className="h-4 w-4" />
                Subscribe to the newsletter
              </Link>
              <Link
                href="/sponsor"
                onClick={closeMobile}
                className="rounded-md border border-warn-500/40 bg-warn-500/10 px-3 py-2 text-sm font-medium text-warn-200"
              >
                Sponsor your ticker
              </Link>
            </div>
          </div>
        )}
      </header>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
