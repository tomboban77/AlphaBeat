import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MarketTicker from "@/components/market/MarketTicker";
import { siteUrl, SITE_NAME } from "@/lib/utils";
import "./globals.css";

const SITE_TAGLINE = "Canadian investing, made clearer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "AlphaBeat helps Canadian millennials and Gen Z invest with clarity — tax-aware, account-aware, TSX-fluent. Stock Files scored on 6 factors, a weekly Brief, Playbooks for TFSA/RRSP strategy, and a Watchlist with personalized digest.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Tax-aware stock analysis, a weekly investing brief, and deep-dive playbooks for Canadian DIY investors.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html
      lang="en-CA"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink-950 text-ash-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: siteUrl(),
              description: SITE_TAGLINE,
              sameAs: [],
            }),
          }}
        />
        <MarketTicker />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />

        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
