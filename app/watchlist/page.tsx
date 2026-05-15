import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";
import WatchlistTracker from "@/components/watchlist/WatchlistTracker";

export const metadata: Metadata = {
  title: "My Watchlist — AlphaBeat",
  description:
    "Track your Canadian and US stocks. Live quotes, 6-factor scores, and a weekly personalized digest — no account required.",
  alternates: { canonical: absoluteUrl("/watchlist") },
  robots: { index: false, follow: true },
};

export default function WatchlistPage() {
  return <WatchlistTracker />;
}
