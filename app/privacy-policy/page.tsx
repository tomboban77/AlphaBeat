import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `${SITE_NAME} privacy policy — what we collect, why, and your rights under Canadian privacy law (PIPEDA).`,
  alternates: { canonical: absoluteUrl("/privacy-policy") },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Privacy policy" }]} />

      <article className="prose prose-ab max-w-none">
        <h1>Privacy policy</h1>

        <p>
          {SITE_NAME} is committed to protecting your personal information in
          accordance with the{" "}
          <em>Personal Information Protection and Electronic Documents Act</em>{" "}
          (PIPEDA) and applicable provincial privacy legislation. This policy
          explains what we collect, why we collect it, and your rights as a
          Canadian resident.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Email address</strong> — if you subscribe to The Brief or
            the weekly watchlist digest, your email is stored with our email
            service providers (Beehiiv for The Brief; Resend and Sanity for the
            digest). We use it only to send the newsletters you requested.
          </li>
          <li>
            <strong>Analytics</strong> — if you have Google Analytics 4 enabled,
            GA4 collects anonymized usage data (pages visited, session duration,
            device type, approximate location). No personally identifiable
            information is collected by default. You can opt out via your
            browser&rsquo;s cookie settings or a GA4 opt-out extension.
          </li>
          <li>
            <strong>Watchlist</strong> — your watchlist is stored exclusively in
            your browser&rsquo;s localStorage. It never leaves your device.{" "}
            {SITE_NAME} cannot read, access, or transmit it unless you subscribe
            to the digest and explicitly provide your tickers along with your
            email.
          </li>
        </ul>

        <h2>What we don&rsquo;t collect</h2>
        <ul>
          <li>We do not sell your personal information to third parties.</li>
          <li>We do not operate user accounts or store passwords.</li>
          <li>We do not run display advertising networks (no AdSense).</li>
          <li>
            We do not use tracking pixels, cross-site tracking cookies, or
            behavioural advertising profiling.
          </li>
        </ul>

        <h2>How we use your information</h2>
        <ul>
          <li>
            Email addresses are used solely to deliver the newsletters or digest
            you subscribed to.
          </li>
          <li>
            Analytics data is used in aggregate to understand which content is
            useful and to improve the site.
          </li>
          <li>
            We do not use your information for automated decision-making or
            profiling that produces legal effects.
          </li>
        </ul>

        <h2>Third-party processors</h2>
        <ul>
          <li>
            <strong>Beehiiv</strong> (beehiiv.com) — newsletter delivery. Their
            privacy policy governs data they process on our behalf.
          </li>
          <li>
            <strong>Resend</strong> (resend.com) — transactional email (watchlist
            digest).
          </li>
          <li>
            <strong>Sanity</strong> (sanity.io) — content management and
            subscriber records for the digest.
          </li>
          <li>
            <strong>Vercel</strong> (vercel.com) — hosting. Vercel logs may
            include IP addresses for security and performance purposes.
          </li>
          <li>
            <strong>Finnhub</strong> (finnhub.io) — market data. No personal
            information is shared with Finnhub.
          </li>
        </ul>

        <h2>Your rights under PIPEDA</h2>
        <p>
          As a Canadian resident you have the right to:
        </p>
        <ul>
          <li>Know what personal information we hold about you.</li>
          <li>Access, correct, or request deletion of your information.</li>
          <li>
            Withdraw consent to our use of your personal information at any
            time (subject to legal and contractual restrictions).
          </li>
          <li>File a complaint with the Office of the Privacy Commissioner of Canada.</li>
        </ul>
        <p>
          To unsubscribe from The Brief, click the unsubscribe link in any
          email. To request access, correction, or deletion of your data,
          contact us at{" "}
          <a href="mailto:privacy@alphabeat.io">privacy@alphabeat.io</a>.
        </p>

        <h2>Data retention</h2>
        <p>
          Email addresses are retained for as long as your subscription is
          active. Upon unsubscription or deletion request, your email is removed
          from active lists within 30 days. Aggregate analytics data does not
          contain personal information and may be retained indefinitely.
        </p>

        <h2>Cookies</h2>
        <p>
          {SITE_NAME} sets no first-party cookies beyond those required by
          Next.js for basic functionality. If GA4 is enabled, Google sets
          analytics cookies. You can block or delete cookies in your browser
          settings without affecting core site functionality.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be
          noted at the bottom of this page with the revision date.
        </p>

        <h2>Contact</h2>
        <p>
          Privacy questions or data requests:{" "}
          <a href="mailto:privacy@alphabeat.io">privacy@alphabeat.io</a>
        </p>

        <p>
          <em>Last updated: May 2026</em>
        </p>
      </article>
    </div>
  );
}
