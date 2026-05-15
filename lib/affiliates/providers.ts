/**
 * lib/affiliates/providers.ts
 *
 * Affiliate provider definitions. URLs are placeholder until Tom signs up
 * to each broker's affiliate program and receives ref codes.
 *
 * Enable globally: set enableAffiliates = true in Sanity siteSettings.
 */

export interface AffiliateProvider {
  id:          string;
  name:        string;
  logo:        string;   // emoji or icon key
  url:         string;   // placeholder — replace with real ref URL
  cta:         string;   // button label
  description: string;
  canadian:    boolean;  // true = primarily serves Canadian investors
  exchanges:   ("TSX" | "TSXV" | "NYSE" | "NASDAQ")[];
}

export const PROVIDERS: AffiliateProvider[] = [
  {
    id:          "wealthsimple",
    name:        "Wealthsimple",
    logo:        "W",
    url:         "https://www.wealthsimple.com",  // TODO: add ?ref=alphabeat
    cta:         "Open a Wealthsimple account",
    description: "Commission-free trading for Canadian investors. TFSA, RRSP, FHSA, and non-registered accounts.",
    canadian:    true,
    exchanges:   ["TSX", "TSXV", "NYSE", "NASDAQ"],
  },
  {
    id:          "questrade",
    name:        "Questrade",
    logo:        "Q",
    url:         "https://www.questrade.com",     // TODO: add ?ref=alphabeat
    cta:         "Open a Questrade account",
    description: "Low-cost Canadian brokerage. Free ETF purchases. TFSA, RRSP, FHSA, margin accounts.",
    canadian:    true,
    exchanges:   ["TSX", "TSXV", "NYSE", "NASDAQ"],
  },
  {
    id:          "qtrade",
    name:        "Qtrade",
    logo:        "Q",
    url:         "https://www.qtrade.ca",         // TODO: add ?ref=alphabeat
    cta:         "Open a Qtrade account",
    description: "Award-winning Canadian online brokerage with strong research tools.",
    canadian:    true,
    exchanges:   ["TSX", "TSXV", "NYSE", "NASDAQ"],
  },
];

/** Pick the best provider for a given context. Currently always returns Wealthsimple. */
export function pickProvider(exchange?: string): AffiliateProvider {
  void exchange;
  return PROVIDERS[0];
}
