import Link from "next/link";
import Logo from "./Logo";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

const groups = [
  {
    title: "Top picks",
    links: [
      { name: "Weekly Top 10", href: "/weekly-picks" },
      { name: "Hidden Gems", href: "/hidden-gems" },
      { name: "Top by sector", href: "/top" },
    ],
  },
  {
    title: "Discover",
    links: [
      { name: "ETF leaderboard", href: "/etfs" },
      { name: "Featured stock", href: "/stocks" },
      { name: "Sectors index", href: "/sectors" },
      { name: "Screener", href: "/screener" },
      { name: "Watchlist", href: "/watchlist" },
    ],
  },
  {
    title: "Read",
    links: [
      { name: "Newsletter archive", href: "/newsletter" },
      { name: "Subscribe", href: "/subscribe" },
      { name: "Insights", href: "/insights" },
      { name: "About", href: "/about" },
      { name: "Sponsor your ticker", href: "/sponsor" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Disclaimer", href: "/disclaimer" },
      { name: "Privacy policy", href: "/privacy-policy" },
      { name: "Sponsorship policy", href: "/sponsor#policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-700 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ash-400">
              Curated investing intelligence for US &amp; Canadian markets.
              Editor-led, data-driven, beautifully simple.
            </p>
            <div className="mt-5 max-w-xs">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash-400">
                Weekly Top 10 to your inbox
              </p>
              <NewsletterForm
                source="footer"
                ctaLabel="Subscribe"
                variant="stacked"
              />
            </div>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ash-400">
                {g.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      className="text-sm text-ash-300 transition-colors hover:text-ash-50"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ink-700 pt-6">
          <p className="text-xs leading-relaxed text-ash-500">
            <strong className="text-ash-400">Important.</strong> AlphaBeat is an
            educational publication. Nothing here is investment advice or a
            recommendation to buy, sell, or hold any security. Quotes are
            delayed and may be inaccurate; verify with your broker before
            acting. Sponsored placements are clearly labelled and do not
            constitute an endorsement. Past performance does not predict
            future results.
          </p>
          <p className="mt-3 text-xs text-ash-500">
            &copy; {new Date().getFullYear()} AlphaBeat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
