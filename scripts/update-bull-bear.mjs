/**
 * scripts/update-bull-bear.mjs
 *
 * Updates bull/bear cases for all 30 canonical AlphaBeat stocks
 * using research from Q1 2026 earnings, analyst reports, and news.
 *
 * Usage: node scripts/update-bull-bear.mjs
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
// Research-based bull/bear cases — sourced from Q1 2026 earnings & analysts
// ---------------------------------------------------------------------------
const CONTENT = {

  // ── Canadian Banks ──────────────────────────────────────────────────────

  "RY.TO": {
    bullCase: [
      "Q1 2026 adjusted EPS of C$4.08 rose 13% year-over-year, with full-year 2025 net income of C$19.9B (+25%), making RBC Canada's most profitable bank — the CET1 ratio of 13.7% is well above the 11.5% regulatory minimum and supports ongoing buybacks.",
      "The completed HSBC Canada acquisition continues to generate integration synergies expected to be fully realized by end of fiscal 2026, adding wealth management clients and deepening RBC's dominance in the premium Canadian banking segment.",
      "Quarterly dividend hiked C$0.10 to C$1.64 per share (payable February 2026), continuing over a decade of growth — the ~3.0% yield compounds entirely tax-free inside a TFSA as an eligible Canadian dividend.",
    ],
    bearCase: [
      "RBC's $400B+ domestic mortgage book is the largest of any Canadian bank — the highest single concentration of credit risk in a housing market facing elevated household debt and potential price correction in 2026.",
      "At analyst consensus price targets of C$216–$245, the stock trades near full value with 0–5% implied upside and the most expensive forward P/E among the Big Six, leaving no margin of safety if execution disappoints.",
      "PCL provisions remain a watch item as Canadian consumer credit stress builds; any meaningful spike in impaired loans from the mortgage book would pressure the premium valuation the market currently awards RBC.",
    ],
  },

  "TD.TO": {
    bullCase: [
      "Q1 2026 adjusted EPS of C$2.44 beat the C$2.26 consensus by 8%, and the Schwab stake divestiture added ~150 bps to the CET1 ratio (now ~14.7%), funding a C$8B share buyback program that has helped TD recover over 70% from its 2024 lows.",
      "TD trades at a forward P/E of ~10.4x — a meaningful discount to RBC and BMO — providing a margin of safety and potential re-rating catalyst once the U.S. asset cap is lifted, currently expected no earlier than 2027.",
      "Quarterly dividend raised to C$1.08 per share (a 2.9% hike), offering a ~3.3% eligible dividend yield that compounds tax-free in a TFSA while investors wait for the regulatory overhang to clear.",
    ],
    bearCase: [
      "The U.S. asset cap of US$434B imposed by regulators remains in place until at least 2027, structurally limiting TD's ability to grow its most important non-Canadian business line for an extended period.",
      "TD spent C$507M on AML remediation in fiscal 2025 and expects a similar spend in 2026, with the total tab from the US$3B criminal/regulatory settlement and ongoing compliance infrastructure weighing on returns.",
      "The U.S. Retail segment's profitability recovery is back-half-2026 loaded — any new regulatory findings or delayed asset-cap removal timeline could reset analyst expectations and keep the valuation discount entrenched.",
    ],
  },

  "BMO.TO": {
    bullCase: [
      "Q1 2026 net income of C$2.41B rose 16% year-over-year with EPS of C$3.39, and PCL dropped sharply to C$746M from C$1.01B as credit quality stabilized — gross impaired loans fell C$228M quarter-over-quarter.",
      "BMO targets 15%+ ROE by 2027 per its March 2026 investor day, with U.S. balance-sheet optimization ~90% complete and commercial loan growth expected to accelerate in H2 2026, while the CET1 ratio of 13.1% provides capital flexibility.",
      "Dividend hiked C$0.04 to C$1.67 per share in Q1 2026, with a 10-year average dividend growth rate of 7.4% and no cuts — making BMO a reliable TFSA income compounder with a yield above 4%.",
    ],
    bearCase: [
      "BMO's large U.S. footprint carries concentrated exposure to U.S. commercial real estate and consumer credit — segments under stress — and the credit card impaired rate stands at an elevated 6%.",
      "The bank's ROE recovery lags peers; its U.S. segment is delivering flatter ROE expansion than its Canadian operations, and meeting the 15%+ ROE target by 2027 depends on a constructive macro environment.",
      "At analyst consensus targets of C$195–$219, BMO's valuation has partially re-rated, leaving less room for error if U.S. commercial loan quality deteriorates or the Canadian economy softens.",
    ],
  },

  "BNS.TO": {
    bullCase: [
      "Q1 2026 net income more than doubled to C$2.16B (EPS C$1.74 vs C$0.82 in Q1 2025), driven by broad revenue growth and strategic divestitures, while the CET1 ratio improved 10 bps to 13.3% quarter-over-quarter.",
      "Scotiabank's strategic pivot is gaining traction — it exited Colombia, Costa Rica, and Panama by selling to Davivienda, cemented a 15% stake in U.S. regional bank KeyCorp, and opened a Dallas office, concentrating capital in higher-return North American markets.",
      "BNS offers the highest dividend yield (~4.3%, at C$1.10/quarter) of the Big Six, particularly compelling for TFSA income investors, with analyst consensus projecting ~C$6.05 EPS for fiscal 2026 — up ~4.9% from prior quarter estimates.",
    ],
    bearCase: [
      "Despite strategic repositioning, over 40% of revenue still comes from Latin American operations where currency volatility, political risk, and elevated consumer PCL remain persistent headwinds.",
      "The dividend payout ratio of ~76% is the highest among the Big Six, raising sustainability questions if earnings disappoint — analyst consensus is merely Hold with an average price target implying ~5–6% downside from recent prices.",
      "The 15% KeyCorp stake ties Scotiabank to a mid-sized U.S. regional bank facing its own stress from commercial real estate and deposit competition, adding a new layer of credit and market risk.",
    ],
  },

  "CM.TO": {
    bullCase: [
      "Record Q1 2026 adjusted EPS of C$2.76 (vs C$2.40 consensus), with Capital Markets revenue surging 28% and corporate/investment banking revenues jumping 40%, demonstrating CIBC's successful diversification beyond its domestic mortgage concentration.",
      "CET1 ratio of 13.4% supports the quarterly dividend raised C$0.10 to C$1.07 per share — marking nine consecutive years of dividend growth with a conservative mid-40% payout ratio, a reliable TFSA income holding.",
      "CIBC's U.S. commercial banking segment delivered 62% earnings growth in fiscal 2025, and the focus on affluent Canadian clients and mid-market U.S. commercial lending offers a credible path to further multiple expansion from its historically discounted valuation.",
    ],
    bearCase: [
      "CIBC's ~C$273B Canadian residential mortgage book faces the highest payment-shock risk among Big Six peers — roughly 6% of mortgages face payment increases of 40%+ upon renewal in 2026 alone.",
      "PCL provisions rose approximately 44% in 2025 as CIBC built reserves against a softening domestic economy; any acceleration in Canadian unemployment or housing price declines would disproportionately hit CIBC.",
      "With analyst consensus targets around C$137 after a ~58% one-year run, the valuation re-rating has largely occurred — with mortgage renewal risk peaking in 2026, incremental upside depends on flawless credit execution in a slowing economy.",
    ],
  },

  // ── Energy ──────────────────────────────────────────────────────────────

  "ENB.TO": {
    bullCase: [
      "Full-year 2025 revenue grew 22% to CA$65.2B and net income 39% to CA$7.04B, while the 31st consecutive dividend increase brings the annualized rate to CA$3.88/share and 2026 EBITDA guidance of CA$20.2B–$20.8B was reaffirmed.",
      "Approximately $8B of new projects enter service in 2026 across all four business segments, and the secured project backlog has grown to CA$39B, supporting management's ~5% annual EBITDA/EPS/DCF growth outlook through the decade.",
      "The Canadian government approved Enbridge's $4B Sunrise Expansion Program on the Westcoast natural gas pipeline system in B.C., adding regulated fee-based volume backed by long-term contracts as LNG Canada demand ramps up.",
    ],
    bearCase: [
      "Debt/EBITDA of ~4.9x sits above the stated target range, and EPS forecasts for 2025–2026 have been revised down to $2.95/$3.18 due to rising depreciation and interest expenses from the US$14B Dominion gas utility acquisitions.",
      "Line 5 in Michigan remains an unresolved binary risk — tribal groups are appealing in the Michigan Supreme Court, opponents are challenging the Army Corps' February 2026 Final EIS, and the EGLE permit is not expected until mid-July 2026 at the earliest.",
      "The CA$10B 2026 capex plan must be funded through ongoing capital market access — any credit spread widening or equity market disruption could increase the all-in cost of capital and compress DCF per share.",
    ],
  },

  "CNQ.TO": {
    bullCase: [
      "2026 production guidance of 1,615–1,665 MBOE/d represents ~4% growth from 2025 with a 25-consecutive-year dividend growth streak (annualized CA$2.35/share) and CA$9.0B returned to shareholders in 2025 via dividends and buybacks.",
      "CA$6.3B liquidity with investment-grade ratings from DBRS, Moody's, and Fitch provides balance sheet resilience through oil price cycles, and the FCF allocation policy returns 60–100% of free cash flow to shareholders depending on net debt levels.",
      "Long-life, low-decline oil sands assets provide a pathway to an additional 745,000 BOE/d of growth from existing projects without large new greenfield capital commitments, delivering some of the lowest per-barrel sustaining capital costs in the industry.",
    ],
    bearCase: [
      "Analyst consensus projects 2026 EPS to fall to $2.28 from $2.51 in 2025 — a 9.2% decline — as WTI pricing assumptions have been cut to ~US$60/barrel from US$70+ due to Trump tariff-driven demand concerns.",
      "WCS-WTI heavy oil differentials are structurally influenced by Trans Mountain Expansion throughput ramp-up and U.S. refinery demand; any tariff escalation targeting Canadian energy could widen the spread and compress realized prices.",
      "CA$6.88B in 2026 capital expenditures faces execution risk across a large multi-asset portfolio; a prolonged period below US$60 WTI would erode free cash flow and could force CNQ to moderate its shareholder return program.",
    ],
  },

  "SU.TO": {
    bullCase: [
      "Record Q1 2026 upstream production and refinery utilization of 108%, with net earnings rising to CA$2.1B from CA$1.69B a year earlier — monthly share buybacks raised from CA$275M to CA$350M, implying nearly CA$4B in total 2026 repurchases.",
      "Suncor's multi-year roadmap targets a US$2B increase in normalized free funds flow and a WTI breakeven reduction to ~US$38/barrel by 2028, underpinned by its fully integrated oil sands-to-retail model that naturally hedges upstream and downstream margins.",
      "Full-year 2025 upstream production reached a record 909,000 barrels per day with 108% refinery utilization, and 2026 guidance of 840,000–870,000 BOE/d points to sustained high-volume output with 100,000 BOE/d additional growth targeted by 2028.",
    ],
    bearCase: [
      "Earnings are highly sensitive to WTI — Q2 2025 EPS fell to CA$0.51 from CA$0.91 in Q1 2025 as WTI softened, and analysts have trimmed 2026 price deck assumptions to ~US$62/barrel, directly compressing free funds flow.",
      "The US$38/barrel breakeven target is a 2028 goal — in the interim, CA$5.6B–$5.8B in 2026 capital expenditures must be financed through current cash flows, and any environmental incident at oil sands facilities could again disrupt production.",
      "U.S. tariffs create indirect risk: if they slow North American economic growth and reduce fuel demand, refined product crack spreads would compress, directly hurting Suncor's downstream segment that contributed meaningfully to the 108% refinery utilization advantage.",
    ],
  },

  "TRP.TO": {
    bullCase: [
      "Q1 2026 comparable EBITDA rose 14% year-over-year to CA$3.09B, and TC Energy reaffirmed full-year 2026 EBITDA guidance of CA$11.6B–$11.8B (~7% growth), raising the quarterly dividend 3.2% to CA$0.8775/share — its 26th consecutive annual increase.",
      "The NGTL System set an all-time single-day delivery record of 18.3 Bcf on January 22, 2026, and TC Energy is extending its 5–7% annual comparable EBITDA growth outlook through 2028, supported by ~CA$4B of capital entering service in 2026 including Bison XPress and Bruce Power Unit 3.",
      "Post the South Bow liquids pipeline spinoff, TC Energy is now a pure-play natural gas and power infrastructure company with reduced commodity exposure, while new commercial agreements for Coastal GasLink Phase 2 and an Indigenous ownership framework for NGTL would lower cost of capital.",
    ],
    bearCase: [
      "Coastal GasLink has experienced cost overruns from an original CA$6.6B budget to ~CA$14.5B, and as of early 2026 ongoing regulatory delays from B.C. groundwater protection concerns and First Nations litigation risk inflating costs a further CA$2–3B while delaying cash flow recovery.",
      "TC Energy carries ~CA$60B in total debt with debt/EBITDA of ~4.8x — while asset sales have helped deleverage, softer AECO basis differentials (averaging CA$1.20/GJ in March 2026) pressure realized tolls on the NGTL system.",
      "Post-federal election regulatory shifts in Canada could tighten emissions rules on natural gas infrastructure, and TC Energy's Southeast Gateway Pipeline in Mexico adds cross-border political and contract risk not fully reflected in consensus estimates.",
    ],
  },

  "BCE.TO": {
    bullCase: [
      "The 2025 dividend reset to CA$1.75/share annually (from CA$3.99) freed cash flow — 2025 free cash flow grew 10% YoY to CA$3.2B, allowing BCE to target a net debt leverage ratio of 3.5x by end of 2027 down from ~3.8x currently.",
      "BCE completed the acquisition of Ziply Fiber on August 1, 2025 for ~CA$5.0B (US$3.65B), adding a fast-growing U.S. Pacific Northwest fibre footprint that diversifies revenue beyond the increasingly CRTC-regulated Canadian market, with a new FiberCo JV with PSP Investments to monetize infrastructure.",
      "Q1 2026 revenue grew 4.0% YoY to CA$6.17B and net income rose 3.7% to CA$653M, with BCE targeting a sustainable dividend payout ratio of 40–55% of FCF by 2028 — a reset that eliminates the structural overpay that made the former yield unsustainable.",
    ],
    bearCase: [
      "The CRTC's wholesale access mandate enables MVNO competitors without heavy debt loads to launch price wars, compressing BCE's Canadian wireless and broadband ARPU and margins — S&P Global maintains a Negative outlook on BCE's credit ratings.",
      "Ziply Fiber added ~CA$2.6B in assumed net debt on top of the CA$5.0B cash outlay, with Morningstar and analysts seeing limited near-term synergies between BCE's Canadian operations and a U.S. regional fibre provider, raising capital allocation concerns when leverage is already elevated.",
      "BCE's CRTC wholesale broadband framework, aggressive promotional pricing from Rogers and digital entrants, and a slowing Canadian economy threaten the subscriber and ARPU growth needed to rebuild FCF toward the 40–55% payout ratio target by 2028.",
    ],
  },

  "T.TO": {
    bullCase: [
      "TELUS added 288,000 total mobile and fixed customers in Q3 2025, expanding its base to nearly 21 million connections (up 5% YoY), and projects a minimum 10% compound annual FCF growth rate from 2026 to 2028 with 2026 FCF expected to rise to ~CA$2.4B.",
      "TELUS is targeting leverage reduction from 3.5x (Q3 2025) to 3.3x by end-2026 and 3.0x by late 2027, while maintaining a CA$0.4184/share quarterly dividend — the dividend growth pause preserves cash to accelerate deleveraging.",
      "TELUS's CA$70B five-year network investment plan across 5G, fibre, and AI infrastructure positions it as Canada's leading converged operator; TELUS Health and TELUS Agriculture verticals provide recurring non-telecom revenue streams less exposed to CRTC wholesale pricing decisions.",
    ],
    bearCase: [
      "TELUS paused its dividend growth program in December 2025 because its 2025 dividend obligation of ~CA$2.61B represents ~118% of free cash flow — a payout ratio 87% above its 10-year median — and a further dividend cut cannot be ruled out if 10%+ FCF CAGR targets are missed.",
      "The CRTC wholesale broadband decision expected in 2026 could force TELUS to open its fibre network to competitors at regulated rates, compressing the return on its multi-billion-dollar PureFibre buildout and undercutting the subscriber economics that justify the CA$70B infrastructure spend.",
      "TELUS carries a net debt/EBITDA ratio of 3.5x with heavy capex through the fibre and 5G buildout cycle — any sustained wireless ARPU decline from ongoing promotional pricing competition would slow FCF ramp and delay the path to a sustainable sub-100% dividend payout ratio.",
    ],
  },

  "FTS.TO": {
    bullCase: [
      "Fortis unveiled a record CA$28.8B five-year capital plan (2026–2030) in February 2026, implying 7% annualized rate base growth from CA$42.4B to CA$57.9B by 2030, and reaffirmed 4–6% annual dividend growth guidance — extending a remarkable 52-consecutive-year dividend increase track record.",
      "2025 adjusted EPS of CA$3.53 rose ~7.6% excluding FX, with ~79% of the capital plan being low-risk, rate-base-driven spending across regulated North American utilities funded primarily by operating cash flow and regulated utility debt.",
      "Operating across 10 North American utilities with ~60% of rate base in the U.S., Fortis gives Canadian investors built-in USD exposure and inflation-linked rate base growth, while diversified regulatory jurisdictions reduce single-regulator concentration risk.",
    ],
    bearCase: [
      "Total debt of ~CA$33.8B, net debt/EBITDA of ~6.0x, and interest coverage of only 2.4x EBIT mean the CA$28.8B capital plan requires sustained debt issuance — higher-for-longer rates raise refinancing costs and increase new project financing expenses.",
      "Levered free cash flow is negative at ~CA$2.32B over the trailing twelve months — Fortis is entirely dependent on regulatory rate increases and capital markets access to fund dividends and capex, and an adverse rate case in Arizona or New York could slow dividend growth below the 4–6% guidance range.",
      "A significant portion of earnings comes from U.S. utilities, making CAD-reported results vulnerable to a stronger Canadian dollar — CAD appreciation against USD directly reduces the reported value of U.S. earnings and can slow dividend growth even when underlying utility operations perform as expected.",
    ],
  },

  // ── Precious Metals ─────────────────────────────────────────────────────

  "ABX.TO": {
    bullCase: [
      "The Mali Loulo-Gounkoto settlement (paying $430M to resolve disputes) restores operational control of a mine capable of producing ~362,500 oz in 2026, recovering a key asset that was suspended through most of 2025.",
      "Full-year 2025 production of 3.26M oz generated record operating cash flow of $2.73B and free cash flow of $1.62B, demonstrating strong leverage to gold — analysts at Goldman and CIBC forecast 50–80% YoY EPS growth for 2025–2026.",
      "The Reko Diq copper-gold project in Pakistan (Barrick 50% stake) is expected to be one of the world's five largest copper mines producing ~800,000 tonnes of copper concentrate per year from late 2028, adding meaningful long-duration diversification.",
    ],
    bearCase: [
      "2026 gold AISC guidance of $1,760–$1,950/oz is materially higher than the $1,637/oz achieved in 2025, with cost inflation from energy, labour, and royalties compressing margins even at elevated gold prices.",
      "2026 attributable gold production guidance of 2.9–3.25M oz is below 2025's 3.26M oz due to mine sequencing and the Hemlo/Tongon divestitures, meaning volume growth is flat to negative near-term.",
      "Reko Diq construction is being slowed due to rising security concerns in Pakistan, raising execution risk on the project that underpins Barrick's long-term copper growth thesis.",
    ],
  },

  "AEM.TO": {
    bullCase: [
      "Record 2025 annual free cash flow of $4.4B on 3.45M oz produced at AISC of $1,339/oz gave Agnico a cash operating margin of ~$1,800/oz — the company captured ~95% of every incremental gold price dollar due to its low, stable cost structure.",
      "Mineral reserves grew 2% to 55.4M oz in 2025, indicated resources rose 10% to 47.1M oz, and inferred resources climbed 15% to 41.8M oz — the Detour Lake underground conversion alone added 3.47M oz of indicated resources at 2.04 g/t, underpinning a growth path to 4M+ oz by the early 2030s.",
      "Dividend raised 12.5% following 2025 results, total 2025 shareholder returns of $1.4B, and CA$14B committed to Ontario operations through 2030 — signalling durable capital return alongside organic reinvestment.",
    ],
    bearCase: [
      "2026 AISC guidance midpoint of $1,475/oz is ~10% above 2025's $1,339/oz, with ~60% of the increase driven by higher royalty costs and a strengthening Canadian dollar — a structural cost headwind Agnico cannot easily control.",
      "2026 production guidance of 3.3–3.5M oz is essentially flat versus 3.45M oz achieved in 2025, meaning near-term growth is constrained by mine sequencing and lower grades at certain operations.",
      "At ~$220/share and a $256 analyst consensus target implying only ~16% upside, the stock already trades at a significant premium to peers, leaving limited margin of safety if gold prices retreat or costs overshoot guidance.",
    ],
  },

  "FNV.TO": {
    bullCase: [
      "Record Q1 2026 revenue of $648.5M with net income of $468.6M and EPS of $2.43 demonstrate the royalty/streaming model's exceptional leverage to gold — adjusted EBITDA margin sits at ~90.9% with zero operating cost inflation risk.",
      "Panama government approval for Cobre Panamá stockpile ore processing could contribute ~23,000 gold oz and 265,000 silver oz near-term, with a full mine restart having the potential to add 150,000–175,000 GEOs annually — upside not included in 2026 guidance of 510,000–570,000 GEOs.",
      "A diversified portfolio of 100+ royalties and streams across low-risk jurisdictions means no single mine creates outsized revenue risk, with forecast revenue growth of ~13.6% and earnings growth of ~14.7% annually supported by the existing asset base.",
    ],
    bearCase: [
      "Cobre Panamá — historically Franco-Nevada's single largest asset — remains suspended at full capacity with no definitive timeline for a full restart, limiting GEO output to 510,000–570,000 in 2026 versus the 700,000+ GEOs achievable with the mine fully operational.",
      "The stock's five-year earnings CAGR is actually negative at -6.3% per year despite recent one-year EPS growth of 101%, meaning the 2025 surge largely reflects gold price tailwinds rather than durable compounding, raising questions about long-term earnings power.",
      "Franco-Nevada has no operating control over its royalty assets — any production curtailment, cost overrun, or operator dispute at a key mine directly reduces revenue with no operational levers to pull.",
    ],
  },

  "WPM.TO": {
    bullCase: [
      "The $4.3B Antamina silver stream acquired from BHP (effective April 1, 2026) doubles Wheaton's Antamina silver entitlement to 67.5% and adds ~70,000 GEOs annually, driving 2026 guidance of 860,000–940,000 GEOs — a 24%+ increase from 2025's 692,000 GEOs.",
      "2025 cash costs averaged $514/GEO against an average realized price above $3,500/GEO, producing a cash operating margin of ~$3,040/oz — an extraordinary profitability profile that scales directly with gold and silver prices.",
      "Long-term production target of 1.2M GEOs by 2030 implies ~50% growth from 2025 levels with no mine-building capital risk, as Wheaton's streaming model funds partners' capital expenditures upfront in exchange for fixed-cost metal deliveries.",
    ],
    bearCase: [
      "The $4.3B Antamina upfront payment — the largest streaming deal ever by consideration — materially stretches Wheaton's balance sheet, increasing leverage risk if gold/silver prices decline significantly before the stream cash flows ramp up.",
      "Q4 2025 cash costs per GEO spiked to $597/oz (versus $438 in 2024), an increase of 36% in one year, suggesting the low-cost streaming narrative is under pressure as legacy contracts reset at higher ongoing payment rates.",
      "Note for Canadian investors: hold WPM.TO (TSX-listed) not WPM (NYSE-listed) inside your TFSA — the TSX listing pays eligible dividends with no U.S. 15% IRS withholding, whereas the NYSE listing costs you withholding tax every quarter.",
    ],
  },

  "K.TO": {
    bullCase: [
      "Q1 2026 EPS of $0.70 more than doubled the $0.30 in Q1 2025, and 2026 AISC guidance of $1,380–$1,480/oz against gold at $3,300+/oz implies record-level operating margins — full-year production is guided at 2.1–2.3M oz.",
      "The Great Bear project in Ontario — with a PEA showing after-tax NPV of $1.9B at $1,900/oz gold and IRR of 24.3%, targeting 500,000+ oz/year production at ~$800/oz AISC for the first eight years — received accelerated provincial permitting status and began decline construction in 2026.",
      "A strong balance sheet and active debt repayment position Kinross to self-fund Great Bear's $1.4B capex without dilutive equity issuance, while stable 2.0M oz guidance through 2027–2028 provides near-term cash flow visibility.",
    ],
    bearCase: [
      "At gold prices of $4,500/oz, AISC rises to $1,730/oz — a significant jump from base guidance — indicating substantial cost sensitivity and limiting the incremental margin benefit from any further gold price appreciation.",
      "Great Bear's first production is not expected until ~2029 following a two-year construction period, meaning investors must underwrite $1.4B in capex and multi-year execution risk before seeing meaningful production from the company's primary growth asset.",
      "Kinross has material exposure to geopolitically sensitive jurisdictions (West Africa), and with production essentially flat at ~2.0M oz through 2028, near-term organic growth beyond gold price is limited.",
    ],
  },

  // ── REITs ───────────────────────────────────────────────────────────────

  "REI-UN.TO": {
    bullCase: [
      "Full-year 2025 retail occupancy reached 98.5% with new leasing spreads of 37.3% and blended leasing spreads of 21.1%, reflecting exceptional demand for RioCan's urban Canadian retail properties and structural supply constraints in key markets.",
      "Units trade at ~10x 2025 FFO and a 26% discount to NAV of $24.90/unit, offering a substantial valuation cushion with a 5.8% monthly distribution yield backed by contractually escalating rents across 225+ grocery- and necessity-anchored properties.",
      "Capital recycling of $1.3–1.4B from exiting non-core residential assets is being redeployed into debt reduction (adjusted debt/EBITDA improved to 8.6x in 2025) and higher-returning retail reinvestment, with management guiding ≥3.5% annual Core FFO/unit growth through 2028.",
    ],
    bearCase: [
      "Adjusted debt-to-EBITDA of 8.6x remains elevated, leaving distributions and growth spending vulnerable if refinancing costs rise or same-property NOI growth decelerates from its current 3.6% pace in a higher-for-longer rate environment.",
      "The HBC (Hudson's Bay Company) liquidation and ongoing retailer consolidation could leave vacant anchor space in several RioCan centres, temporarily reducing occupancy and NOI from the near-perfect 98.5% level achieved in 2025.",
      "Near-term Core FFO/unit growth is expected to be moderated by ~1.5% due to refinancing headwinds, meaning actual growth of ~3.5% limits the near-term total return case for unit-holders.",
    ],
  },

  "CAR-UN.TO": {
    bullCase: [
      "NAV per unit grew to $56.41 at year-end 2025 while units trade near $43 — a ~24% discount to NAV — and CAPREIT repurchased 4.7M units at ~$43 in 2025 (spending $294M on buybacks), delivering accretive per-unit value creation at a significant discount.",
      "Same-property occupancy of 97.3% with average monthly rent of $1,718 (up 3.8% YoY) demonstrates resilient demand, and two-plus year tenures are marking-to-market at ~+20%, signalling embedded future rent upside as units turn over.",
      "The $2B divestiture of non-core assets completed in 2025 sharpened the portfolio to higher-quality Canadian urban apartments, improving operating margins, reducing capital intensity, and growing diluted FFO/unit to $2.541.",
    ],
    bearCase: [
      "Ontario's 2026 rent increase guideline is capped at 2.1%, limiting organic revenue growth on existing tenancies in CAPREIT's largest market — management guided only 2–3% revenue growth for 2026, barely above inflation.",
      "Short-duration lease mark-to-market is running approximately -8% in some segments, meaning near-term lease renewals are occurring below market as affordability constraints and tenant retention incentives cap rent capture.",
      "Operating expense growth is expected to run above inflation in 2026, squeezing NOI margins on a portfolio where revenue growth is already constrained by rent control legislation.",
    ],
  },

  // ── Tech ────────────────────────────────────────────────────────────────

  "SHOP.TO": {
    bullCase: [
      "Merchant Solutions (payments, shipping, capital) now represents 73% of revenue growing 35% in Q4 2025, while Shop Pay GMV surged 62% YoY and B2B GMV grew 96% in 2025 — Shopify controls ~14% of U.S. e-commerce with deep platform network effects.",
      "FCF of $2.01B demonstrates Shopify has crossed the profitability threshold, and its asset-light model means FCF margins can expand rapidly as revenue scales — 38 of 39 covering analysts rate SHOP a Buy or Strong Buy.",
      "AI commerce tools (Sidekick, Catalog, Universal Commerce Protocol) are in early adoption phases and could materially lift merchant attach rates and average revenue per merchant over the next 2–3 years.",
    ],
    bearCase: [
      "SHOP stock is down ~33% from its highs YTD in 2026 partly due to tariff risks — Shopify's heavy reliance on cross-border GMV means U.S. trade policy directly compresses the payment processing fees that drive Merchant Solutions revenue.",
      "Shopify Capital's loan portfolio reached $1.73B in Q3 2025 with provisions of $148M — a consumer credit downturn would hit profitability hard and expose risk not well understood by Canadian retail investors accustomed to SHOP as a pure-growth story.",
      "Despite strong fundamentals, the stock trades at a significant premium to revenues — the lone analyst Sell rating argues the bear-case scenario implies ~$109 USD, essentially flat from current depressed levels.",
    ],
  },

  "CSU.TO": {
    bullCase: [
      "Constellation deployed ~CA$1.6B in acquisitions in the first 4.5 months of 2026 alone — more than all of 2025 — with LTM acquisitions as a percentage of FCFA2S crossing 100%, definitively refuting the bear thesis that CSU is too large to compound efficiently.",
      "Revenue grew 15% to CA$11.6B in 2025 with 6% organic growth, and analysts project adjusted EPS to nearly double from US$79 in 2024 to US$190 by 2030 — one of the highest-quality compounders on the TSX for long-term Canadian investors.",
      "CSU's vertical market software portfolio serves mission-critical government, healthcare, and infrastructure clients with near-100% revenue retention — feared AI-driven churn has not materialized, validating the stickiness of its niche SaaS businesses.",
    ],
    bearCase: [
      "Founder Mark Leonard resigned as President on September 25, 2025 for health reasons — an unplanned departure for a business where Leonard's capital allocation philosophy is essentially the product, creating genuine succession uncertainty.",
      "Maintenance and recurring revenue organic growth decelerated from 6% in Q4 2025 to 4% (FX-neutral) in Q1 2026 — below CSU's long-term average of 4.8% since 2019 — and initial cash returns on the 2024 acquisition cohort are tracking below historical norms.",
      "At a high P/E multiple with a 6.1% net margin, CSU offers minimal margin of safety on pure earnings metrics — in the bear case, multiple compression alone without any operational deterioration could generate flat to negative returns over a 2–3 year horizon.",
    ],
  },

  "OTEX.TO": {
    bullCase: [
      "OpenText trades at a trailing P/E of ~13.5x versus a U.S. software peer average of 23.1x, with a DCF fair value estimate of ~US$47.93 versus a current price of ~US$23.69 — a ~50% implied discount if the AI-driven content management thesis plays out.",
      "Three decades of enterprise content management expertise positions OpenText in the path of the agentic AI wave — enterprises require properly permissioned, organized data to run AI agents, and OTEX's secure content platforms address this structural need.",
      "OTEX maintains a 34% EBITDA margin and a sustainable dividend (63% payout ratio), providing income for Canadian investors while new CEO Ayman Antoun (who joined April 20, 2026) repositions the business toward cloud and AI.",
    ],
    bearCase: [
      "Net margin deteriorated from 12.2% to 8.4% over the past year while revenue has been essentially flat (US$1.33B in Q2 2025 vs US$1.33B in Q2 2026), suggesting the cloud transition is compressing profitability without delivering revenue growth.",
      "The stock is down ~38% from all-time highs, TD Securities cut its price target to $27 while maintaining a mere Hold, and organic growth has structurally decelerated — the market is skeptical that Micro Focus integration synergies will ever fully materialize.",
      "A new CEO with no established track record at OpenText, a preliminary revenue miss, and heavy debt from the Micro Focus acquisition create a fragile setup where any macro deterioration or cloud transition misstep could trigger further multiple compression.",
    ],
  },

  // ── Mid-cap ─────────────────────────────────────────────────────────────

  "ATD.TO": {
    bullCase: [
      "Q3 fiscal 2026 EPS of $0.82 (up 18% from $0.68 a year prior) on $21.8B revenue confirmed same-store sales growth across all geographies for two consecutive quarters, showing the core business is regaining momentum after a soft patch.",
      "The 'Core + More' long-term strategy (introduced February 2026) targets 4–5% annual total merchandise revenue CAGR through fiscal 2030, underpinned by foodservice expansion, fresh offerings, and digital/loyalty initiatives across ~16,800 global locations.",
      "Walking away from the $47B Seven & i bid in July 2025 freed Couche-Tard to pursue smaller, higher-return bolt-on acquisitions — the stock jumped 10%+ on withdrawal day, and analysts see a path to CA$100/share as the balance sheet strengthens.",
    ],
    bearCase: [
      "The failed Seven & i pursuit signals that mega-deal transformational M&A is likely off the table for several years, leaving Couche-Tard dependent on organic same-store growth of 2–3% CAGR and smaller tuck-in acquisitions to hit its fiscal 2030 targets.",
      "Electric vehicle adoption and structural fuel volume decline remain a long-term secular threat to the fuel gross profit that anchors store-traffic economics — fuel gross profit is guided to grow 'in line with inflation' through 2030, implying flat real volumes.",
      "Analyst price targets cluster at CA$79–90 versus long-term fair value estimates near CA$100 — the ~17.4x forward earnings premium assumes consistent execution on food service and digital transformation where Couche-Tard has limited historical track record.",
    ],
  },

  "WCN.TO": {
    bullCase: [
      "2025 revenue of $9.47B (up 6.1%) and adjusted EBITDA of $3.13B (33% margin) beat peers, with 2026 guidance of $9.90–9.95B revenue and $3.30–3.33B EBITDA — Q4 2025 core pricing accelerated to 6.4%, demonstrating durable pricing power.",
      "WCN's exclusive/restricted-market strategy serving secondary and suburban markets creates a structurally defensive revenue base with high customer retention and contractual CPI-plus escalators that competitors cannot easily undercut.",
      "Early deployment of AI-driven pricing tools, improving employee retention metrics, and strong special waste volumes in Q1 2026 signal operational leverage improvements that should support EBITDA margin expansion toward 34%+ over the medium term.",
    ],
    bearCase: [
      "Chiquita landfill remediation obligations are expected to cost $100–150M in 2026 alone, directly reducing free cash flow from the guided $1.40–1.45B range — analysts cut price targets across the Street after management raised its accrual in Q1 2026.",
      "WCN trades at a significant premium to intrinsic value consensus (~$198.75 fair value), pricing in consistent high-single-digit EBITDA growth — any macro-driven volume decline or margin miss could trigger meaningful multiple compression.",
      "Organic revenue growth of ~4–5% in a normalized environment is modest for a stock priced at a premium; M&A activity in 2025 totaled only $330M in annualized revenue from 19 deals, and the pipeline of sizable independent operators to acquire is shrinking as industry consolidation matures.",
    ],
  },

  "MFC.TO": {
    bullCase: [
      "Record 2025 core earnings of CA$7.5B (up 3% constant currency), Asia core earnings grew 24% YoY in Q4 2025 to $564M, and Q1 2026 Asia earnings rose another 22% YoY to $598M — with Asia now representing ~40% of total core earnings and growing fastest.",
      "2025 new business metrics were exceptional — APE sales up 14%, new business contractual service margin up 28%, and new business value up 18% — with EPS forecast to grow ~15.8% annually as the wealth management and insurance mix shifts to higher-margin Asia.",
      "Manulife returned ~CA$5.4B to shareholders in 2025 (72% of core earnings) via dividends and buybacks, with a target payout ratio of 65–75% of adjusted earnings, while Global WAM generates diversified fee-based revenues that reduce reliance on interest rate spreads.",
    ],
    bearCase: [
      "Q1 2026 core EPS of ~CA$1.09 missed some analyst estimates, with the U.S. segment facing headwinds from lower investment spreads and unfavorable insurance experience — a reminder that legacy North American life insurance operations remain structurally challenged.",
      "A strong Canadian dollar creates a material FX headwind on Manulife's USD- and HKD-denominated Asia earnings when reported in CAD, and sensitivity to global equity markets through AUM fee income adds volatility to reported results.",
      "Execution risk is rising as Manulife simultaneously manages an India JV restructuring, Vietnam asset sale, and Asia leadership changes — creating integration complexity and potential regulatory delay that could weigh on 2026–2027 new business targets.",
    ],
  },

  // ── US Holdings ─────────────────────────────────────────────────────────

  "AAPL": {
    bullCase: [
      "Apple Intelligence is driving an unprecedented hardware upgrade cycle — iPhone revenue surged 23% to $85.3B in Q1 FY2026 (its best quarter ever), with Greater China revenue up 38% to $25.5B, demonstrating that the AI supercycle thesis is materializing.",
      "Services revenue hit a record $30.0B in Q1 FY2026 (+14% YoY) with a 76.5% gross margin — the installed base monetization engine continues to grow faster than hardware, with a foldable iPhone launch in 2026 potentially adding $40–60B in annual revenue per Morgan Stanley.",
      "Wedbush analyst Dan Ives set a Street-high $350 price target in March 2026 (~37% upside at time of publishing), citing Apple Intelligence subscription potential and China rebound as catalysts that consensus models have yet to fully price in.",
    ],
    bearCase: [
      "At a ~33x P/E ratio — well above the 10-year average of 24.6x — Apple has zero room for execution errors; a multiple compression to historical norms alone would imply ~23% downside even without any fundamental deterioration.",
      "Apple Intelligence remains behind rivals in AI capability — if Siri's overhaul disappoints and the upgrade supercycle fails to materialize, growth could revert to low-single digits with mid-teens June quarter growth already priced in at current valuation.",
      "Tariff escalation between the U.S. and China remains a structural risk for Apple's supply chain and its largest growth market, with analysts setting bear-case targets as low as $200–$230.",
    ],
  },

  "MSFT": {
    bullCase: [
      "Microsoft's AI business surpassed an annualized revenue run rate of $37B (up 123% YoY), while Azure grew 40% in the most recent quarter and commercial remaining performance obligations nearly doubled to $627B — providing exceptional long-term revenue visibility.",
      "Forward P/E compressed from ~30x in Q2 2026 to ~22x in Q3 2026 as earnings outpace the share price, making valuation more compelling even as the AI thesis plays out — a rare combination of quality and improving affordability.",
      "The extended OpenAI partnership and Copilot integration across Microsoft 365 create a deeply embedded enterprise AI moat — Copilot adoption is accelerating with no credible near-term replacement across M365's 400M+ commercial seat base.",
    ],
    bearCase: [
      "Microsoft pledged $190B in AI capital expenditure for 2026 — a 61% jump from 2025 — with Q3 2026 CapEx already at $30.9B (+84% YoY), raising serious concerns that ROI will lag the buildout timeline and compress free cash flow for multiple years.",
      "Free cash flow is being aggressively consumed by infrastructure spending — if AI productivity gains don't materialize at scale for enterprise customers, margin pressure could weigh on the stock for multiple quarters despite strong top-line growth.",
      "Competitive encroachment from Amazon Bedrock, Google Vertex AI, and Anthropic's enterprise push threatens Azure's AI differentiation, while any deterioration in the OpenAI relationship would undermine Copilot's core product advantage.",
    ],
  },

  "NVDA": {
    bullCase: [
      "Bank of America raised its price target to $320 citing a $1.7 trillion 2030 AI data center TAM, with Nvidia's most recent quarter delivering $68.1B in revenue (+73% YoY) and Data Center revenue of $62.3B (+75% YoY) — the AI infrastructure build-out shows no signs of slowing.",
      "Sovereign AI deals in South Korea, Europe, and the UAE, combined with hyperscaler CapEx tracking 40% growth per Jensen Huang's guidance, signal durable multi-year demand well beyond the current Blackwell cycle into Vera Rubin.",
      "Nvidia's CUDA software ecosystem creates switching costs that Amazon Trainium and Google TPUs have not meaningfully overcome, sustaining pricing power and ~80%+ GPU market share in AI training workloads.",
    ],
    bearCase: [
      "A $4.5B charge from H20 export restrictions to China effectively removed a key revenue segment — any further U.S. export controls could structurally impair Nvidia's addressable market in its second-largest customer region.",
      "Hyperscaler CapEx growth consensus sits at ~10%, while Jensen Huang guides to 40% — if that gap closes via spending cuts, Nvidia's demand projections would need significant downward revision with no operational offset.",
      "A 'GPU debt cliff' risk is emerging: GPU-backed borrowers face tighter financing as next-generation systems pressure rental rates and residual-value assumptions, creating potential for a sharp order correction after the current Blackwell buildout cycle.",
    ],
  },

  "GOOGL": {
    bullCase: [
      "Google Cloud grew 48% to $17.7B in Q1 2026 with a $155B backlog, and total Cloud backlog nearly doubled sequentially to $462B — exceeding Alphabet's entire 2025 revenue of $402.8B — signalling years of locked-in revenue with no churn risk.",
      "Google Search revenue rose 19% to $60.4B in Q1 2026, demonstrating that AI Overviews are expanding the search franchise rather than cannibalizing it, while Gemini hit 750M monthly active users processing over 10 billion tokens per minute.",
      "Alphabet trades at a relative discount to Microsoft and Apple on a forward P/E basis after a 10% post-Q1 2026 earnings surge, with Waymo's commercial scaling and YouTube's ad growth providing additional optionality beyond the AI search core.",
    ],
    bearCase: [
      "Alphabet's CapEx is projected at $175B–$185B in 2026 vs $91.5B in 2025 — a near-doubling — compressing 2026 free cash flow consensus to ~$20.5B (down ~72% from 2025's $73.3B), raising serious ROI questions from institutional shareholders.",
      "The DOJ and 35 states filed appeals in February 2026 seeking structural remedies beyond Judge Mehta's September 2025 ruling, creating a multi-year overhang that could break up Google's default search distribution model.",
      "If AI-native search engines (Perplexity, ChatGPT Search) continue gaining share among younger users, Search's ~19% revenue growth rate could decelerate materially, threatening the engine that funds Alphabet's entire AI investment cycle.",
    ],
  },

  "BRK.B": {
    bullCase: [
      "Berkshire's cash pile hit a record $397.4B in Q1 2026 (up from $373B at year-end 2025), giving Greg Abel unmatched dry powder to deploy acquisitions at scale — as demonstrated by the $9.7B Occidental chemicals purchase in early 2026.",
      "The insurance hard cycle and GEICO's structural improvements support operating earnings compounding, with UBS maintaining a Buy rating and a $595 price target (~25% upside), citing Berkshire's unmatched balance sheet flexibility as unique among large-cap equities.",
      "Berkshire's diversified operating businesses (BNSF, BHE, insurance float) act as a natural recession hedge — the stock's historically lower volatility makes it a defensive anchor in portfolios during macro uncertainty through 2025–2026.",
    ],
    bearCase: [
      "Q4 2025 operating earnings fell 29% YoY to $10.2B, driven by a 54% collapse in insurance underwriting profits as GEICO's claims severity outpaced premium growth — undermining the core earnings engine that has historically driven per-share book value growth.",
      "Warren Buffett officially retired as CEO on January 1, 2026, handing the reins to Greg Abel — while capable, Berkshire has historically traded at a 'Buffett premium,' and any stumble in capital allocation under new leadership could trigger multiple compression.",
      "A $397B cash pile earning T-bill yields is a near-term drag on returns in a falling rate environment — if Abel cannot find large-scale acquisitions at attractive prices, Berkshire may underperform a simple S&P 500 index fund over a 3–5 year horizon.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Push to Sanity
// ---------------------------------------------------------------------------
async function main() {
  console.log("Updating bull/bear cases with 2025-2026 research — " + new Date().toISOString());
  console.log(`${Object.keys(CONTENT).length} stocks to update\n`);

  const stocks = await sanity.fetch(
    `*[_type == "stockFile" && ticker in $tickers] { _id, ticker }`,
    { tickers: Object.keys(CONTENT) }
  );

  console.log(`Found ${stocks.length} matching stockFiles in Sanity\n`);

  let updated = 0, notFound = 0;

  for (const { _id, ticker } of stocks) {
    const data = CONTENT[ticker];
    if (!data) continue;

    await sanity.patch(_id).set({
      bullCase:    data.bullCase,
      bearCase:    data.bearCase,
      reviewType:  "deep",
      editorNotes: "Bull/bear cases updated with live web research from Q1 2026 earnings, analyst reports, and news (May 2026). Review for voice and accuracy before publishing.",
    }).commit();

    console.log(`  ✅ ${ticker}`);
    updated++;
  }

  const found = stocks.map(s => s.ticker);
  for (const ticker of Object.keys(CONTENT)) {
    if (!found.includes(ticker)) {
      console.log(`  ⚠  ${ticker} — not found in Sanity (check ticker spelling)`);
      notFound++;
    }
  }

  console.log(`\nDone. Updated: ${updated}  Not found: ${notFound}`);
  console.log("All stocks now have reviewType: 'deep' and research-based bull/bear cases.");
}

main().catch(err => { console.error(err); process.exit(1); });
