import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `${SITE_NAME} is for educational purposes only. Nothing on this site is investment advice or a recommendation to buy, sell, or hold any security.`,
  alternates: { canonical: absoluteUrl("/disclaimer") },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Disclaimer" }]} />

      <article className="prose prose-ab max-w-none">
        <h1>Disclaimer</h1>

        <p>
          The information published on {SITE_NAME} is provided for educational
          and informational purposes only. It does not constitute investment
          advice, financial advice, trading advice, or any other sort of
          advice. {SITE_NAME} is not a registered investment adviser,
          broker-dealer, or financial planner.
        </p>

        <h2>No advice, no recommendations</h2>
        <p>
          Nothing on this site — including the Weekly Top 10, stock pages,
          editor&rsquo;s takes, bull and bear cases, ETF coverage, screeners, and
          insights — should be construed as a recommendation to buy, sell, or
          hold any security. Always conduct your own due diligence and consult
          a qualified financial professional before making investment
          decisions.
        </p>

        <h2>Quote &amp; data accuracy</h2>
        <p>
          Market data on {SITE_NAME} is provided by third-party APIs (currently
          Finnhub) and may be delayed by 15+ minutes, intermittent, or
          incorrect. Always verify quotes with your broker before acting. Some
          quotes may be deterministic samples when live data is temporarily
          unavailable; these are clearly labelled &ldquo;Sample&rdquo;.
        </p>

        <h2>Sponsored content</h2>
        <p>
          Some content on {SITE_NAME} is paid promotion. Sponsored placements
          are always labelled with a &ldquo;Sponsored&rdquo; ribbon and an
          adjacent disclosure of the sponsor relationship, per SEC and CSA
          guidance on paid promotion. <strong>Sponsorship buys visibility,
          never editorial opinion.</strong> Sponsors do not approve our
          editor&rsquo;s takes, bull or
          bear cases, or risk assessments. See our <a href="/sponsor#policy">
          sponsorship policy</a> for more.
        </p>

        <h2>Affiliate disclosure</h2>
        <p>
          {SITE_NAME} may earn referral fees when you click links to brokerages,
          ETF issuers, or other financial products. These commissions support
          our editorial team and never influence our coverage decisions or
          ratings.
        </p>

        <h2>Forward-looking statements</h2>
        <p>
          Our content may contain forward-looking statements, including
          opinions about a security&rsquo;s future performance, catalysts, or risks.
          These statements are subject to known and unknown risks and
          uncertainties. <strong>Past performance is not indicative of future
          results.</strong>
        </p>

        <h2>Coverage limits</h2>
        <p>
          {SITE_NAME} covers US (NYSE / NASDAQ) and Canadian (TSX / TSXV)
          listings. Other markets may appear via search but lack curated
          editorial.
        </p>

        <h2>Hold harmless</h2>
        <p>
          You agree that {SITE_NAME} and its authors shall not be liable for
          any losses or damages resulting from your use of this site. By using
          {" "}{SITE_NAME} you acknowledge you understand investment risk and
          agree to use the site at your own risk.
        </p>
      </article>
    </div>
  );
}
