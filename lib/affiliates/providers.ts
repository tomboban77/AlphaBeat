/**
 * lib/affiliates/providers.ts
 * Referral links for Canadian brokerages.
 */

export interface AffiliateProvider {
  id:          string;
  name:        string;
  url:         string;
  bonus:       string;   // what the new user gets
  cta:         string;
  description: string;
  canadian:    boolean;
}

export const PROVIDERS: AffiliateProvider[] = [
  {
    id:          "wealthsimple",
    name:        "Wealthsimple",
    url:         "https://www.wealthsimple.com/invite/FLC4FE",
    bonus:       "$25 bonus",
    cta:         "Get $25 with Wealthsimple",
    description: "Commission-free trading for Canadian investors. TFSA, RRSP, FHSA, and non-registered accounts. Get $25 when you fund any account.",
    canadian:    true,
  },
  {
    id:          "questrade",
    name:        "Questrade",
    url:         "https://questmobile.onelink.me/tX0y/419708l0",
    bonus:       "$50 bonus",
    cta:         "Get $50 with Questrade",
    description: "Low-cost Canadian brokerage. Free ETF purchases. TFSA, RRSP, FHSA, and margin accounts. Get $50 for your first account.",
    canadian:    true,
  },
];

/** Primary provider for most placements. */
export function pickProvider(): AffiliateProvider {
  return PROVIDERS[0]; // Wealthsimple default
}
