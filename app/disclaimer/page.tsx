import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `${SITE_NAME} is an educational publication for Canadian individual investors. Nothing on this site is investment advice or a solicitation to buy, sell, or hold any security.`,
  alternates: { canonical: absoluteUrl("/disclaimer") },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Disclaimer" }]} />

      <article className="prose prose-ab max-w-none">
        <h1>Disclaimer</h1>

        <p>
          {SITE_NAME} is an educational publication for Canadian individual
          investors. The information on this site is provided for educational
          and informational purposes only and does not constitute investment
          advice, financial advice, trading advice, tax advice, or any other
          form of professional advice.
        </p>

        <h2>Not a registered adviser</h2>
        <p>
          {SITE_NAME} and its authors are not registered investment advisers,
          portfolio managers, or dealers under the Investment Industry
          Regulatory Organization of Canada (IIROC), the Ontario Securities
          Commission (OSC), or any other provincial or territorial securities
          regulator in Canada. We are not your fiduciary and we do not manage
          money on your behalf.
        </p>

        <h2>No recommendations</h2>
        <p>
          Nothing on this site — including Stock Files, The Brief, Playbooks,
          Top Lists, score calculations, bull cases, bear cases, account fit
          assessments, or tax and account tips — should be construed as a
          recommendation to buy, sell, or hold any security. Always conduct your
          own due diligence and consult a qualified financial professional
          registered with the appropriate Canadian regulator before making any
          investment decision.
        </p>

        <h2>Tax information is general only</h2>
        <p>
          Any tax-related content on {SITE_NAME} — including discussions of TFSA,
          RRSP, FHSA, eligible dividends, withholding taxes, and asset location
          — is general in nature and based on publicly available Canadian tax
          rules as understood by the editors. It is not personalized tax advice.
          Tax rules change. Your individual circumstances may differ materially
          from the examples discussed. Consult a Canadian tax professional for
          advice specific to your situation.
        </p>

        <h2>Quote and score accuracy</h2>
        <p>
          Market data is provided by Finnhub (free tier) and may be delayed by
          15+ minutes, intermittent, or incorrect. Quotes labelled
          &ldquo;Sample&rdquo; are deterministic placeholders generated when live
          data is unavailable. AlphaBeat scores are computed from Finnhub data
          and may be incomplete or inaccurate, particularly for smaller TSX
          stocks where fundamental data coverage is sparse. Always verify quotes
          and data with your broker before acting.
        </p>

        <h2>Sponsored content and affiliates</h2>
        <p>
          {SITE_NAME} may feature affiliate links to Canadian brokerages
          (Wealthsimple, Questrade, Qtrade) and may earn referral fees when you
          open an account through those links. Affiliate relationships do not
          influence editorial content, scores, or rankings. When sponsorships
          are active, they are clearly labelled and disclosed.{" "}
          <strong>Sponsorships buy visibility — never editorial opinion.</strong>
        </p>

        <h2>Forward-looking statements</h2>
        <p>
          Content on {SITE_NAME} may contain forward-looking statements including
          opinions about a security&rsquo;s future performance, catalysts, or risks.
          These statements are subject to known and unknown risks. Past
          performance is not indicative of future results.
        </p>

        <h2>Hold harmless</h2>
        <p>
          You agree that {SITE_NAME} and its authors shall not be liable for any
          losses or damages of any kind resulting from your use of this site,
          reliance on its content, or any investment decisions you make. By
          using {SITE_NAME} you acknowledge that you understand investment risk and
          agree to use the site entirely at your own risk.
        </p>

        <p>
          <em>Last updated: May 2026</em>
        </p>
      </article>
    </div>
  );
}
