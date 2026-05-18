/**
 * scripts/publish-playbooks.mjs
 * Creates all 3 Playbooks in Sanity from research data.
 * Usage: node scripts/publish-playbooks.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

const env       = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();
const sanity    = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

// Convert plain text with \n\n paragraphs to Sanity Portable Text blocks
function pt(text, keyPrefix = "p") {
  return text.split("\n\n").filter(s => s.trim()).map((para, i) => ({
    _type: "block", _key: `${keyPrefix}${i}`, style: "normal", markDefs: [],
    children: [{ _type: "span", _key: `${keyPrefix}${i}s`, text: para.trim(), marks: [] }],
  }));
}

// Resolve ticker → stockFile reference
async function refs(tickers) {
  if (!tickers?.length) return [];
  const docs = await sanity.fetch(
    `*[_type == "stockFile" && ticker in $tickers] { _id, ticker }`,
    { tickers }
  );
  return docs.map(d => ({ _type: "reference", _ref: d._id, _key: `ref-${d._id}` }));
}

// Build sections array from research data
async function buildSections(rawSections) {
  return Promise.all(rawSections.map(async (s, i) => ({
    _key:          `sec-${i}`,
    heading:       s.heading,
    body:          pt(s.body, `s${i}p`),
    relatedStocks: await refs(s.relatedStockTickers || []),
  })));
}

// ---------------------------------------------------------------------------
// Playbook data — from research agents
// ---------------------------------------------------------------------------

const PLAYBOOKS = [

  // ── 1. TFSA Asset Location ───────────────────────────────────────────────
  {
    id:             "pb-tfsa-asset-location",
    title:          "The TFSA Asset Location Playbook",
    slug:           "tfsa-asset-location",
    seoDescription: "Where to hold Canadian dividend stocks, REITs, US equities, and bonds across your TFSA, RRSP, FHSA, and non-registered accounts. 2025–2026 rules.",
    sections: [
      {
        heading: "The Core Rule: Account Type Beats Stock Picking",
        relatedStockTickers: ["REI-UN.TO", "CAR-UN.TO"],
        body: `Asset location — deciding which account holds which investment — is one of the highest-leverage decisions a Canadian DIY investor can make. It costs nothing to execute, requires no market prediction, and the benefit compounds every single year. Yet most investors focus almost entirely on stock selection and almost none on where those stocks sit.

Here is the core principle: every account type in Canada taxes investment income differently. A TFSA produces zero tax on withdrawal. An RRSP defers tax until withdrawal, when proceeds are taxed as ordinary income. A non-registered account taxes capital gains at 50% inclusion, eligible dividends at preferential rates via the gross-up mechanism, and interest income at your full marginal rate. The FHSA combines features of both: contributions are deductible like an RRSP, and qualifying withdrawals are tax-free like a TFSA.

The implication is direct: put your highest-tax, highest-growth assets into your TFSA. Put your US income-generating assets into your RRSP. Put your low-tax assets — capital gains stocks, Canadian eligible dividends — into your non-registered account if you have overflow. The FHSA sits atop all of this if you qualify, because it gives you a tax deduction on the way in and tax-free growth on the way out.

Consider the numbers. A $50,000 TFSA invested in a REIT yielding 6% annually generates $3,000 per year in distributions, all tax-free. That same $50,000 in a non-registered account at a 43% marginal rate (Ontario resident, ~$100,000 income) costs roughly $1,290 per year in income tax on those distributions, because REIT income is mostly ordinary income with no dividend tax credit. Over 20 years, the after-tax gap in this single decision is enormous. Asset location is not exciting. It is foundational.`,
      },
      {
        heading: "What Belongs in Your TFSA",
        relatedStockTickers: ["RY.TO", "ENB.TO", "BCE.TO", "TRP.TO", "FTS.TO", "REI-UN.TO", "CAR-UN.TO", "CSU.TO", "SHOP.TO"],
        body: `Your TFSA should hold assets with the highest tax drag in a non-registered account, and ideally assets with the highest expected nominal return. Tax-free compounding is most powerful when the returns being shielded are large. There are three primary categories.

First: Canadian eligible dividend stocks. These are stocks paying dividends designated as "eligible" under the Income Tax Act — meaning the payer is a large public corporation taxed at the general corporate rate. Eligible dividends are grossed up by 38% when declared on a tax return, and then a federal dividend tax credit of 15.0198% of the grossed-up amount is applied. While this mechanism reduces the effective personal tax rate compared to interest income, it still produces a meaningful annual tax bill in a non-registered account. Inside a TFSA, you collect the full dividend — no gross-up, no credit calculation needed, no tax. Examples: Royal Bank (RY.TO), Enbridge (ENB.TO), BCE (BCE.TO), Fortis (FTS.TO).

Second: REITs. Canadian REIT distributions are primarily composed of ordinary income — not eligible dividends — which makes them among the worst assets to hold in a non-registered account. That ordinary income component is taxed at your full marginal rate. Inside a TFSA, distributions land tax-free regardless of their composition. RioCan (REI-UN.TO) and Canadian Apartment Properties REIT (CAR-UN.TO) are commonly held for this reason.

Third: high-growth, low-dividend stocks where you expect large capital gains. Capital gains in a TFSA are completely tax-free. In a non-registered account, capital gains trigger a 50% inclusion rate. A stock that doubles inside your TFSA is all yours. A stock that doubles in a non-registered account at a 43% marginal rate results in you owing roughly 21.5% of the gain to CRA. Constellation Software (CSU.TO) and Shopify (SHOP.TO) are textbook examples — minimal dividends, historically explosive capital appreciation.

What does not belong in a TFSA: US-listed dividend stocks or ETFs (see the withholding tax section), foreign-withholding-heavy positions, or low-yield bonds that would be better deployed in an RRSP.`,
      },
      {
        heading: "TFSA Contribution Room: The Numbers You Need",
        relatedStockTickers: [],
        body: `The TFSA was introduced in 2009. Contribution room accumulates annually for every year you are a Canadian resident aged 18 or older, whether or not you actually open or contribute to a TFSA. Unused room carries forward indefinitely. Withdrawals are added back to your contribution room on January 1 of the following calendar year — not the same year you withdraw.

Annual limits by year: 2009–2012: $5,000/yr | 2013–2014: $5,500/yr | 2015: $10,000 | 2016–2018: $5,500/yr | 2019–2022: $6,000/yr | 2023–2024: $6,500/yr | 2025–2026: $7,000/yr.

Cumulative room as of January 1, 2026, for someone who was 18 or older in 2009 and has never contributed: $109,000. For someone who turned 18 in 2018, cumulative 2026 room is $55,000.

Overcontributing costs you 1% per month on the excess amount. Always check your available room via CRA My Account before contributing, especially if you re-contribute in the same calendar year you withdrew. The most common TFSA mistake is withdrawing $20,000 in June and recontributing it in October — that recontribution counts against your room until January 1 of the following year.

Wealthsimple and Questrade do not track your total TFSA room across all institutions. CRA My Account does. Check there.`,
      },
      {
        heading: "What Belongs in Your RRSP",
        relatedStockTickers: ["MSFT", "AAPL", "BRK.B", "GOOGL"],
        body: `The RRSP is best understood as a tax-deferral vehicle. Contributions reduce your taxable income today at your marginal rate; withdrawals in retirement are taxed as ordinary income. The key RRSP advantage over a TFSA is one that is invisible to most investors: the Canada-US tax treaty exempts RRSP accounts from US withholding tax on dividends.

This changes the math entirely. Under Article XXI of the Canada-US Income Tax Convention, an RRSP is treated as a pension or retirement plan, and US dividend withholding tax is waived on directly held US securities inside an RRSP. This exemption applies to direct US-listed stocks and US-listed ETFs. It does not apply to Canadian-listed funds that hold US stocks — the fund itself pays withholding at the fund level, and this cannot be recovered.

Practical implication: hold your US dividend payers directly inside your RRSP, not your TFSA. Microsoft (MSFT), Apple (AAPL), Berkshire Hathaway (BRK.B), Alphabet (GOOGL) — any US-listed security that pays dividends is better suited for the RRSP, where that 15% US withholding simply does not apply.

Beyond the withholding advantage, the RRSP is the right home for: bonds and fixed income (interest income taxed at full marginal rates in non-registered — deferring it is valuable); income trusts and royalty units (ordinary income distributions, same problem as REITs); and high-yield US ETFs held directly as US-listed securities.

The 2025 RRSP contribution limit is 18% of the prior year's earned income to a maximum of $32,490. Unused room accumulates indefinitely.`,
      },
      {
        heading: "The FHSA: The Best Account You Might Be Ignoring",
        relatedStockTickers: ["RY.TO", "TD.TO", "BMO.TO"],
        body: `The First Home Savings Account launched in April 2023 and is, for eligible Canadians, the most tax-efficient account structure available — beating even the TFSA for first-time buyers because it delivers both a deduction on the way in and tax-free growth and withdrawal on the way out.

Eligibility: You must be a Canadian resident, between 18 and 71, and a first-time home buyer. The CRA defines "first-time" broadly — you must not have owned and lived in a qualifying home as your principal residence at any point in the current calendar year or the preceding four calendar years. If you owned a home six years ago but have been renting since, you likely qualify.

Contribution mechanics: The annual contribution limit is $8,000. The lifetime limit is $40,000. Unused room carries forward, but only one year at a time. If you open the account in 2025 and contribute $3,000, your 2026 room is $8,000 (new year) + $5,000 (2025 carryforward) = $13,000. You cannot accumulate unlimited carryforward room.

Tax treatment: Contributions are deductible from taxable income in the year made. Growth inside the FHSA is tax-free. Qualifying withdrawals to buy a first home are completely tax-free. If you never buy a home, you can transfer the FHSA balance to your RRSP with no tax consequences and no impact on RRSP contribution room.

Combined power: You can use both the FHSA and the RRSP Home Buyers' Plan (HBP) on the same home purchase. The 2024 budget raised the HBP limit to $60,000. Combined: $40,000 FHSA + $60,000 HBP = $100,000 of registered account funds available for a down payment, with no repayment required on the FHSA portion.`,
      },
      {
        heading: "The US Withholding Trap Inside Your TFSA",
        relatedStockTickers: ["AAPL", "MSFT", "BRK.B"],
        body: `This is the most commonly misunderstood tax rule affecting Canadian retail investors, and it costs millions of dollars in aggregate every year. The rule is straightforward: the United States levies a 15% withholding tax on dividends paid to Canadians. Inside a TFSA, that 15% is gone forever. You cannot claim a foreign tax credit because you have no Canadian tax liability to offset against it. You cannot recover it at all.

Here is a concrete example. You hold $30,000 of a US-listed dividend ETF inside your TFSA. The ETF's dividend yield is 1.5%, generating $450 per year in distributions. The US withholds 15% before the dividend reaches your account, so you receive $382.50 instead of $450. That $67.50 disappears permanently. At a 4% yield, on a $30,000 position, the annual drag is $180. Over 20 years, compounded, this is a meaningful cost.

Contrast this with the RRSP: the Canada-US treaty explicitly exempts RRSPs from US withholding tax on direct holdings. That same $30,000 ETF in an RRSP receives the full $450, zero withheld.

One nuance: if you hold a Canadian-listed ETF that invests in US stocks (VFV.TO, XSP.TO), that ETF itself pays US withholding at the fund level regardless of whether it sits in your TFSA or RRSP. The treaty exemption applies only to direct US-listed holdings in an RRSP. So the optimal structure for US dividend exposure is: US-listed ETF or US stocks directly inside an RRSP.

Bottom line: do not hold US-listed dividend stocks or high-yield US ETFs in your TFSA. Move them to your RRSP. Use your TFSA for Canadian-source income.`,
      },
      {
        heading: "What Is Actually Fine in Your Non-Registered Account",
        relatedStockTickers: ["RY.TO", "TD.TO", "BMO.TO", "BNS.TO", "CM.TO", "ENB.TO", "TRP.TO", "SHOP.TO", "CSU.TO", "FNV.TO", "WPM.TO", "AEM.TO"],
        body: `The non-registered account is not a tax wasteland. Once your TFSA and RRSP are fully deployed, the non-registered account serves a legitimate purpose, and certain assets genuinely belong there.

Canadian eligible dividends are the single best asset class for non-registered accounts among income-generating equities. The gross-up and dividend tax credit mechanism means eligible dividends are taxed at substantially lower effective rates than interest income. Federally, the eligible dividend gross-up is 38% and the federal dividend tax credit offsets 15.0198% of the grossed-up amount. Combined with provincial credits, investors in Ontario earning around $100,000 pay approximately 25–29% effective tax on eligible dividends versus 43% on interest income. The big Canadian banks (RY.TO, TD.TO, BMO.TO, BNS.TO, CM.TO) and pipelines (ENB.TO, TRP.TO) all pay eligible dividends and are defensible in a non-registered account when registered room is exhausted.

Capital gains stocks with no or minimal dividends are also well-suited. The 50% capital gains inclusion rate means only half the gain is added to taxable income. And you control the timing — you only trigger the tax when you sell. Shopify (SHOP.TO), Constellation Software (CSU.TO), and similar compounders with minimal distributions work fine in a non-registered account.

What is genuinely bad in a non-registered account: interest-bearing investments (GICs, bonds, savings accounts), foreign-income ETFs, REITs generating ordinary income distributions, and US stocks with meaningful dividend yields.`,
      },
      {
        heading: "Practical Allocation: $50K TFSA + $30K RRSP + $10K Non-Reg",
        relatedStockTickers: ["RY.TO", "ENB.TO", "REI-UN.TO", "CAR-UN.TO", "CSU.TO", "SHOP.TO", "MSFT", "AAPL", "TD.TO", "TRP.TO"],
        body: `Here is a concrete $90,000 portfolio allocation for a 32-year-old Ontario resident earning $95,000, using Wealthsimple or Questrade.

TFSA ($50,000): Hold the highest-tax and highest-growth assets. Suggested: 40% Canadian bank and utility eligible dividend stocks — $10,000 in Royal Bank (RY.TO) and $10,000 in Enbridge (ENB.TO); 30% REITs — $15,000 split between RioCan (REI-UN.TO) and CAPREIT (CAR-UN.TO), capturing distribution yield tax-free; 30% high-growth Canadian equities — $15,000 in Constellation Software (CSU.TO) or Shopify (SHOP.TO), aiming for capital gains sheltered entirely from tax. Total TFSA yield on the income portion approximates $1,400/year, received tax-free — compared to roughly $980 after-tax in a non-registered account.

RRSP ($30,000): Prioritize US exposure here to exploit the treaty exemption. Suggested: 60% US equities held directly as US-listed ETFs or individual stocks — $18,000 in Microsoft (MSFT), Apple (AAPL), or a US-listed S&P 500 ETF, dividends received in full with no 15% IRS haircut; 40% Canadian bonds or a Canadian aggregate bond ETF — $12,000, shielding interest income from current tax.

Non-registered ($10,000): Keep tax drag minimal. Suggested: 100% in Canadian blue-chip eligible dividend payers or capital-gains-oriented stocks. A position in TD.TO ($5,000) and TRP.TO ($5,000) — both pay eligible dividends with preferential tax treatment. Avoid any bonds, GICs, or US dividend payers in this account.

As TFSA room grows each year ($7,000 in 2026), migrate non-registered holdings into the TFSA — sell in non-reg (triggering any gains), immediately repurchase inside the TFSA.`,
      },
    ],
  },

  // ── 2. Canadian Dividend Investing ──────────────────────────────────────
  {
    id:             "pb-canadian-dividend-investing",
    title:          "The Canadian Dividend Investing Playbook",
    slug:           "canadian-dividend-investing",
    seoDescription: "The complete Canadian dividend investing guide: eligible dividend tax credit, payout ratio analysis, dividend safety metrics, and building a TSX income portfolio.",
    sections: [
      {
        heading: "Why Yield Alone Is the Wrong Metric — The Yield Trap Explained",
        relatedStockTickers: ["BCE.TO", "FTS.TO", "ENB.TO"],
        body: `A 9% dividend yield is not an opportunity. It is a question. The question is: why is the market pricing this stock so cheaply that the yield looks that good? Nine times out of ten, the answer is that the market knows something you are about to find out.

The yield trap works like this. A company pays a $1.00 annual dividend on a $20 stock — a 5% yield. The stock falls to $12 because the business is deteriorating. The yield is now 8.3%. It looks attractive. New buyers pile in chasing income. Then the company cuts the dividend to $0.60. The stock falls to $9. The buyers who chased 8.3% now hold a stock down 25% with a lower dividend. That is the trap.

BCE.TO cut its dividend in 2025 from C$3.99 to C$1.75 annually — a 56% reduction — after years of running leverage above 4x and missing FCF targets. Investors who bought BCE at $45–50 chasing the 8–9% yield held a stock in the $28–32 range with half the income. Yield was the warning sign, not the invitation.

The correct framework inverts the question. Instead of asking "what is the yield?", ask: "Can this company afford this dividend for the next five to ten years, and can it grow it?" A 3.5% yield backed by a growing, well-covered dividend is worth more — in almost every real-money scenario — than a 7% yield on a business that is shrinking.

The variables that actually matter: FCF payout ratio (below 60% is strong; above 90% is distress territory), net debt to EBITDA (below 3x for most sectors), and the trajectory of the underlying earnings. Yield is the output, not the input. Stop starting there.`,
      },
      {
        heading: "The Eligible Dividend Advantage — How the Gross-Up and Tax Credit Work",
        relatedStockTickers: ["ENB.TO", "RY.TO", "FTS.TO", "T.TO"],
        body: `Canada's dividend tax credit system is one of the most investor-friendly features of the tax code, and most DIY investors underestimate how much it changes the math on income investing in a non-registered account.

Here is how it works. When a Canadian corporation pays a dividend from income that has already been taxed at the general corporate rate, that dividend is designated as "eligible." The eligible dividend gross-up rate is 38%. The federal dividend tax credit is 15.0198% of the grossed-up amount.

A concrete example: you receive C$1,000 in eligible dividends from ENB.TO in a non-registered account. Step one: gross up to C$1,380 ($1,000 × 1.38). Step two: add $1,380 to your taxable income. Step three: apply the federal dividend tax credit of $207.27 ($1,380 × 15.0198%) against your federal tax owing.

In Ontario in 2025, at a $100,000 income level, the combined federal and provincial effective tax rate on eligible dividends is approximately 24.8%, compared to approximately 43.4% on interest income. On that $1,000 difference: you keep $751 from eligible dividends versus $566 from interest — a 33% larger after-tax return.

Top marginal rates on eligible dividends by province (2025): Ontario ~39.3%, Alberta ~34.3%, British Columbia ~36.5%, Quebec ~40.1%. Even at the top marginal rate, eligible dividends beat interest by 10–15 percentage points.

One critical caveat: this advantage only applies in non-registered accounts. In a TFSA, there is no tax on any income — the eligible designation is irrelevant. In an RRSP, dividends are received tax-free but withdrawals are taxed as ordinary income, which means the eligible dividend credit is permanently lost. Eligible dividends belong in your TFSA first; in your non-registered account if TFSA is full — not in your RRSP.`,
      },
      {
        heading: "The Payout Ratio Framework — Sustainable vs. Danger Zone",
        relatedStockTickers: ["ENB.TO", "CNQ.TO", "FTS.TO", "SU.TO", "BCE.TO"],
        body: `Not all payout ratios are created equal. The earnings-based payout ratio is what most screeners show you. It is useful as a starting point and dangerous as an endpoint, because earnings are an accounting construct. Free cash flow is what actually pays dividends.

The FCF payout ratio is calculated as total dividends paid divided by free cash flow (operating cash flow minus capex). For Canadian banks: a payout ratio below 45% on EPS is conservative; 45–55% is normal; above 65% is elevated. For energy and pipeline companies: FCF payout below 60% is strong; 60–75% is acceptable given stable contracted revenues; above 90% is a red flag. ENB.TO targets a 60–70% DCF payout — reasonable for a company with 98% take-or-pay contracts. For utilities: FCF payout below 80% is typically fine because revenues are regulated and highly predictable. FTS.TO's payout is approximately 70–75% of earnings, sustainable given its rate-base growth.

The danger zone is a payout above 100% on either metric — it means the company is borrowing money or selling assets to pay dividends. BCE was paying out over 100% of FCF in 2024 before the cut. CNQ.TO, by contrast, has a formal policy of returning 60–100% of free cash flow to shareholders, with flexibility to adjust based on commodity prices.

One refinement: look at the payout ratio over a full cycle, not just one quarter. Canadian energy companies that maintained dividends through the 2014–2016 oil price crash (CNQ.TO, SU.TO) are demonstrably more trustworthy than those that cut. History of a cut is not disqualifying — but it is relevant context.`,
      },
      {
        heading: "Dividend Growth vs. Current Yield — Why 3% Growing at 8% Beats 6% Growing at 0%",
        relatedStockTickers: ["FTS.TO", "CNQ.TO", "RY.TO", "BMO.TO", "BCE.TO"],
        body: `This is the central mathematical insight of dividend growth investing, and most new investors get it backwards. They see a 6% yield and a 3% yield and conclude the 6% is twice as good. Over a long holding period, that conclusion is almost always wrong.

The concept to understand is yield on cost: the dividend income you receive divided by the price you originally paid. It changes every time the company raises its dividend.

If you pay C$30 for a stock with a C$0.90 annual dividend (3% yield), and that dividend grows at 8% annually, here is your yield on cost over a decade: Year 1: 3.0% | Year 3: 3.5% | Year 5: 4.4% | Year 7: 5.2% | Year 10: 6.5%.

By year 10, you are collecting 6.5% on your original investment from a stock that yielded 3% when you bought it. The 6% flat dividend is still paying 6% on cost — the growing dividend wins from year 10 onward, and the gap widens every year thereafter.

FTS.TO is the canonical Canadian example: investors who bought in 2010 at roughly C$20 are now collecting a yield on cost above 9%, while the stock has more than tripled in price.

The 6% flat dividend tends to come from businesses that are paying out most of what they earn and have limited reinvestment opportunities. BCE pre-reset was the textbook case: high static yield, deteriorating underlying business, eventual cut. The math of yield on cost is why you should generally prefer a 3–4% yield growing at 6–10% annually over a 7–8% yield growing at 0–2%. Target dividend growth of at least 4–5% annually, with 6–10% being excellent.`,
      },
      {
        heading: "The Dividend Safety Checklist — Five Questions Before You Buy",
        relatedStockTickers: ["ENB.TO", "FTS.TO", "CNQ.TO", "TRP.TO", "BCE.TO", "RY.TO"],
        body: `Before you buy any stock for its dividend, run it through these five questions in order. If it fails two or more, the dividend is suspect regardless of how attractive the yield looks.

Question 1: What is the FCF payout ratio, and has it been stable or deteriorating? Pull the last three years of operating cash flow and capex from SEDAR or the company's investor relations page. A ratio above 85% trending higher is a warning sign. A ratio below 65% stable for several years is reassuring.

Question 2: What is the FCF coverage ratio? Free cash flow divided by total dividends paid. You want at least 1.25x coverage. 1.5x or better is comfortable. Below 1.0x is a red flag.

Question 3: What is net debt to EBITDA, and where is it trending? For banks, use CET1 ratio instead (want above 11.5%). For energy producers, below 1.5x is strong; 1.5–2.5x is normal; above 3x raises risk. For utilities and pipelines, contracted cash flows support higher leverage — ENB.TO and TRP.TO carry 4–5x, which is standard for their sector. The key question is whether it is rising or falling.

Question 4: How long is the dividend growth streak, and has the company ever cut? A company that has raised its dividend for ten or more consecutive years has demonstrated the discipline to do so through at least one or two difficult economic periods.

Question 5: Is the business model durable for the next decade? Canadian banks benefit from an oligopoly structure. Regulated utilities earn government-approved returns on their rate base. Pipeline companies with long-term take-or-pay contracts have largely insulated revenue. Telecoms face competition and rising capex. Energy producers are exposed to commodity cycles. Know what you own.`,
      },
      {
        heading: "Canadian Dividend Streaks — What 196 Years and 52 Years Actually Mean",
        relatedStockTickers: ["FTS.TO", "ENB.TO", "CNQ.TO", "BMO.TO", "RY.TO", "TD.TO", "BNS.TO", "CM.TO"],
        body: `Canada produces genuinely world-class dividend growth companies. These streaks are not marketing — they are evidence of business durability through recessions, wars, pandemics, rate cycles, and commodity crashes.

FTS.TO — 52 consecutive years of dividend increases. Fortis is a fully regulated utility holding company operating across Canada, the US, and the Caribbean. Its revenues are set by regulators and tied to its invested capital base. The dividend has grown through the 1990 recession, the dot-com bust, the 2008 financial crisis, COVID-19, and the 2022–2024 rate spike. The current yield is approximately 4.2% with a five-year capital plan of C$28.8 billion (2026–2030) supporting 4–6% annual dividend growth guidance through the end of the decade.

ENB.TO — 31 consecutive years of dividend increases. Enbridge operates North America's largest crude oil and liquids pipeline network. Approximately 98% of EBITDA comes from cost-of-service or take-or-pay contracts. The current yield is approximately 7.2%, backed by CA$39 billion in secured growth projects and a 60–70% distributable cash flow payout target.

CNQ.TO — 25 consecutive years of dividend increases. Canadian Natural's oil sands assets are long-life, low-decline, and require minimal sustaining capital. CNQ formally targets returning 60–100% of free cash flow to shareholders. The 25-year streak includes the 2015–2016 oil price collapse when WTI traded below $30.

BMO.TO — 196 consecutive years of dividend payments since 1829. This predates Confederation. The streak survived the Great Depression. BMO's current quarterly dividend is C$1.67, a yield of approximately 4.8%, with a 10-year average annual dividend growth rate of 7.4%.`,
      },
      {
        heading: "Account Fit for Dividends — TFSA, RRSP, Non-Registered, and the US Dividend Trap",
        relatedStockTickers: ["ENB.TO", "FTS.TO", "BMO.TO", "RY.TO", "REI-UN.TO", "BCE.TO"],
        body: `Where you hold your dividend stocks matters as much as which ones you hold. The wrong account can cost you thousands of dollars annually in unnecessary tax or permanently lost tax credits.

TFSA — the ideal account for Canadian eligible dividends. Every dollar of dividend income lands in the account and is never taxed, ever. No T-slip, no gross-up calculation, no credit to apply for. Priority order for TFSA: your highest-yielding eligible Canadian dividend payers (ENB.TO, FTS.TO, REI-UN.TO, BCE.TO, BMO.TO) and stocks whose growth will be large enough that sheltering the capital gain matters as much as the income.

RRSP — acceptable for US dividend payers, suboptimal for Canadian eligible dividends. When ENB pays you a C$3.70 annual dividend inside your RRSP, you receive no T-slip — but when you eventually withdraw those funds, the entire withdrawal is taxed as ordinary income at your marginal rate, with no dividend gross-up and no tax credit. The eligible dividend advantage is permanently destroyed. Use your RRSP for: US dividend-paying stocks (where the RRSP eliminates the 15% US withholding under the Canada-US tax treaty), Canadian bonds, and REITs.

Non-registered — still good, thanks to the eligible dividend credit. At the $100,000 income level in Ontario, you are paying roughly 24–25% on eligible dividends versus 43% on interest. A C$10,000 eligible dividend portfolio in non-registered generates roughly $750 more after-tax income per year than the same $10,000 in a GIC paying the same pre-tax return.

The US dividend TFSA trap: if you hold US dividend-paying stocks inside your TFSA, you will pay a 15% US withholding tax on every dividend, automatically, and you cannot reclaim it. Hold US dividend payers in your RRSP; hold Canadian eligible dividend payers in your TFSA. This single account location decision is worth hundreds of dollars per year.`,
      },
      {
        heading: "Building a Dividend Portfolio — Diversification Across Sectors, Not Just Yield",
        relatedStockTickers: ["RY.TO", "TD.TO", "BMO.TO", "BNS.TO", "ENB.TO", "TRP.TO", "CNQ.TO", "SU.TO", "FTS.TO", "T.TO", "BCE.TO", "REI-UN.TO"],
        body: `A portfolio built exclusively on the five highest-yielding TSX stocks is not a dividend portfolio. It is a concentrated bet on whichever sectors are currently under pressure — because high yield is typically sector-specific and cyclical. Real diversification means building across uncorrelated revenue streams.

The four core pillars for a Canadian dividend portfolio: banks, pipelines, utilities, and telecoms. These four sectors cover the financial cycle, energy cycle, rate cycle, and technology disruption — with different exposure to each.

Banks (25–35% of portfolio): RY.TO, TD.TO, BMO.TO, BNS.TO, CM.TO. Own two to three. The Canadian banking oligopoly provides pricing power, regulatory moats, and 7–8% historical annual dividend growth. Do not own all five — they are highly correlated in a recession. TD.TO's discount to peers due to its US AML cap is currently the most interesting entry point.

Pipelines and energy infrastructure (20–30%): ENB.TO and TRP.TO are the anchor choices. Both have largely contracted revenue bases and visible dividend growth from secured capital programs. CNQ.TO or SU.TO can supplement with commodity-sensitive upstream producers — size them smaller given higher cyclicality.

Utilities (15–25%): FTS.TO is the core holding. Its 52-year dividend growth streak and regulated return structure make it the most risk-appropriate income stock on the TSX. Add exposure during rate peaks, when utility valuations compress and yields become most attractive.

Telecoms (10–15%): T.TO and BCE.TO are the two choices. BCE is higher-risk, higher-yield following the 2025 reset. TELUS is more conservative with a paused (but not cut) dividend and a credible deleveraging timeline.

A practical starting portfolio with a $25,000 dividend allocation: RY.TO + TD.TO ($5,000 combined), ENB.TO ($5,000), FTS.TO ($5,000), CNQ.TO ($4,000), T.TO ($3,000), REI-UN.TO ($3,000). Blended yield of approximately 4.5–5.0% with a reasonable expectation of 5–7% annual dividend growth. Boring is the goal. Boring is what compounds.`,
      },
    ],
  },

  // ── 3. Canadian Precious Metals ──────────────────────────────────────────
  {
    id:             "pb-canadian-precious-metals",
    title:          "The Canadian Precious Metals Playbook",
    slug:           "canadian-precious-metals",
    seoDescription: "Gold at $4,500+, TSX miners printing cash. How Canadian DIY investors should own precious metals — miners vs. royalty companies, TFSA withholding trap, and portfolio sizing.",
    sections: [
      {
        heading: "Why Canadian Investors Have a Natural Edge in Precious Metals",
        relatedStockTickers: ["AEM.TO", "ABX.TO", "FNV.TO", "WPM.TO", "K.TO"],
        body: `Canada is one of the world's top gold-producing nations, consistently ranking among the top four globally. That geological fact translates into a financial one: the TSX and TSX Venture Exchange list roughly 40% of the world's publicly traded mining companies — more than any other exchange group on Earth. No other market gives retail investors cheaper, easier access to the full spectrum of gold and silver exposure.

For a Canadian investor aged 25 to 40, this matters in three concrete ways. First, the companies you want to own — Agnico Eagle (AEM.TO), Barrick Gold (ABX.TO), Franco-Nevada (FNV.TO), Wheaton Precious Metals (WPM.TO), and Kinross (K.TO) — all have their primary or co-primary listing on the TSX. That means you buy and sell in Canadian dollars, avoid currency conversion fees, and hold the version of the share that is exempt from US withholding tax inside your TFSA.

Second, eligible dividends from TSX-listed Canadian corporations receive the dividend tax credit in a non-registered account. A $1,000 eligible dividend from AEM.TO is taxed at roughly 25–39% depending on your province, versus your full marginal rate on a US-source dividend. In a TFSA, both are tax-free — but the TSX listing still matters because it eliminates IRS withholding at source.

Third, Canada's mining analyst community, Bay Street deal-flow, and proximity to management teams give informed investors an informational edge that simply does not exist for investors in Germany or Singapore trying to pick among the same companies. With gold at approximately $4,540/oz and silver at approximately $76/oz as of May 2026, this is not an abstract advantage — it is worth understanding in real money terms.`,
      },
      {
        heading: "The Three Ways to Own Gold — Physical, ETFs, Miners, and Streamers",
        relatedStockTickers: ["AEM.TO", "ABX.TO", "FNV.TO", "WPM.TO", "K.TO"],
        body: `There are essentially four implementation choices for gaining precious metals exposure, and each suits a different investor profile.

Physical gold and silver — bullion bars and coins — are the purest hedge. You own the metal itself with no counterparty risk. The Royal Canadian Mint produces RRSP- and TFSA-eligible coins (99.99% purity). The drawbacks are real: storage costs, insurance, illiquidity, and no income. Physical metal does not compound. It is a monetary insurance policy, not a growth vehicle.

Gold and silver ETFs — such as the iShares Gold Bullion ETF (CGL.C on TSX) or the Sprott Physical Gold Trust — sit between physical ownership and equity. They are liquid, can be held in registered accounts, and eliminate storage hassle. Their total return mirrors the spot price with no dividend and no operating leverage.

Mining companies (Agnico Eagle, Barrick, Kinross) provide operating leverage: when gold rises from $3,000 to $4,500/oz, a miner with a $1,500/oz AISC sees its free cash flow per ounce triple. The mathematics of leverage are powerful in a bull market and brutal in a bear market. Miners pay dividends, produce earnings, and can be analyzed like any industrial company. They carry operational risk — geopolitics, labour disputes, grade variability, cost inflation.

Royalty and streaming companies (Franco-Nevada, Wheaton) provide gold and silver exposure with none of the operational risk of actually running a mine. They advance capital upfront in exchange for the right to purchase future production at a fixed, low cost. These are the compounders of the precious metals world: ~90% EBITDA margins, no labour strikes, no capex surprises, and growing portfolios of streams across dozens of mines worldwide. For most investors in this age bracket, a royalty company should be the cornerstone of precious metals exposure.`,
      },
      {
        heading: "Miners vs. Royalty Companies — The Key Structural Differences",
        relatedStockTickers: ["ABX.TO", "FNV.TO", "WPM.TO", "K.TO"],
        body: `Understanding why royalty and streaming companies behave so differently from miners is the single most important concept in this playbook.

A miner like Barrick (ABX.TO) or Kinross (K.TO) must find ore, build a mill, hire a workforce, buy fuel and reagents, maintain equipment, pay royalties to landowners and governments, manage tailings, and sell the resulting metal. Every one of those steps carries cost risk. Barrick's 2026 AISC guidance is $1,760–$1,950/oz. At a gold price of $4,540/oz, that is a healthy margin — but it took years of capital spending to build the mines generating that production, and cost overruns are a feature, not a bug, of mining.

A royalty company like Franco-Nevada (FNV.TO) does none of this. FNV paid a mine developer capital upfront in exchange for a royalty — typically a net smelter return royalty (NSR) of 1–3% of the revenue from every ounce the mine produces, forever. The mine operator bears all operating costs, all capex, and all the geological risk. FNV just collects the cheque. In Q1 2026, Franco-Nevada reported Adjusted EBITDA of $591.9 million on revenue of $650.7 million — a 91% EBITDA margin. No mine in the world achieves that.

Wheaton Precious Metals (WPM.TO) operates as a streaming company: Wheaton pays a fixed, low cost per ounce to purchase future silver or gold production (the 2025 average cash cost per GEO was approximately $514/oz). The economics are similar to a royalty — low fixed costs, no capex exposure, enormous margin.

When to own which: In early-cycle gold bull markets when prices are rising fast, miners provide more leverage and outperform. Once gold reaches sustained elevated levels, royalty companies trade at higher multiples and deliver compounding total return through dividend growth and portfolio expansion. For a 25-40-year-old with a 20-year horizon, the royalty model is the better core holding.`,
      },
      {
        heading: "The AISC Explained — How to Instantly Screen Any Miner",
        relatedStockTickers: ["AEM.TO", "ABX.TO", "FNV.TO", "WPM.TO", "K.TO"],
        body: `All-In Sustaining Cost (AISC) is the single most important metric for evaluating a gold miner. Developed by the World Gold Council, AISC includes cash costs, sustaining capital expenditures, mine-site overhead, reclamation provisions, and exploration needed to sustain current production — but excludes growth capital for new mines.

With gold trading around $4,540/oz as of May 2026, even a mediocre miner with an AISC of $2,500/oz generates $2,040/oz in free cash flow — a level of profitability unimaginable three years ago. But AISC still matters because it determines how much of the gold price each company captures, predicts survival in a downturn, and reveals management quality.

Here is how the current 2026 guidance stacks up:

Agnico Eagle (AEM.TO): full-year 2026 AISC guidance of $1,400–$1,550/oz, with Q1 2026 AISC of $1,483/oz. This is among the best in the senior miner universe. At $4,540 gold, AEM captures roughly $3,000/oz in margin — exceptional.

Barrick (ABX.TO): 2026 AISC guidance of $1,760–$1,950/oz. Higher than AEM, reflecting Barrick's more complex mine portfolio spanning Africa, the Middle East, and North America. Still highly profitable at current prices, but with less margin cushion.

Kinross (K.TO): 2026 AISC guidance reaffirmed at $1,730/oz (±5%), with Q1 2026 AISC of $1,732/oz — tracking precisely to plan. Americas-focused, higher-beta gold exposure.

The practical screening rules: avoid any miner with an AISC above $2,200/oz — they are leveraged bets on gold price with little margin for error. Below $1,500/oz is excellent; below $1,200/oz is world-class. Royalty and streaming companies (FNV, WPM) have no AISC — they bear no operating costs — which is itself part of their structural advantage.`,
      },
      {
        heading: "The Withholding Tax Trap — Always Hold the .TO Version in Your TFSA",
        relatedStockTickers: ["WPM.TO", "FNV.TO", "AEM.TO", "ABX.TO", "K.TO"],
        body: `This section will save you real money.

Wheaton Precious Metals trades on the TSX as WPM.TO and on the NYSE as WPM. Franco-Nevada trades on the TSX as FNV.TO and on the NYSE as FNV. Agnico Eagle is AEM.TO on the TSX and AEM on the NYSE. The shares represent ownership in the same Canadian company — but where you hold them matters enormously inside a TFSA.

If you hold the NYSE-listed shares (WPM, FNV, AEM) inside your TFSA, every dividend payment is subject to 15% IRS withholding at source, automatically, before the money ever reaches your account. On $10,000 of annual distributions, you lose $1,500 — permanently. There is no form to file, no credit to claim, and no recovery mechanism. The TFSA cannot claim foreign tax credits.

The Canada-US tax treaty does exempt Canadian residents from US withholding — but only for RRSPs, LIRAs, and RRIFs. The TFSA is explicitly excluded from this treaty protection.

The fix is simple: hold the TSX-listed version (WPM.TO, FNV.TO, AEM.TO, ABX.TO, K.TO) inside your TFSA. Because these are Canadian-domiciled securities making distributions from Canadian corporate income, there is no US withholding. Dividends flow into your TFSA whole and compound tax-free as intended.

The rule extends to any Canadian mining company that also has a US-listed ADR or cross-listing. Check the exchange suffix: if it ends in .TO or .V, you are holding the Canadian-listed security. If it has no suffix, you may be subject to IRS withholding on distributions.

For your RRSP, the calculus is different — you can hold US-listed shares in an RRSP and be exempt from US withholding tax under the treaty. But for TFSA: .TO only, always.`,
      },
      {
        heading: "Portfolio Sizing — Building the Right Precious Metals Stack",
        relatedStockTickers: ["FNV.TO", "WPM.TO", "AEM.TO", "ABX.TO", "K.TO"],
        body: `Precious metals are a monetary hedge, not a core equity holding. The appropriate allocation for a 25-40-year-old Canadian investor with a balanced growth mandate is 5–10% of total portfolio in combined gold and silver exposure. At 5%, you gain meaningful crisis protection without sacrificing the long-run compounding power of equities. Above 15%, you are making a macro bet, not a portfolio construction decision.

Within that 5–10% sleeve, here is a practical three-tier structure:

Tier 1 — Core Royalty Position (40–50% of the metals sleeve): Franco-Nevada (FNV.TO) or Wheaton Precious Metals (WPM.TO), or split evenly between both. These are the highest-quality, lowest-risk expressions of gold and silver exposure available to Canadian investors. FNV provides gold-dominant, diversified royalty exposure with essentially no commodity risk beyond gold price. WPM adds a silver tilt, useful if you want silver optionality. FNV recorded Q1 2026 revenue of $650.7M with a 91% EBITDA margin. WPM's 2026 GEO production guidance is 860,000–940,000 GEOs. These belong in your TFSA, using the .TO listing.

Tier 2 — Senior Miner Anchor (30–40% of the metals sleeve): Agnico Eagle (AEM.TO) is the quality anchor. Best-in-class AISC at $1,400–$1,550/oz, Canada- and Finland-focused operations in politically stable jurisdictions, strong dividend growth. AEM is the miner you hold through cycles.

Tier 3 — Optional Speculative Position (10–20% of the metals sleeve): Kinross (K.TO) offers high-beta gold exposure for investors who want operating leverage. 2026 AISC guidance of $1,730/oz means lower margins than AEM, but Kinross has a strong free cash flow profile at today's gold prices. Suitable for investors with high conviction on gold continuing higher and who want amplified upside.`,
      },
      {
        heading: "The Canadian Precious Metals Universe — A Quick Reference",
        relatedStockTickers: ["ABX.TO", "AEM.TO", "FNV.TO", "WPM.TO", "K.TO"],
        body: `A concise profile of each major name and what role it plays in a portfolio.

Barrick Gold (ABX.TO) — Scale and copper optionality. The largest gold miner with primary listings on the TSX and NYSE. 2026 AISC guidance of $1,760–$1,950/oz reflects higher-cost operations, but Barrick's copper business (Lumwana in Zambia, Reko Diq in Pakistan) provides diversification no other gold major offers. For investors bullish on both gold and copper as critical minerals, ABX has a unique dual-commodity proposition.

Agnico Eagle (AEM.TO) — Best jurisdiction, best AISC. Operations concentrated in Canada (Detour Lake, Macassa, LaRonde), Finland (Kittila), and Australia. 2026 AISC of $1,400–$1,550/oz is best-in-class among senior miners. Strong dividend, growing production, proven M&A track record. The quality anchor for any Canadian precious metals allocation.

Franco-Nevada (FNV.TO) — Royalty model, maximum diversification. Holds 400+ royalties and streams across gold, silver, platinum group metals, oil and gas, and iron ore. Cobre Panama — the company's largest asset — was suspended in late 2023; any restart is pure upside with no additional capital required. Q1 2026 revenue of $650.7M, 91% EBITDA margin, zero debt. The gold stock that least feels like a gold stock.

Wheaton Precious Metals (WPM.TO) — Silver and gold streaming. The world's largest precious metals streaming company with 40+ active streams. Silver streams give WPM more silver torque than FNV. 2026 production guidance of 860,000–940,000 GEOs. Cash cost per GEO averaged approximately $514/GEO in 2025 — creating enormous margins at any gold price above $1,000/GEO.

Kinross Gold (K.TO) — Americas-focused, high-beta. Operates Tasiast in Mauritania, Manh Choh in Alaska, Paracatu in Brazil, and Round Mountain in Nevada. 2026 AISC guidance of $1,730/oz. Q1 2026 free cash flow of $220M. The speculative addition for investors who want operating leverage and are comfortable with moderate single-asset concentration risk.`,
      },
      {
        heading: "Gold in a TFSA — The Tax-Free Compounding Case",
        relatedStockTickers: ["AEM.TO", "ABX.TO", "FNV.TO", "WPM.TO", "K.TO"],
        body: `The TFSA contribution limit for 2026 is $7,000 per year, with cumulative room since inception (2009) reaching $109,000 for eligible Canadians. For precious metals investors, the TFSA is uniquely powerful for three reasons specific to this asset class.

First, gold stocks do not pay US-source dividends. Unlike holding a US bank or technology company inside a TFSA — where dividends are subject to 15% IRS withholding — the dividends paid by AEM.TO, ABX.TO, FNV.TO, WPM.TO, and K.TO are eligible Canadian dividends distributed from Canadian corporate income. Hold the .TO-listed shares and you receive every cent of the dividend inside the TFSA, tax-free, with no withholding at any level.

Second, gold stocks can deliver extraordinary capital gains in precious metals bull cycles. With gold at $4,540/oz and silver at $76/oz as of May 2026, the mining equities have generated multi-hundred-percent returns over the cycle. Every dollar of capital gain earned inside a TFSA is permanently tax-free. There is no inclusion rate, no deemed disposition — the gains simply never appear on your tax return.

Third, eligible dividends in a non-registered account receive the dividend tax credit but not tax-free compounding. Inside the TFSA, those same dividends reinvest and compound at the full gross amount, year after year, with no friction.

The practical playbook: hold FNV.TO and WPM.TO as your core royalty positions in the TFSA, add AEM.TO as the senior miner anchor, and use any remaining room for K.TO if you want speculative leverage. Keep physical bullion ETFs in the RRSP where you get tax-deferred growth on an asset that produces no income. The TFSA is the right home for dividend-paying, capital-gains-generating precious metals equities — and the .TO listing makes it entirely free of US withholding friction.`,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Publish to Sanity
// ---------------------------------------------------------------------------
async function main() {
  console.log("Publishing 3 Playbooks to Sanity — " + new Date().toISOString());

  // Pre-fetch all stockFile refs once
  const allTickers = [...new Set(PLAYBOOKS.flatMap(pb => pb.sections.flatMap(s => s.relatedStockTickers || [])))];
  const stockDocs  = await sanity.fetch(`*[_type == "stockFile" && ticker in $tickers] { _id, ticker }`, { tickers: allTickers });
  const tickerToId = Object.fromEntries(stockDocs.map(d => [d.ticker, d._id]));

  for (const pb of PLAYBOOKS) {
    process.stdout.write(`\nPublishing: ${pb.title} … `);

    const sections = pb.sections.map((s, i) => ({
      _key:     `sec-${i}`,
      heading:  s.heading,
      body:     pt(s.body, `s${i}p`),
      relatedStocks: (s.relatedStockTickers || [])
        .filter(t => tickerToId[t])
        .map((t, j) => ({ _type: "reference", _ref: tickerToId[t], _key: `ref-${i}-${j}` })),
    }));

    await sanity.createOrReplace({
      _id:          pb.id,
      _type:        "playbook",
      title:        pb.title,
      slug:         { _type: "slug", current: pb.slug },
      lastUpdated:  new Date().toISOString(),
      seoDescription: pb.seoDescription,
      sections,
    });

    console.log(`✅ (${sections.length} sections)`);
  }

  console.log("\n✅ All 3 Playbooks published.");
}

main().catch(err => { console.error(err); process.exit(1); });
