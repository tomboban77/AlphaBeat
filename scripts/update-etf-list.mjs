/**
 * scripts/update-etf-list.mjs
 * Updates the Top 10 Canadian ETFs for TFSA list with research-based data.
 * Usage: node scripts/update-etf-list.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

const env       = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();
const sanity    = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

const ETF_DATA = {
  "XIC.TO": { name: "iShares Core S&P/TSX Capped Composite Index ETF",     take: "XIC tracks ~240 Canadian companies across all TSX sectors — the broadest single-fund exposure to Canada at an MER of just 0.06%. With ~$29B in AUM it's the largest Canadian equity ETF, ensuring tight spreads and deep liquidity. Inside a TFSA, all dividends and capital gains compound completely tax-free.", metric: "MER 0.06%" },
  "VCN.TO": { name: "Vanguard FTSE Canada All Cap Index ETF",               take: "VCN extends beyond large-caps to include mid- and small-cap Canadian companies at an MER of 0.05% — the single cheapest Canadian equity ETF on this list. Vanguard's investor-owned structure provides a structural cost advantage over time, and the broader index means slightly more small-cap exposure than XIC.", metric: "MER 0.05%" },
  "XIU.TO": { name: "iShares S&P/TSX 60 Index ETF",                         take: "Canada's oldest ETF (launched 1999) with $22.2B in AUM — tracking the 60 largest TSX blue-chips including the Big Six banks, Shopify, and major energy names. The depth of liquidity makes it the institutional favourite; the options market availability makes it useful beyond buy-and-hold. A reliable TFSA anchor with 25+ years of history.", metric: "AUM ~$22.2B CAD" },
  "ZCN.TO": { name: "BMO S&P/TSX Capped Composite Index ETF",               take: "ZCN tracks the same S&P/TSX Capped Composite Index as XIC at an identical MER of 0.06%, making the two functionally interchangeable. For BMO InvestorLine users or investors who prefer BMO's fund family, ZCN is the cost-identical alternative with $13.4B in AUM ensuring solid liquidity.", metric: "MER 0.06%" },
  "VFV.TO": { name: "Vanguard S&P 500 Index ETF",                           take: "VFV gives Canadian TFSA holders unhedged exposure to all 500 S&P 500 companies — Apple, Nvidia, Microsoft, Berkshire — priced in CAD with no currency hedge, so you benefit from USD strength over time. At MER 0.09% and ~$27.8B in AUM it's the dominant Canadian-listed U.S. equity ETF. Natural currency diversification is a feature, not a bug, for most long-term investors.", metric: "AUM ~$27.8B CAD" },
  "XSP.TO": { name: "iShares Core S&P 500 Index ETF (CAD-Hedged)",          take: "XSP tracks the same S&P 500 as VFV but hedges the USD/CAD exchange rate, delivering returns that closely mirror the index in Canadian dollar terms regardless of currency swings. At MER 0.09%, the hedging adds minimal cost over VFV. For TFSA investors who want pure U.S. equity returns without currency variance, XSP is the cleaner choice.", metric: "MER 0.09%" },
  "ZQQ.TO": { name: "BMO Nasdaq 100 Equity Hedged to CAD Index ETF",        take: "ZQQ tracks the NASDAQ-100 — Apple, Microsoft, Nvidia, Meta, Amazon — fully hedged to CAD, so your returns reflect the index without CAD/USD noise. Inside a TFSA, the tax-free compounding on one of the highest-returning indices in history is extremely powerful. The 0.39% MER is the cost of hedging and the Nasdaq's long-term track record; 2024 return was +24.0%.", metric: "MER 0.39%" },
  "XDV.TO": { name: "iShares Canadian Select Dividend Index ETF",            take: "XDV holds 30 high-yielding Canadian dividend stocks screened for dividend growth and financial health, paying monthly distributions of ~4.2% yield — all tax-free inside a TFSA. The monthly income makes it popular for TFSA investors building a tax-free income stream. MER of 0.55% reflects the dividend-focused screening methodology.", metric: "Yield ~4.2%" },
  "CDZ.TO": { name: "iShares S&P/TSX Canadian Dividend Aristocrats Index ETF", take: "CDZ targets 90+ Canadian companies that have consecutively grown dividends for at least five years — a quality screen that filters out dividend traps and captures compounders. Yield is ~3.2% with the Aristocrats methodology prioritising dividend growth over raw yield. The 0.66% MER is the highest on this list; investors should weigh the quality screen against the cost.", metric: "MER 0.66%" },
  "ZEB.TO": { name: "BMO Equal Weight Banks Index ETF",                      take: "ZEB holds Canada's six largest banks in equal weights — Royal Bank, TD, Scotiabank, BMO, CIBC, and National Bank — giving more exposure to smaller names like National Bank than a market-cap approach. Canada's Big Six are among the world's most profitable, well-regulated banks. 10-year annualised return through end of 2025 was 15.0% — a compelling case for concentrated Canadian financial exposure.", metric: "10Y return 15.0% ann." },
};

const ETF_ORDER = ["XIC.TO","VCN.TO","XIU.TO","ZCN.TO","VFV.TO","XSP.TO","ZQQ.TO","XDV.TO","CDZ.TO","ZEB.TO"];

async function main() {
  console.log("Updating ETF Top List with research data…");

  const entries = ETF_ORDER.map((ticker, i) => {
    const d = ETF_DATA[ticker];
    return {
      _key:       `etf-${i}`,
      rank:       i + 1,
      etfTicker:  ticker,
      etfName:    d.name,
      editorTake: d.take,
      keyMetric:  d.metric,
    };
  });

  await sanity.patch("rankedList-top-canadian-etfs-tfsa").set({
    title:       "Top 10 Canadian ETFs for TFSA",
    lastUpdated: new Date().toISOString(),
    entries,
    intro: [{ _type: "block", _key: "intro1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "s1", marks: [], text: "Ten TSX-listed ETFs that belong in a Canadian TFSA — ranked from broadest/cheapest Canadian equity through to sector-specific and dividend-focused. All are TSX-listed, meaning no US withholding tax on distributions inside a TFSA. MERs are from January 2026 fund facts." }] }],
    changesLog: [{ _key: "cl1", date: new Date().toISOString().slice(0,10), change: "Initial publication. All 10 ETF names, editor takes, and key metrics populated from January 2026 fund facts and BlackRock/BMO/Vanguard Canada fact sheets." }],
  }).commit();

  console.log("✅ ETF Top List updated with all 10 entries.");
}

main().catch(err => { console.error(err); process.exit(1); });
