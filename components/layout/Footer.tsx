import Link from "next/link";
import Logo from "./Logo";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

const groups = [
  {
    title: "Read",
    links: [
      { name: "The Brief", href: "/brief" },
      { name: "Playbooks", href: "/playbooks" },
      { name: "Stock Files", href: "/stocks" },
      { name: "Top Lists", href: "/best" },
    ],
  },
  {
    title: "Tools",
    links: [
      { name: "Watchlist", href: "/watchlist" },
      { name: "Methodology", href: "/methodology" },
      { name: "Subscribe", href: "/subscribe" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "About", href: "/about" },
      { name: "Disclaimer", href: "/disclaimer" },
      { name: "Privacy", href: "/privacy-policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-700 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ash-400">
              Canadian investing, made clearer. Tax-aware, account-aware,
              TSX-fluent. Every Sunday.
            </p>
            <div className="mt-5 max-w-xs">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash-400">
                Get the Brief — free, weekly
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
            educational publication for Canadian individual investors. Nothing
            here is investment advice or a recommendation to buy, sell, or hold
            any security. Quotes are delayed and may be inaccurate; verify with
            your broker before acting. Past performance does not predict future
            results. AlphaBeat is not a registered investment adviser.
          </p>
          <p className="mt-3 text-xs text-ash-500">
            &copy; {new Date().getFullYear()} AlphaBeat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
