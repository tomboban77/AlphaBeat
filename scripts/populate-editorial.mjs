/**
 * scripts/populate-editorial.mjs
 *
 * Patches stockFile documents with AI-researched editorial content.
 * All content reflects publicly available information as of mid-2025.
 * Tom should review and refine before publishing — editorNotes flags each.
 *
 * Usage: node scripts/populate-editorial.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

const env       = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();
if (!projectId || !token) { console.error("Missing Sanity env vars"); process.exit(1); }
const sanity = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

// ---------------------------------------------------------------------------
// Editorial data
// bull/bear: exactly 3 points each, Canadian investor lens
// accountFit: practical reasoning per account type
// ---------------------------------------------------------------------------

const CONTENT = {

  // ── Canadian Banks ──────────────────────────────────────────────────────

  "RY.TO": {
    reviewType: "deep",
    bullCase: [
      "Canada's largest bank by market cap with an unrivalled retail franchise — 17 million clients, dominant in wealth management and capital markets",
      "City National (US private banking) and RBC Brewin Dolphin diversify earnings beyond the Canadian mortgage book and reduce domestic concentration risk",
      "Consistent dividend growth for over a decade; eligible dividends mean the after-tax yield is materially higher than the stated rate, especially in non-registered accounts",
    ],
    bearCase: [
      "Canadian mortgage book is the largest single risk — if unemployment rises and house prices correct, PCL provisions will spike and compress ROE",
      "City National integration has been slower and costlier than guided; US regional banking headwinds add uncertainty to the growth thesis",
      "Premium valuation vs peers (P/E ~17× vs sector median 12×) leaves little room for execution misses",
    ],
    canadianInvestorParagraph: "RY is the anchor holding in most Canadian dividend portfolios for good reason. It pays eligible dividends, which attract the dividend tax credit in a non-registered account — the effective after-tax yield is meaningfully higher than it appears. In a TFSA the dividend compounds entirely tax-free, making it ideal for long-term income compounding. For a first-home buyer using an FHSA, the stable income and low volatility make it a reasonable core holding.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Eligible dividends compound tax-free; no withholding, no tax slip. Best account for long-term income compounding." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred growth and dividends reinvested untaxed until withdrawal. Solid choice if TFSA is full." },
      fhsa:          { recommendation: "acceptable", reasoning: "Stable income works in an FHSA time horizon, but capital growth is slow — growth-oriented holdings usually make better use of FHSA room." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend tax credit reduces effective tax rate significantly vs interest income. Better than most alternatives in non-reg." },
    },
  },

  "TD.TO": {
    reviewType: "deep",
    bullCase: [
      "Canada's second-largest bank with the deepest US retail footprint — TD Bank NA has more US branches than Canadian ones, giving genuine geographic diversification",
      "Schwab stake (~10%) provides structural exposure to US brokerage and wealth management growth without operating risk",
      "One of the most capital-efficient Big Six banks with a strong track record of dividend growth and a payout ratio well within the sustainable range",
    ],
    bearCase: [
      "2024 AML settlement with US regulators (DOJ, FinCEN, OCC) imposed a $3B+ fine and an asset cap on its US retail bank — growth is structurally constrained until remediation is complete",
      "US asset cap limits organic US revenue growth for at least 2–3 years, exactly when TD's US peers are expanding",
      "Canadian mortgage delinquencies rising; Toronto and Vancouver condo exposure is a tail risk if rate cuts are delayed",
    ],
    canadianInvestorParagraph: "TD is a core Canadian bank holding with a unique US angle via its retail branch network and Schwab stake. The 2024 AML settlement is a near-term overhang but also why TD trades at a small discount to RY — that discount could compress as remediation progresses. Eligible dividends make it tax-efficient in both TFSA and non-registered accounts.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Eligible dividends, tax-free compounding. The AML discount makes the entry valuation attractive relative to RY." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred reinvestment of eligible dividends. Solid long-term holding." },
      fhsa:          { recommendation: "acceptable", reasoning: "Reasonable income stability for the FHSA horizon but slow capital appreciation." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend tax credit applies. Better after-tax yield than it first appears." },
    },
  },

  "BMO.TO": {
    reviewType: "quick",
    bullCase: [
      "Bank of the West acquisition (completed 2023) meaningfully expands BMO's US commercial banking presence in California and the western US — a market with above-average GDP growth",
      "Strong capital markets franchise (BMO Capital Markets) provides fee income diversification that smooths through credit cycles",
      "Longest-running dividend of any Canadian company (paid since 1829) — a track record that speaks to institutional resilience across economic cycles",
    ],
    bearCase: [
      "Bank of the West integration costs and loan book quality are still being worked through — US PCL provisions remain elevated relative to peers",
      "Higher US commercial real estate exposure than most Canadian bank peers adds credit risk in a prolonged high-rate environment",
      "P/B below book value historically signals market skepticism about US integration ROI — a discount that may persist until integration milestones are hit",
    ],
    canadianInvestorParagraph: "BMO offers a different US exposure than TD — commercial rather than retail, and geographically concentrated in higher-growth western US markets. The integration risk is real but so is the long-term upside if BMO can cross-sell its Canadian commercial banking strengths into the US book. Eligible dividends and a 195-year dividend streak make it a credible income compounder.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Eligible dividends compound tax-free. The discounted valuation vs RY/TD makes the starting yield attractive." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred growth; integration risk is better held in registered accounts where volatility doesn't create tax events." },
      fhsa:          { recommendation: "acceptable", reasoning: "Stable income but limited near-term capital appreciation while integration plays out." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend credit applies. Solid long-term non-reg holding once integration overhang clears." },
    },
  },

  "BNS.TO": {
    reviewType: "quick",
    bullCase: [
      "International banking franchise in Pacific Alliance countries (Mexico, Peru, Chile, Colombia) provides EM growth exposure unavailable through any other Big Six bank",
      "Trading at the deepest discount to book and earnings among the Big Six — mean reversion alone is a thesis if Latin American execution improves",
      "New management (Scott Thomson, CEO since 2023) is restructuring the international portfolio and pivoting toward higher-return North American businesses",
    ],
    bearCase: [
      "Latin American political and currency risk is structural — Mexico, Peru, and Colombia all carry sovereign and FX risks that Canadian investors are not compensated for in the dividend alone",
      "Dividend growth has lagged peers for years; the payout ratio is elevated, limiting near-term increase capacity without earnings improvement",
      "Canadian mortgage book is weighted toward higher-risk borrowers relative to peers; BNS PCL provisions tend to spike harder in downturns",
    ],
    canadianInvestorParagraph: "BNS is the highest-risk, highest-yield of the Big Six — the international franchise is either the reason to own it (EM growth) or the reason to avoid it (EM risk). For Canadian investors who already hold RY or TD, BNS adds geographic diversification. The eligible dividend still qualifies for the tax credit, but the dividend growth has been the weakest among peers.",
    accountFit: {
      tfsa:          { recommendation: "good",       reasoning: "Eligible dividends, tax-free compounding. Higher starting yield than peers but slower dividend growth — a reasonable TFSA trade-off." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred income. Currency/EM volatility is less impactful inside a registered account." },
      fhsa:          { recommendation: "acceptable", reasoning: "Higher yield useful for near-term income but EM risk adds volatility to a shorter FHSA time horizon." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Eligible dividend credit applies but the slower dividend growth is less compelling than peers in a taxable account." },
    },
  },

  "CM.TO": {
    reviewType: "quick",
    bullCase: [
      "Most Canada-focused of the Big Six with the deepest retail banking penetration in Ontario — less EM or US complexity means simpler execution risk",
      "Acquired a 25% stake in AT&T's WarnerMedia spinoff (now Warner Bros. Discovery) which has been a drag — unwinding or recovering this creates optionality",
      "Trades at the lowest P/E among the Big Six despite improving ROE trajectory — any re-rating toward sector average adds meaningful upside",
    ],
    bearCase: [
      "Highest Canadian mortgage concentration among the Big Six — CIBC is most exposed to a Canadian housing correction, particularly in Ontario condos",
      "Simpler international diversification cuts both ways — less EM upside, but also more concentrated Canadian macro risk",
      "Capital ratios have historically been tighter than peers, limiting capacity for large acquisitions or buybacks vs RY or TD",
    ],
    canadianInvestorParagraph: "CIBC is the purest play on the Canadian economy among the Big Six — which means it's the highest beta to Canadian housing and the consumer. That's a risk but also why it trades cheaper than RY. If you believe in Canadian economic resilience, CIBC's discount provides a margin of safety. Eligible dividends work well in a TFSA or non-registered account.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Eligible dividends, cheapest valuation among Big Six — attractive starting yield in a TFSA for income compounding." },
      rrsp:          { recommendation: "good",       reasoning: "Solid tax-deferred income holding. Canadian housing risk is manageable in a long-horizon account." },
      fhsa:          { recommendation: "acceptable", reasoning: "Works but Canadian housing exposure adds ironic risk for someone saving for a home purchase." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend credit applies. Discounted valuation provides better after-tax yield than peers at current prices." },
    },
  },

  // ── Energy ──────────────────────────────────────────────────────────────

  "ENB.TO": {
    reviewType: "deep",
    bullCase: [
      "Regulated pipeline network spanning Canada and the US — ~90% of cash flow is fee-based and contracted, making it more utility than commodity play",
      "Dominion Gas Distribution acquisition (completed 2023) adds a 17th consecutive year of dividend growth guidance and material US utility exposure",
      "7%+ indicated yield backed by DCF coverage ratio of ~1.6× — one of the most reliable high-yield dividend streams in the Canadian market",
    ],
    bearCase: [
      "Debt-heavy balance sheet (~$100B total debt) limits financial flexibility and makes ENB sensitive to refinancing risk if rates stay elevated longer",
      "US rate case proceedings on gas distribution assets add regulatory uncertainty to the growth outlook for 2025–2026",
      "Energy transition risk is real over a 10–15 year horizon — pipeline assets have long lives but hydrogen and electrification could erode volumes",
    ],
    canadianInvestorParagraph: "ENB is the GIC alternative for income-focused Canadian investors — a 7%+ yield backed by contracted, regulated cash flows rather than commodity prices. The eligible dividend means the after-tax yield in a non-registered account is meaningfully better than a GIC. In a TFSA it's one of the most powerful compounders for income investors. The key risk is duration: high debt and long-duration assets are rate-sensitive.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "7%+ eligible dividend compounding tax-free is hard to beat for income-focused TFSA investors. Maximises the tax-free benefit." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred compounding of a high eligible dividend. Solid RRSP core holding." },
      fhsa:          { recommendation: "acceptable", reasoning: "High yield useful if horizon is longer, but rate sensitivity adds volatility inappropriate for a shorter FHSA time frame." },
      nonRegistered: { recommendation: "ideal",      reasoning: "Eligible dividend tax credit makes the after-tax yield exceptional. Better than almost any fixed-income alternative in non-reg." },
    },
  },

  "CNQ.TO": {
    reviewType: "deep",
    bullCase: [
      "Long-life, low-decline oil sands assets have the lowest sustaining capital requirements in the industry — CNQ keeps more of every dollar of oil revenue than almost any peer",
      "Best capital allocator in Canadian energy: base dividend + special dividends + buybacks, with a stated policy to return 100% of free cash flow above $40/bbl WTI",
      "Horizon Oil Sands mine has a 50+ year reserve life — CNQ's production base is essentially a perpetual annuity at reasonable oil prices",
    ],
    bearCase: [
      "Oil sands have among the highest GHG intensity of any hydrocarbon extraction method — ESG exclusion by global institutions limits the buyer universe",
      "WTI oil price below $60/bbl materially reduces FCF; below $50 the dividend growth engine stalls even with a conservative balance sheet",
      "Trans Mountain pipeline expansion helps but Canadian heavy oil still trades at a persistent discount (WCS-WTI differential) that compresses netbacks",
    ],
    canadianInvestorParagraph: "CNQ is the best-run oil company in Canada, full stop. Its oil sands assets have decades of reserve life, low decline rates, and best-in-class operating costs — when oil is above $65 WTI, CNQ generates enormous free cash flow and returns it to shareholders via base dividend, special dividends, and buybacks. The eligible dividend makes it attractive in both TFSA and non-registered accounts for income investors who want commodity exposure.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Eligible dividend plus FCF-driven capital returns compound tax-free. Long reserve life suits a long-horizon TFSA." },
      rrsp:          { recommendation: "ideal",      reasoning: "Oil price volatility is smoothed inside a registered account; eligible dividends reinvest tax-deferred." },
      fhsa:          { recommendation: "good",       reasoning: "Good yield and capital return potential, but oil price swings can reduce FHSA balance right before a home purchase." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend tax credit applies. Special dividends are also eligible — a tax-efficient income stream in non-reg." },
    },
  },

  "SU.TO": {
    reviewType: "quick",
    bullCase: [
      "Only fully-integrated Canadian oil major with upstream (oil sands) + downstream (refineries + retail) — refining margin offsets the crude price and provides earnings stability competitors lack",
      "Under new management (Rich Kruger, CEO since 2022) the company has dramatically improved execution, reduced costs, and restarted buybacks at scale",
      "The Fort Hills and Syncrude stakes, combined with Base Mine, give Suncor one of the largest and lowest-cost oil sands positions in the world",
    ],
    bearCase: [
      "Retail business (Petro-Canada) adds operational complexity and capital intensity that pure-play upstream peers don't have",
      "Fort Hills has had repeated operational issues and costs above initial projections — execution risk at that asset remains elevated",
      "Activist pressure (Elliott) that drove management change has also pushed for corporate breakup — strategic uncertainty around the retail division lingers",
    ],
    canadianInvestorParagraph: "Suncor is the most earnings-stable way to own Canadian oil because the integrated model means refineries profit when crude falls (lower input costs). The new management has been a genuine catalyst — costs are down and buybacks are back. Eligible dividends and a diversified oil model make it well-suited for TFSA income investors who want oil exposure without pure WTI price sensitivity.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Eligible dividends plus buyback-driven per-share growth work well in a tax-free account." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred compounding; integration model smooths volatility vs pure-play oil sands." },
      fhsa:          { recommendation: "acceptable", reasoning: "Oil price risk adds unwanted volatility for a shorter FHSA horizon." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend credit applies. Integrated model makes it more bond-like in earnings than peers." },
    },
  },

  "TRP.TO": {
    reviewType: "quick",
    bullCase: [
      "North American pipeline network spanning Canada, US, and Mexico — regulated tolling model generates predictable, inflation-linked cash flows similar to ENB",
      "Coastal GasLink pipeline (BC LNG) provides long-term capacity exposure to Asian LNG export markets as global LNG demand grows",
      "Announced $3B+ asset sale program reduces leverage and focuses the business on highest-return regulated pipeline assets",
    ],
    bearCase: [
      "Coastal GasLink construction costs massively overran ($14.5B vs $6.6B budgeted) and TC Energy carries ongoing liability exposure — the single biggest capital allocation mistake in Canadian energy history",
      "Debt load is among the heaviest in Canadian pipelines — rising rates have materially increased carrying costs and reduced financial flexibility",
      "US pipeline regulatory environment has become less predictable; cross-border projects face elongated approval timelines",
    ],
    canadianInvestorParagraph: "TRP is a higher-risk version of ENB — similar regulated pipeline model but with a heavier debt burden from the Coastal GasLink overrun. The asset sale program is the right response but it will take time to show up in leverage ratios. The 7%+ yield reflects that risk. Canadian investors who already own ENB are adding correlated risk by also holding TRP; those who don't own a Canadian pipeline might prefer ENB's cleaner balance sheet.",
    accountFit: {
      tfsa:          { recommendation: "good",       reasoning: "High eligible dividend yield works in a TFSA but the balance sheet risk warrants a smaller position than ENB." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred income; registered accounts smooth the volatility of the deleveraging process." },
      fhsa:          { recommendation: "avoid",      reasoning: "High leverage and balance sheet uncertainty add risk inappropriate for the shorter FHSA horizon." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Eligible dividend tax credit applies. Position sizing matters — don't double up if you already own ENB." },
    },
  },

  // ── Telecom / Utility ───────────────────────────────────────────────────

  "BCE.TO": {
    reviewType: "deep",
    bullCase: [
      "Highest indicated dividend yield among Canadian telecoms (~9% at current prices) backed by a regulated wireline + wireless infrastructure with pricing power",
      "Fibre and 5G network investment is peaking — capital intensity should decline materially by 2026-2027, freeing FCF to support the dividend",
      "Bell Media (CTV, TSN, RDS) and Bell Business Markets provide revenue diversification beyond pure consumer connectivity",
    ],
    bearCase: [
      "Dividend sustainability is the central debate — FCF barely covers the current dividend after capex, and any revenue shortfall could force a cut (as peers Rogers and Telus have not faced)",
      "Debt-to-EBITDA is among the highest of any investment-grade Canadian issuer — refinancing a large bond book in a higher-rate environment compresses margins",
      "CRTC regulatory decisions on wholesale access could force BCE to open its fibre network to competitors at regulated rates, compressing ARPU",
    ],
    canadianInvestorParagraph: "BCE is Canada's highest-yield telecom — and that yield is both the reason to own it and the reason to be cautious. The FCF-to-dividend coverage is tighter than Telus. If you believe capex peaks and FCF improves, BCE at 9%+ is a compelling eligible dividend. If you think debt costs and regulatory pressure persist, the dividend is at risk. This is a high-conviction, lower-position-size holding, not a passive core weight.",
    accountFit: {
      tfsa:          { recommendation: "good",       reasoning: "Eligible dividend yield compounds powerfully tax-free if the dividend is maintained. Position size appropriately given sustainability risk." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred compounding; if the thesis plays out, the yield on cost becomes exceptional over time." },
      fhsa:          { recommendation: "avoid",      reasoning: "Dividend sustainability risk and high debt make this inappropriate for the shorter FHSA horizon." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Eligible dividend credit partially offsets the tax drag. But if the dividend is cut, non-reg holders take the tax loss + capital loss hit together." },
    },
  },

  "T.TO": {
    reviewType: "quick",
    bullCase: [
      "Lower leverage than BCE and a stronger FCF-to-dividend coverage ratio — Telus is the financially healthier of the two major Canadian telcos",
      "TELUS Health (digital health records, pharmacy management) and TELUS Agriculture & Consumer Goods are genuine diversification options with long-term secular tailwinds",
      "Consistent dividend growth track record (10%+ CAGR over the last decade) with an explicit multi-year growth guidance — rare clarity in a capital-intensive industry",
    ],
    bearCase: [
      "TELUS International (TIXT) has struggled with margin pressure and client churn — the IT services subsidiary is a drag on consolidated financials",
      "British Columbia concentration means weather events and regional economic weakness disproportionately impact revenue",
      "5G and fibre capital spend is ongoing — FCF improvement depends on this capex cycle ending on schedule, which telecom capex rarely does",
    ],
    canadianInvestorParagraph: "Telus is the Canadian telecom to own if you want dividend growth rather than maximum current yield. The BCE vs Telus decision usually comes down to: more yield now (BCE) vs more certainty of growing yield over time (Telus). For younger TFSA investors with a long horizon, Telus's dividend growth trajectory compounds into a higher yield on cost over time. Note: Telus on NYSE trades as TU — the TFSA withholding rules apply only to the NYSE-listed shares, not T.TO.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "T.TO is a Canadian-listed eligible dividend payer — no US withholding risk. Dividend growth trajectory is ideal for long-horizon TFSA compounding." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred reinvestment of a growing eligible dividend. Solid core holding." },
      fhsa:          { recommendation: "good",       reasoning: "Lower risk than BCE with dividend growth; suitable for a 3-5 year FHSA horizon." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend credit applies. Growing payout means yield on cost improves annually in a taxable account." },
    },
  },

  "FTS.TO": {
    reviewType: "quick",
    bullCase: [
      "50 consecutive years of annual dividend growth — the longest streak of any Canadian company, in a market where dividend consistency is the gold standard",
      "Regulated utility operations in Canada, US, and Caribbean generate near-certain cash flows with built-in inflation escalators in most rate cases",
      "ITC Holdings (US Midwest electric transmission) provides significant US revenue diversification and exposure to grid modernisation spending",
    ],
    bearCase: [
      "Premium valuation (P/E ~18–20×) reflects the dividend reliability but limits total return potential — Fortis is a hold, not a value buy",
      "Rate case outcomes are not guaranteed — adverse regulatory decisions in any jurisdiction can compress allowed ROE and slow dividend growth",
      "A rising interest rate environment pressures utility valuations structurally: long-duration, bond-like cash flows are marked down as bond yields rise",
    ],
    canadianInvestorParagraph: "Fortis is as close to a guaranteed dividend grower as Canadian investors can find. Fifty years of consecutive increases through recessions, rate cycles, and energy transitions. The yield isn't the highest, but the certainty is: you can model dividend growth forward with more confidence than almost any other TSX stock. Ideal for TFSA income compounding where certainty matters more than maximum yield.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "50-year dividend growth streak plus eligible dividend tax treatment plus tax-free compounding — the trifecta for a core TFSA income holding." },
      rrsp:          { recommendation: "ideal",      reasoning: "Tax-deferred compounding of a reliably growing eligible dividend. Lower volatility than most equity holdings." },
      fhsa:          { recommendation: "good",       reasoning: "Low volatility and predictable income make this suitable for an FHSA regardless of time horizon." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend credit applies. The growing payout means the yield on cost in a non-reg account improves annually." },
    },
  },

  // ── REITs ───────────────────────────────────────────────────────────────

  "REI-UN.TO": {
    reviewType: "quick",
    bullCase: [
      "Largest Canadian retail REIT with an irreplaceable portfolio of grocery-anchored and urban mixed-use properties — anchor tenants like Loblaws and Sobeys provide recession-resistant foot traffic",
      "Active development pipeline converting surface parking and underperforming retail into residential condos and rentals — creates NAV above the current unit price",
      "~6% distribution yield backed by stable retail cash flows; grocery-anchored centres have proven resilient through both e-commerce disruption and COVID-19",
    ],
    bearCase: [
      "Retail REIT valuations remain structurally discounted as institutional capital questions long-term physical retail relevance — the discount to NAV may be persistent rather than cyclical",
      "Residential development projects are capital-intensive, long-duration, and subject to condo market cycles — Toronto presale slowdown is a near-term headwind",
      "REIT distributions include return of capital and other income components that are taxed less favourably than eligible dividends outside of registered accounts",
    ],
    canadianInvestorParagraph: "RioCan's mixed-use strategy is the right long-term move — converting retail land into residential density in urban cores creates durable value. But the thesis requires patience. The 6% yield is well-covered by retail cash flows today. For Canadian investors, REITs are best held in a TFSA or RRSP because the distribution components (non-eligible dividends, return of capital) are less tax-efficient in a non-registered account than bank or energy dividends.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Shelters the non-eligible dividend and return-of-capital components from tax — these are the least efficient distribution types in non-reg." },
      rrsp:          { recommendation: "ideal",      reasoning: "REIT distributions are fully tax-deferred inside an RRSP — the most appropriate registered account for REITs." },
      fhsa:          { recommendation: "acceptable", reasoning: "Development risk and retail uncertainty add volatility; a shorter FHSA horizon may not allow recovery from a price correction." },
      nonRegistered: { recommendation: "avoid",      reasoning: "Non-eligible dividend and return-of-capital portions are taxed at full marginal rate — significantly less efficient than eligible dividends from banks or energy companies." },
    },
  },

  "CAR-UN.TO": {
    reviewType: "quick",
    bullCase: [
      "Canada's largest residential apartment REIT with 65,000+ suites across major urban centres — exposure to a structural housing shortage that is not resolving quickly",
      "Consistently high occupancy (98%+) with strong same-property NOI growth as below-market rents on turnover units reset to market rates",
      "Diversified across province and unit type — apartments, townhomes, manufactured housing — reducing concentration risk vs single-market apartment REITs",
    ],
    bearCase: [
      "Rent control in Ontario and BC limits the pace at which in-place rents can be raised on existing tenants — growth is gated to turnover, which is slow in a tight housing market",
      "Rising cap rates from higher interest rates compress NAV; CAPREIT has traded at a persistent discount to IFRS NAV for multiple years",
      "European portfolio (Netherlands) adds currency and regulatory complexity that is not core to the Canadian investor thesis",
    ],
    canadianInvestorParagraph: "CAPREIT is a straightforward bet on Canada's chronic housing shortage. People need to live somewhere, and the supply of apartments in major cities is not growing fast enough to meet demand — that's durable pricing power for a well-run residential landlord. Like all REITs, it's best held in a TFSA or RRSP to shelter the distribution from tax.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "REIT distributions sheltered from tax — no T3 slip on distribution components. Best account type for REITs." },
      rrsp:          { recommendation: "ideal",      reasoning: "Tax-deferred compounding of residential real estate cash flows — equivalent to owning an apartment building without the landlord headaches." },
      fhsa:          { recommendation: "acceptable", reasoning: "NAV discount and cap rate sensitivity add near-term price risk for an FHSA holder planning to buy within a few years." },
      nonRegistered: { recommendation: "avoid",      reasoning: "Distribution taxed at full marginal rate in non-reg; hold in TFSA or RRSP instead to maximise after-tax return." },
    },
  },

  // ── Technology ──────────────────────────────────────────────────────────

  "SHOP.TO": {
    reviewType: "deep",
    bullCase: [
      "The operating system of global e-commerce — 4+ million merchants, 15%+ share of US e-commerce, and growing penetration in international markets where e-commerce is still early",
      "Payments and financial services (Shopify Payments, Shopify Capital) are the highest-margin, highest-growth segment — merchants that use Shopify Payments generate 3× the GMV of those who don't",
      "The enterprise pivot (Shopify Plus) and offline (POS) expansion are real revenue diversification levers that the market has not fully priced in",
    ],
    bearCase: [
      "At 100× earnings, the valuation prices in a decade of flawless execution — any deceleration in GMV growth triggers multiple compression that overwhelms fundamental progress",
      "Amazon, WooCommerce, and BigCommerce are permanent competitive threats with deeper capital resources; no switching moat prevents merchant churn if a competitor undercuts on fees",
      "Sold Shopify Logistics at a loss — a reminder that management will experiment with capital-intensive bets that can dilute shareholder returns",
    ],
    canadianInvestorParagraph: "Shopify is the most globally significant company Canada has ever produced. It's pure growth — no dividend, no buyback — which means it belongs in a TFSA for tax-free capital appreciation rather than a non-registered account where capital gains are taxed. For a Canadian investor, this is the highest-growth TSX name available. Position sizing matters: the valuation is unforgiving of slowdowns.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "No dividend means no withholding risk; all returns are capital gains, which compound entirely tax-free inside a TFSA." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred capital appreciation. Lower priority than dividend payers in RRSP since capital gains already receive preferential tax treatment." },
      fhsa:          { recommendation: "good",       reasoning: "High growth potential in a tax-free vehicle — strong FHSA candidate if the time horizon is 3+ years." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Capital gains taxed at 50% inclusion rate on disposition — less efficient than TFSA but better than dividend income treatment." },
    },
  },

  "CSU.TO": {
    reviewType: "quick",
    bullCase: [
      "Mark Leonard's capital allocation system — acquire vertical market software businesses at fair prices, extract operational improvements, never sell — has compounded at 35%+ CAGR since IPO",
      "Vertical market software has exceptional retention characteristics: a municipal government or hospital system does not switch ERP providers lightly — switching costs are a durable moat",
      "Constellation has expanded the acquisition mandate to larger deals and new geographies (Europe, Latam) as the North American VMS market matures — runway is genuinely long",
    ],
    bearCase: [
      "At current prices, CSU is one of the most expensive stocks on the TSX (P/E effectively embedded in organic growth + M&A returns that are hard to underwrite from outside)",
      "Mark Leonard stepping back from day-to-day operations introduces key-person risk even if the institutional system is well-embedded",
      "Rising private equity competition for VMS acquisitions is compressing the multiple-arbitrage that historically drove CSU's returns",
    ],
    canadianInvestorParagraph: "Constellation Software is the closest thing Canadian investors have to a Berkshire Hathaway — a capital allocation machine that compounds quietly and has never once needed to explain itself to the market. There's no dividend, no buyback, no analyst guidance. Just acquisitions. For a TFSA, it's an extraordinary compounder: you simply buy it and leave it. The only question is whether the price already reflects the next decade of great acquisitions.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "No dividend means no tax drag; all value creation is capital appreciation compounding tax-free. The perfect TFSA compounder." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred capital appreciation. Works well as a long-term RRSP holding." },
      fhsa:          { recommendation: "good",       reasoning: "Strong compounder for a 3–5 year FHSA horizon — high conviction required given the valuation." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Capital gains on disposition taxed at 50% inclusion, but buy-and-hold strategy minimises realisation events." },
    },
  },

  "OTEX.TO": {
    reviewType: "quick",
    bullCase: [
      "Enterprise content management and information management software with a sticky, recurring revenue base — over 80% of revenue is recurring (subscriptions + maintenance)",
      "Micro Focus acquisition (completed 2023) added $3B+ of revenue and significant cross-sell opportunity into Micro Focus's installed base of legacy enterprise software customers",
      "Private cloud and managed services growth is accelerating as enterprise customers move off on-premise deployments — higher-margin, lower-churn revenue model",
    ],
    bearCase: [
      "Micro Focus integration is complex and has already experienced execution challenges — the deal was large relative to OpenText's size and digestion takes time",
      "Legacy enterprise software businesses carry secular decline risk as younger SaaS alternatives erode market share over time",
      "High debt from the Micro Focus acquisition limits near-term buyback and dividend growth capacity until free cash flow pays it down",
    ],
    canadianInvestorParagraph: "OpenText is Canada's enterprise software company — not glamorous, not fast-growing, but deeply embedded in the workflow of large corporations worldwide. The Micro Focus bet is either the catalyst for re-rating (successful integration + synergies) or a multi-year drag (complex integration, debt). The 4%+ dividend yield is paid from recurring software cash flows, and the Canadian listing means eligible dividends for TFSA and non-reg holders.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Eligible dividends compound tax-free. The integration overhang makes the entry valuation attractive — buying uncertainty in a tax-free account." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred income and capital appreciation as integration plays out." },
      fhsa:          { recommendation: "acceptable", reasoning: "Integration risk and debt overhang add near-term uncertainty for a shorter FHSA horizon." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend credit applies. Buying depressed valuation in non-reg is fine if conviction is high." },
    },
  },

  // ── Precious Metals ─────────────────────────────────────────────────────

  "ABX.TO": {
    reviewType: "quick",
    bullCase: [
      "World's second-largest gold producer with top-tier Nevada assets (Nevada Gold Mines JV with Newmont) — the most profitable and longest-life mines on earth",
      "Copper assets (Lumwana, Reko Diq development) provide genuine energy-transition exposure — copper demand from electrification is structural and long-duration",
      "Balance sheet transformation under Mark Bristow: net debt eliminated, dividend tied to gold price, focus on Tier 1 assets only",
    ],
    bearCase: [
      "African and Middle Eastern asset base (Tanzania, Saudi Arabia, Côte d'Ivoire, Pakistan's Reko Diq) carries operational and geopolitical risk that Canadian investors cannot fully underwrite",
      "Cost inflation at large open-pit mines has persistently exceeded guidance — AISC has risen despite operational improvements",
      "Relative underperformance vs gold price: ABX shares have lagged the gold price over most 5-year periods, raising the question of whether royalty companies (FNV, WPM) are a better way to own gold",
    ],
    canadianInvestorParagraph: "Barrick is the name most Canadian investors think of first for gold exposure — and it's earned that position through balance sheet discipline under Bristow. But the jurisdictional complexity is real and Barrick trades at a discount to AEM or FNV partly because of it. For a Canadian investor who wants gold mining exposure and doesn't mind geopolitical risk in the portfolio, ABX at a lower multiple than AEM is the trade. Eligible dividends help the after-tax math.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "TSX-listed eligible dividend plus gold price optionality in a tax-free account — strong TFSA candidate for precious metals exposure." },
      rrsp:          { recommendation: "ideal",      reasoning: "Gold miners are volatile — tax-deferred compounding inside an RRSP smooths the tax impact of that volatility." },
      fhsa:          { recommendation: "good",       reasoning: "Gold exposure as a hedge and eligible dividends work in an FHSA, though mining volatility warrants modest sizing." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend credit applies. The commodity nature means capital gains/losses can be tax-loss harvested tactically in non-reg." },
    },
  },

  "AEM.TO": {
    reviewType: "deep",
    bullCase: [
      "Best jurisdictional profile in senior gold mining — Canada (Ontario, Quebec, Nunavut), Finland, Mexico, and Australia — virtually no political risk vs peers",
      "Yamana acquisition (2023) added high-quality, low-cost mines in Canada and Australia that integrate seamlessly with the existing portfolio and cultural DNA",
      "Consistently delivers production and cost guidance — exceptional operational execution is priced into the premium multiple and has been earned over years",
    ],
    bearCase: [
      "Premium multiple (highest P/NAV in senior gold) leaves no room for operational disappointment — any guidance miss triggers outsized price reaction",
      "Growth through M&A has worked well historically, but the universe of quality assets at reasonable prices is shrinking — future deals may require paying up",
      "Gold price sensitivity is unavoidable; a sustained period of gold below $1,800/oz would compress margins even at AEM's low cost structure",
    ],
    canadianInvestorParagraph: "Agnico Eagle is the gold miner Canadian investors should own if they want quality over quantity. No Africa, no Latin America dictator risk, no geopolitical coin-flip — just well-run mines in Canada, Finland, Mexico, and Australia. The premium is justified by the track record. For a TFSA, AEM is the highest-quality gold mining anchor. Combined with FNV (royalty) you get a balanced precious metals position with different risk profiles.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Highest-quality gold producer, Canadian-listed eligible dividend, no withholding. The gold allocation for a TFSA." },
      rrsp:          { recommendation: "ideal",      reasoning: "Premium quality mining company in a tax-deferred vehicle — ideal for riding gold cycles without tax friction." },
      fhsa:          { recommendation: "good",       reasoning: "Quality and stability (for a gold miner) makes AEM more FHSA-appropriate than peers. Still volatile — size accordingly." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend credit applies. Lower geopolitical risk means fewer surprise write-downs in a taxable account." },
    },
  },

  "FNV.TO": {
    reviewType: "deep",
    bullCase: [
      "Royalty and streaming model means FNV owns a percentage of revenue from mines without bearing operating costs or capital expenditures — the purest, highest-margin gold exposure available",
      "Diversified across 400+ royalties and streams with no single asset above ~20% of revenue — genuinely uncorrelated risk vs single-mine operators",
      "Gold, silver, platinum group metals, and oil royalties provide commodity diversification within the precious metals sector; oil royalties provide income support when gold is weak",
    ],
    bearCase: [
      "Cobre Panama (copper/gold) stream is suspended following government shutdown of the mine in 2023 — this was FNV's largest single asset and its absence materially impacts near-term cash flow",
      "Premium valuation (P/CF consistently above peers) means any streaming model structural critique or gold price weakness amplifies the downside",
      "FNV has no operational leverage to lower costs — what you see is what you get; upside beyond gold price appreciation is limited vs operators",
    ],
    canadianInvestorParagraph: "Franco-Nevada is the gold investment for investors who don't want to worry about mines. You own a royalty on someone else's problem. The Cobre Panama suspension is a genuine near-term headwind — that stream was 15%+ of revenue at its peak — but it also represents optionality: if the mine reopens under a new framework, FNV gets the upside. The lowest-risk way to own gold in a TFSA.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Lowest-risk precious metals exposure, Canadian-listed eligible dividend, tax-free compounding. Strong TFSA anchor for the gold allocation." },
      rrsp:          { recommendation: "ideal",      reasoning: "Royalty model's low volatility makes it ideal inside a registered account — compound the royalty stream tax-deferred." },
      fhsa:          { recommendation: "good",       reasoning: "Lower volatility than miners makes FNV more FHSA-appropriate for the precious metals allocation." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend plus lower tax-loss events (royalty model has fewer write-downs) makes non-reg reasonable for FNV." },
    },
  },

  "WPM.TO": {
    reviewType: "quick",
    bullCase: [
      "The world's largest silver streaming company, also with significant gold, cobalt, and palladium streams — a precious metals portfolio in one security",
      "Silver exposure is the key differentiation vs FNV — if industrial silver demand from solar panels and EV charging accelerates, WPM is uniquely positioned among streamers",
      "Low fixed costs from streaming model: WPM's upfront payment is sunk — every dollar of silver or gold above the stream price goes straight to cash flow",
    ],
    bearCase: [
      "Dual-listed on NYSE (WPM) and TSX (WPM.TO) — Canadian investors holding the US-listed shares in a TFSA face 15% IRS withholding on dividends; ensure you hold the TSX-listed shares",
      "Silver price volatility is higher than gold — if silver industrial demand disappoints, silver prices can fall faster than gold and WPM underperforms",
      "High valuation premium to peers limits absolute return potential if precious metals enter a prolonged sideways period",
    ],
    canadianInvestorParagraph: "Wheaton is the silver-forward streaming bet — if you believe in silver's role in the energy transition (solar cells use ~100g of silver each), WPM is the most efficient way to own that thesis without operating risk. Critical note for Canadian investors: hold WPM.TO (the TSX-listed shares), not WPM on NYSE, inside your TFSA. The TSX listing pays eligible dividends with no US withholding. The NYSE listing will cost you 15% withholding every quarter.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "TSX-listed WPM.TO = Canadian eligible dividend, no IRS withholding. This is the critical point — hold WPM.TO not WPM in a TFSA." },
      rrsp:          { recommendation: "ideal",      reasoning: "Streaming model's cash flow stability is ideal for RRSP compounding. Either listing works in RRSP (treaty exempts withholding)." },
      fhsa:          { recommendation: "good",       reasoning: "Hold WPM.TO (TSX listing) in FHSA to avoid withholding. Silver's higher volatility means modest sizing." },
      nonRegistered: { recommendation: "good",       reasoning: "TSX-listed eligible dividend applies. The tax treatment is materially better than the NYSE-listed equivalent." },
    },
  },

  "K.TO": {
    reviewType: "quick",
    bullCase: [
      "Americas-focused portfolio (Nevada, Alaska, Brazil) with improving operational track record following the exit from higher-risk African assets",
      "Strong recent operational momentum — production guidance met or beat for multiple consecutive quarters after years of underperformance vs peers",
      "At lower gold prices the stock compresses, making current entry (after a run) potentially attractive if you believe the gold cycle has more to go",
    ],
    bearCase: [
      "Highest cost structure among senior gold producers — AISC above $1,300/oz means Kinross is leveraged to gold price and vulnerable to margin compression on pullbacks",
      "Maricunga (Chile) and Lobo-Marte (Chile) development projects are large capital commitments in a jurisdiction with growing resource nationalism risk",
      "History of acquisitions at cycle peaks that required subsequent write-downs — capital allocation track record is weaker than AEM or FNV",
    ],
    canadianInvestorParagraph: "Kinross is the highest-risk, highest-beta gold miner in this portfolio — when gold runs, KGC runs harder; when gold falls, KGC falls harder. The score reflects strong momentum rather than fundamental quality. Investors who want a gold mining allocation but are buying late in the gold cycle might prefer AEM or FNV for quality; Kinross is the name for those who want maximum leverage to the gold price with acceptable jurisdiction risk.",
    accountFit: {
      tfsa:          { recommendation: "good",       reasoning: "Higher volatility warrants modest sizing in a TFSA. The eligible dividend and tax-free compounding are attractive but position carefully." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred treatment smooths the volatility impact. Better inside registered accounts than non-reg for a high-beta miner." },
      fhsa:          { recommendation: "acceptable", reasoning: "Higher volatility and cost-structure risk make this a secondary FHSA consideration — prefer AEM or FNV for precious metals in FHSA." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Capital losses from volatility can be harvested in non-reg. Eligible dividend applies but position size should be smaller than quality miners." },
    },
  },

  // ── US Holdings ─────────────────────────────────────────────────────────

  "AAPL": {
    reviewType: "quick",
    bullCase: [
      "Services revenue (App Store, Apple TV+, Apple Pay, iCloud) now exceeds 25% of total revenue and carries ~70% gross margins — the installed base of 2B+ devices is the moat that generates this engine",
      "iPhone upgrade cycle in emerging markets (India as the next China) represents a multi-year growth vector as Apple expands manufacturing and distribution",
      "Capital return program is unmatched: $110B+ buyback authorisation in 2024 — share count declining every quarter, mechanically lifting EPS even without revenue growth",
    ],
    bearCase: [
      "China revenue (~18% of total) is structurally at risk from geopolitical pressure and domestic competition (Huawei comeback in premium segment)",
      "At 39× normalised earnings, Apple is priced for continued Services growth acceleration — any structural slowdown in App Store monetisation triggers meaningful re-rating",
      "Regulatory risk across EU (Digital Markets Act forcing alternative app stores) and DOJ antitrust probe could structurally alter the App Store economics",
    ],
    canadianInvestorParagraph: "Apple is the most widely held US stock in Canadian TFSA and RRSP accounts for good reason — it's the safest large-cap bet on global consumer technology. The dividend is tiny (0.5%), so the TFSA withholding penalty is minimal. The real return is capital appreciation. For Canadian investors: hold Apple in your RRSP to be safe (treaty eliminates withholding on the small dividend) or TFSA (the 15% withholding on a 0.5% yield costs you 0.075% per year — immaterial).",
    accountFit: {
      tfsa:          { recommendation: "good",       reasoning: "Dividend yield is <0.5% so the 15% US withholding costs you less than 0.1% per year — essentially negligible. TFSA is fine for Apple." },
      rrsp:          { recommendation: "ideal",      reasoning: "US-Canada tax treaty eliminates the 15% withholding on the small dividend. Ideal for large US equity positions." },
      fhsa:          { recommendation: "good",       reasoning: "Quality and low-volatility US large-cap makes Apple a reasonable FHSA holding for longer horizons." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Small dividend taxed at non-eligible rate (15% withholding + marginal rate). Capital gains taxed at 50% inclusion. Still a good long-term hold." },
    },
  },

  "MSFT": {
    reviewType: "deep",
    bullCase: [
      "Azure cloud is the second-largest cloud platform globally and growing faster than AWS — enterprise relationships (Teams, Office 365, Dynamics) create switching costs that accelerate Azure adoption",
      "OpenAI partnership and Copilot monetisation across Office 365, GitHub, and Azure creates multiple new revenue vectors that are already contributing to results",
      "Gaming (Activision Blizzard acquisition closed 2023) + LinkedIn + Bing create diversified revenue streams that reduce concentration in any single market",
    ],
    bearCase: [
      "Azure revenue growth deceleration from the hyper-growth phase is inevitable — the question is whether AI monetisation offsets the law of large numbers in cloud",
      "Copilot pricing ($30/user/month) is proving hard to justify for many SMBs and enterprises — AI add-on attach rates have been lower than expected in initial rollouts",
      "Antitrust scrutiny on Activision and potential future gaming market dominance concerns add regulatory overhead",
    ],
    canadianInvestorParagraph: "Microsoft is the highest-quality large-cap technology company in the world by most measures — durable competitive advantages, recurring revenue, exceptional capital allocation, and genuine AI leadership. The dividend is small (~0.8%) so US withholding is immaterial. For Canadian investors, MSFT belongs in the core allocation of every TFSA or RRSP alongside Canadian names. Hold in RRSP to be tax-optimal; TFSA is fine given the tiny yield.",
    accountFit: {
      tfsa:          { recommendation: "good",       reasoning: "0.8% dividend means ~0.12% annual withholding cost — effectively negligible. TFSA works well for MSFT capital appreciation." },
      rrsp:          { recommendation: "ideal",      reasoning: "Treaty eliminates withholding; pure capital appreciation compounding tax-deferred. Textbook RRSP US large-cap holding." },
      fhsa:          { recommendation: "good",       reasoning: "Quality and modest volatility make MSFT reasonable for FHSA time horizons of 3–5 years." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Small dividend + capital gains tax makes it workable in non-reg; better in RRSP/TFSA for most Canadian investors." },
    },
  },

  "NVDA": {
    reviewType: "deep",
    bullCase: [
      "Dominant GPU architecture for AI training and inference — CUDA ecosystem lock-in means switching costs are as high as any software company despite being hardware",
      "Data centre revenue growing 400%+ YoY at peak; even at normalised growth rates the company is building a durable franchise in the infrastructure layer of the AI economy",
      "H100, H200, and B200 GPU demand is constrained by TSMC capacity, not by customer demand — backlog extends years and pricing power is exceptional",
    ],
    bearCase: [
      "At 90–100× earnings, the market is pricing in Nvidia maintaining near-monopoly margins in a market that AMD, Intel, and custom silicon (Google TPU, Amazon Trainium) are all attacking",
      "AI capex could slow materially if enterprise ROI on AI deployments disappoints — Nvidia is the most leveraged stock to AI investment cycle continuation",
      "US export controls on H100/H200/B200 to China remove a material revenue stream and could expand to other geographies",
    ],
    canadianInvestorParagraph: "Nvidia is the most exciting — and most dangerous — large-cap on this list. The AI infrastructure thesis is real. The valuation already reflects it. For Canadian investors who believe AI is a multi-decade platform shift, NVDA is the pick, but sizing conservatively is essential. The dividend is ~0.03% so US withholding is essentially zero. Hold in TFSA for tax-free growth; RRSP for treaty-optimal treatment.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "No meaningful dividend so no withholding tax. Pure capital appreciation compounding tax-free. TFSA is perfect for a high-growth US position." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred capital appreciation. Treaty advantage on the dividend is meaningless at 0.03% yield." },
      fhsa:          { recommendation: "acceptable", reasoning: "Very high valuation and volatility make NVDA a risky FHSA holding — position very small if at all." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Capital gains tax on appreciation but gains may be very large. Consider tax-lot management strategy in non-reg." },
    },
  },

  "GOOGL": {
    reviewType: "quick",
    bullCase: [
      "Search advertising generates $175B+ in revenue annually with ~50% operating margins — the most profitable digital advertising machine ever built, now integrating AI overviews at scale",
      "Google Cloud is the fastest-growing hyperscaler at the margin, now profitable, and uniquely positioned in AI (Gemini, TPUs, Vertex AI) to attract AI-native workloads",
      "YouTube, Waymo, and DeepMind represent optionality that is effectively free at the current multiple vs the core Search and Cloud businesses",
    ],
    bearCase: [
      "AI overviews (featured snippets that answer queries without a click) could structurally reduce Search click-through rates and advertising revenue over time — the one genuine existential risk to the core business",
      "DOJ antitrust ruling (2024) found Google illegally maintained its Search monopoly — remedies could include mandated default search placement changes that reduce query volume",
      "YouTube Shorts monetisation lags TikTok; if short-form continues shifting viewing time, ad rates compress",
    ],
    canadianInvestorParagraph: "Alphabet is trading at the cheapest multiple of the US mega-caps despite generating some of the highest operating margins. The AI Search risk is real but also priced in — if the antitrust remedy is benign and AI overviews grow the ad market rather than shrinking it, Alphabet is the most attractive valuation in US mega-cap tech. No dividend means US withholding is zero. Ideal TFSA holding.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "No dividend means zero withholding tax. All returns are capital appreciation compounding tax-free. Among the best US large-caps for a TFSA." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred capital appreciation without withholding considerations (no dividend). Strong RRSP candidate." },
      fhsa:          { recommendation: "good",       reasoning: "Reasonable 3–5 year appreciation potential at current valuation; no withholding drag." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Capital gains tax only (no dividend tax). Manageable in non-reg but better in TFSA." },
    },
  },

  "BRK.B": {
    reviewType: "quick",
    bullCase: [
      "Insurance float ($170B+) provides essentially free leverage that Buffett and Munger's successors (Greg Abel) invest in equities and wholly-owned businesses at consistently above-average returns",
      "Apple stake alone (~$175B at recent prices) provides meaningful AAPL exposure; combined with BNSF Railway, Berkshire Energy, and GEICO, BRK is a diversified US economy ETF with better-than-index capital allocation",
      "Massive buyback programme ($66B+ in 2023-2024) at below intrinsic value creates mechanical shareholder value accumulation that requires no growth thesis to believe in",
    ],
    bearCase: [
      "Warren Buffett is 93 — succession to Greg Abel creates management transition risk even if the institutional processes are well-established",
      "At $350B+ of cash and equivalents, Berkshire is struggling to deploy capital at scale — the bigger it gets, the harder it is to generate above-average returns on incremental capital",
      "No dividend means no current income for investors who need it; BRK.B is purely a capital appreciation investment",
    ],
    canadianInvestorParagraph: "Berkshire is the ultimate set-it-and-forget-it US equity holding for Canadian investors who don't want to think about it. No dividend, so no withholding tax. Greg Abel is a Edmontonian (Canadian!) who has run Berkshire Energy flawlessly. The intrinsic value grows approximately 10-12% annually through book value increase and buybacks. Holds in any account type — TFSA is ideal since capital appreciation is tax-free.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "No dividend means zero withholding tax. Capital appreciation compounds entirely tax-free. Perfect TFSA US equity position." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred capital appreciation; no withholding considerations. Solid RRSP anchor." },
      fhsa:          { recommendation: "good",       reasoning: "Low volatility for a US equity; reasonable FHSA holding for 3–5 year horizons." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Capital gains on disposition; no dividend drag. Works in non-reg but TFSA is better." },
    },
  },

  // ── Mid-cap ─────────────────────────────────────────────────────────────

  "ATD.TO": {
    reviewType: "quick",
    bullCase: [
      "Largest convenience store operator in North America (~17,000 stores) and second globally, with a proven M&A platform that has compounded returns at above-market rates for 25+ years",
      "Fuel retailing margins are structurally high in the convenience format — Couche-Tard's Circle K brand has pricing power and real estate moats competitors cannot easily replicate",
      "The attempted TotalEnergies acquisition, while unsuccessful, confirmed management's ambition to consolidate global convenience and fuel retail — the pipeline of smaller deals continues",
    ],
    bearCase: [
      "EV transition is the long-term structural risk: convenience stores generate a large share of revenue from fuel sales; if fuelling stops at petrol stations and moves to home/work charging, ATD's traffic model changes",
      "TSX-only listing means Finnhub fundamental data is sparse — most of our Score factors show N/A because Couche-Tard's financials aren't in Finnhub's free tier coverage",
      "Family control (Bouchard family) and Québec cultural identity create acquisition complexity for any hostile bidder, but also limit governance oversight for minority shareholders",
    ],
    canadianInvestorParagraph: "Couche-Tard is one of the best-run retailers in the world, hiding in plain sight on the TSX. If you bought $10,000 worth of ATD 20 years ago it's worth $400,000+ today. The EV thesis is the one genuine long-term risk, but the company is actively building EV charging infrastructure to hedge it. No dividend (tiny), so this is a capital appreciation play — TFSA is the right account.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Tiny dividend means negligible withholding. All returns are capital appreciation compounding tax-free in a TFSA. Strong long-term TFSA compounder." },
      rrsp:          { recommendation: "good",       reasoning: "Tax-deferred capital appreciation in a proven compounder. Solid RRSP holding." },
      fhsa:          { recommendation: "good",       reasoning: "25-year compounding record makes ATD a reasonable FHSA bet for 3–5 year horizons." },
      nonRegistered: { recommendation: "acceptable", reasoning: "Capital gains on disposition. Works in non-reg but TFSA gives you the full return tax-free." },
    },
  },

  "WCN.TO": {
    reviewType: "quick",
    bullCase: [
      "Waste collection and disposal is one of the most durable oligopolies in North America — haulers hold permanent, exclusive contracts with municipalities, and permitting for new landfills is nearly impossible",
      "Strong pricing power: regulated rate increases plus surcharges on fuel and environmental compliance create near-inflation-linked revenue growth without volume risk",
      "Canadian management (based in the Woodlands, Texas) with a disciplined acquisition culture — Waste Connections consistently generates above-peer returns on acquired assets",
    ],
    bearCase: [
      "Premium P/E (~35×) reflects the durability of the business but limits upside if the acquisition pipeline dries up or pricing power weakens",
      "US-focused revenue (75%+) makes this effectively a US business — Canadian investors get USD earnings that are converted back, introducing FX risk",
      "Landfill capacity is a finite resource; as existing landfills approach closure, environmental permitting for new sites is politically contentious",
    ],
    canadianInvestorParagraph: "Waste Connections is the most boring, most consistent compounder on this list. Literally everyone generates garbage; municipalities need it removed; Waste Connections has the trucks, the routes, and the landfills. It's dual-listed on TSX and NYSE (same WCN ticker). The dividend is small (~0.8%) and eligible on the TSX listing. Primary attraction is steady capital appreciation from a durable business.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Eligible dividend (TSX-listed) plus steady capital appreciation, tax-free. Quality TFSA compounder in the defensive-growth category." },
      rrsp:          { recommendation: "ideal",      reasoning: "Tax-deferred compounding of a durable, inflation-linked business. Excellent RRSP anchor." },
      fhsa:          { recommendation: "good",       reasoning: "Low volatility for an equity; appropriate FHSA holding for 3–5 year horizons." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend applies on TSX-listed shares. Steady appreciation with low capital gains realisation events." },
    },
  },

  "MFC.TO": {
    reviewType: "quick",
    bullCase: [
      "Largest Canadian life insurer with deep penetration in Asia (Hong Kong, China, Southeast Asia) — demographic tailwinds from an ageing middle class across Asia are a multi-decade growth engine",
      "Wealth and asset management division is growing faster than the insurance core — Manulife Investment Management manages $850B+ and generates high-margin, capital-light fee income",
      "Core EPS growth guidance of 10–12% CAGR is credible given Asia expansion, expense discipline, and the shift toward higher-quality in-force business",
    ],
    bearCase: [
      "Hong Kong and China exposure (~25% of earnings) carries significant geopolitical risk — US-China tensions, regulatory changes in Hong Kong, and economic weakness in China all threaten the core Asia growth thesis",
      "Long-tail insurance liabilities mean Manulife carries interest rate sensitivity in both directions — rising rates hurt new sales but help existing book; management is complex",
      "Legacy variable annuity guaranteed products in North America remain a tail risk — they performed better through COVID but remain exposed to equity market crashes",
    ],
    canadianInvestorParagraph: "Manulife is Canada's Asian growth bet — you buy it because you believe in a rising Asian middle class wanting life insurance and wealth management products. The Asia exposure is both the thesis and the risk. The eligible dividend and ~5% yield make it an income holding as well. For Canadian investors, it's a diversification play that adds EM-adjacent growth without direct EM volatility.",
    accountFit: {
      tfsa:          { recommendation: "ideal",      reasoning: "Eligible dividends plus Asia growth potential compound tax-free. Attractive TFSA choice for diversification beyond banks and energy." },
      rrsp:          { recommendation: "ideal",      reasoning: "Tax-deferred compounding of a growing eligible dividend with significant Asia upside. Core RRSP holding." },
      fhsa:          { recommendation: "good",       reasoning: "Good yield and dividend growth make MFC suitable for FHSA if comfortable with Asia EM risk." },
      nonRegistered: { recommendation: "good",       reasoning: "Eligible dividend credit applies. Asia volatility can create tax-loss harvesting opportunities in a non-reg account." },
    },
  },
};

// ---------------------------------------------------------------------------
// Patch Sanity
// ---------------------------------------------------------------------------
async function main() {
  console.log("Populating editorial content for stockFiles — " + new Date().toISOString());
  console.log("Note: Content reflects publicly available information as of mid-2025.");
  console.log("Tom should review each stock before publishing.\n");

  const stocks = await sanity.fetch(`*[_type == "stockFile"] { _id, ticker }`);
  console.log(`Found ${stocks.length} stockFiles in Sanity\n`);

  let updated = 0, skipped = 0;

  for (const { _id, ticker } of stocks) {
    const data = CONTENT[ticker];
    if (!data) {
      console.log(`  ⏭  ${ticker.padEnd(12)} — no editorial data in this script (keeping DRAFT)`);
      skipped++;
      continue;
    }

    await sanity.patch(_id).set({
      reviewType:                data.reviewType,
      bullCase:                  data.bullCase,
      bearCase:                  data.bearCase,
      canadianInvestorParagraph: data.canadianInvestorParagraph,
      accountFit:                data.accountFit,
      editorNotes:               "Content drafted by AI (mid-2025 knowledge). Review accuracy and voice before publishing — especially bull/bear points and any recent corporate events.",
    }).commit();

    console.log(`  ✅ ${ticker}`);
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}  Skipped: ${skipped}`);
  console.log("\nNext steps:");
  console.log("  1. Review each stockFile in /studio before setting reviewType to 'deep'");
  console.log("  2. Refine voice to match AlphaBeat's style (direct, numerate, Canadian lens)");
  console.log("  3. Check for any corporate events after mid-2025 that change the thesis");
}

main().catch(err => { console.error(err); process.exit(1); });
