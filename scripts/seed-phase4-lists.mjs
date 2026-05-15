/**
 * scripts/seed-phase4-lists.mjs
 *
 * Creates the 4 launch rankedList documents as Sanity drafts.
 * Entries are ordered by the auto-rank logic (composite score for category).
 * All editorTake fields are marked "DRAFT — pending Tom review".
 *
 * Run AFTER seed-phase4-stocks.mjs and npm run score so snapshots exist.
 * Usage: node scripts/seed-phase4-lists.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

const env       = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();

if (!projectId || !token) { console.error("Missing Sanity env vars"); process.exit(1); }
const sanity = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

const DRAFT = "DRAFT — pending Tom review";

const LISTS = [
  {
    _id:          "rankedList-top-canadian-dividend-stocks-tfsa",
    title:        "Top 10 Canadian Dividend Stocks for TFSA",
    slug:         "top-canadian-dividend-stocks-tfsa",
    year:         2026,
    category:     "dividend-stocks",
    accountFocus: "tfsa",
    seoDescription: "The 10 best Canadian dividend stocks for a TFSA in 2026 — scored for yield safety, eligible dividend credit, and tax efficiency.",
    factorWeights: { dividendSafety: 0.40, taxEfficiency: 0.25, value: 0.20, quality: 0.15 },
    sectorFilter:  (s) => /bank|energy|telecom|utilities|financial/i.test(s) && !/reit/i.test(s),
  },
  {
    _id:          "rankedList-top-canadian-growth-stocks-under-40",
    title:        "Top 10 Canadian Growth Stocks Under $40",
    slug:         "top-canadian-growth-stocks-under-40",
    year:         2026,
    category:     "growth-stocks",
    accountFocus: "tfsa",
    seoDescription: "The 10 best Canadian growth stocks under $40 in 2026 — high-conviction TSX names scored for revenue growth, momentum, and value.",
    factorWeights: { growth: 0.40, momentum: 0.30, value: 0.20, quality: 0.10 },
    sectorFilter:  (s) => /technology|consumer|industrial/i.test(s),
  },
  {
    _id:          "rankedList-top-canadian-bank-stocks",
    title:        "Top 10 Canadian Bank Stocks",
    slug:         "top-canadian-bank-stocks",
    year:         2026,
    category:     "bank-stocks",
    accountFocus: "any",
    seoDescription: "The 10 best Canadian bank stocks in 2026 — Big Six and mid-tier banks scored for quality, dividend safety, and value.",
    factorWeights: { quality: 0.35, dividendSafety: 0.30, value: 0.25, growth: 0.10 },
    sectorFilter:  (s) => /bank|financial/i.test(s),
  },
  {
    _id:          "rankedList-top-canadian-etfs-tfsa",
    title:        "Top 10 Canadian ETFs for TFSA",
    slug:         "top-canadian-etfs-tfsa",
    year:         2026,
    category:     "etfs",
    accountFocus: "tfsa",
    seoDescription: "The 10 best TSX-listed ETFs for a TFSA in 2026 — broad market and thematic, no US withholding tax.",
    factorWeights: {},
    sectorFilter:  () => false, // ETF list uses manual entries, no stockFile refs
  },
];

async function computeRanking(list) {
  if (!Object.keys(list.factorWeights).length) return []; // ETF list

  // Fetch all stockFiles with their latest snapshot
  const stocks = await sanity.fetch(`
    *[_type == "stockFile"] {
      _id, ticker, companyName, sectorLabel, slug,
      "snapshot": *[_type == "scoreSnapshot" && ticker == ^.ticker] | order(computedAt desc)[0] {
        scores { value, growth, quality, dividendSafety, momentum, taxEfficiency }
      }
    }
  `);

  // Filter by sector
  const relevant = stocks.filter(s => list.sectorFilter(s.sectorLabel));

  // Score
  const scored = relevant.map(s => {
    const sc = s.snapshot?.scores;
    if (!sc) return { ...s, composite: 0 };
    let wSum = 0, wUsed = 0;
    for (const [k, w] of Object.entries(list.factorWeights)) {
      const v = sc[k];
      if (v != null && isFinite(v)) { wSum += v * w; wUsed += w; }
    }
    return { ...s, composite: wUsed > 0 ? Math.round(wSum / wUsed) : 0 };
  }).sort((a, b) => b.composite - a.composite).slice(0, 10);

  return scored.map((s, i) => ({
    _key:       `entry-${i}`,
    rank:       i + 1,
    stockFile:  { _type: "reference", _ref: s._id },
    editorTake: DRAFT,
    keyMetric:  DRAFT,
  }));
}

// ETF list uses manual placeholder entries (Tom fills in)
function etfPlaceholderEntries() {
  const ETF_TICKERS = [
    "XIC.TO",  "VCN.TO",  "XIU.TO",  "ZCN.TO",  "VFV.TO",
    "XSP.TO",  "ZQQ.TO",  "XDV.TO",  "CDZ.TO",  "ZEB.TO",
  ];
  return ETF_TICKERS.map((ticker, i) => ({
    _key:       `etf-${i}`,
    rank:       i + 1,
    etfTicker:  ticker,
    etfName:    DRAFT,
    editorTake: DRAFT,
    keyMetric:  DRAFT,
  }));
}

async function main() {
  console.log("Phase 4.5 — Seeding 4 rankedList drafts\n");

  for (const list of LISTS) {
    process.stdout.write(`  ${list.title} … `);

    const entries = list.category === "etfs"
      ? etfPlaceholderEntries()
      : await computeRanking(list);

    const doc = {
      _id:          list._id,
      _type:        "rankedList",
      title:        list.title,
      slug:         { _type: "slug", current: list.slug },
      year:         list.year,
      category:     list.category,
      accountFocus: list.accountFocus,
      lastUpdated:  new Date().toISOString(),
      seoDescription: list.seoDescription,
      entries,
      changesLog: [],
    };

    await sanity.createOrReplace(doc);
    console.log(`✅  ${entries.length} entries`);
  }

  console.log("\nDone. Open /studio → Top Lists (Ranked) to review and complete editor takes.");
}

main().catch(err => { console.error(err); process.exit(1); });
