import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `${SITE_NAME} privacy policy — what we collect, why, and how to opt out.`,
  alternates: { canonical: absoluteUrl("/privacy-policy") },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Privacy policy" }]} />

      <article className="prose prose-ab max-w-none">
        <h1>Privacy policy</h1>

        <p>
          {SITE_NAME} is committed to protecting your privacy. This page
          explains what we collect, why, and what you can do about it.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Analytics</strong> — we use Google Analytics 4 to understand
            traffic patterns. GA4 sets cookies and may collect IP address,
            referrer, device type, and pages viewed.
          </li>
          <li>
            <strong>Ads</strong> — we use Google AdSense (and may use Ezoic /
            Mediavine in the future) to serve advertising. These networks may
            set cookies and use IP-based personalization.
          </li>
          <li>
            <strong>Watchlist</strong> — your watchlist is stored exclusively in
            your browser&rsquo;s localStorage. It never leaves your device.
            {" "}{SITE_NAME} cannot read it.
          </li>
          <li>
            <strong>Newsletter</strong> — if you submit your email, we store it
            with our email service provider (e.g. Resend, Buttondown) for the
            sole purpose of sending the newsletter you signed up for.
          </li>
        </ul>

        <h2>What we don&rsquo;t collect</h2>
        <ul>
          <li>We don&rsquo;t sell your data.</li>
          <li>
            We don&rsquo;t operate accounts or store passwords. There is no signup.
          </li>
          <li>
            We don&rsquo;t track you across other sites beyond what GA4 / AdSense
            inherently do.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We use functional cookies (none today) and analytics/ads cookies set
          by Google. You can opt out of personalized ads at{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            adssettings.google.com
          </a>
          {" "}or block all cookies in your browser settings.
        </p>

        <h2>Children</h2>
        <p>
          {SITE_NAME} is not directed at children under 13 and we do not
          knowingly collect data from them.
        </p>

        <h2>Contact</h2>
        <p>
          Privacy questions or data requests:{" "}
          <a href="mailto:privacy@alphabeat.io">privacy@alphabeat.io</a>
        </p>
      </article>
    </div>
  );
}
