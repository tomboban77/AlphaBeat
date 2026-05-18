import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

const env       = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();
const sanity    = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

const SECTORS = {
  "AAPL":    "US Technology",
  "BB.TO":   "Canadian Technology",
  "CNQ.TO":  "Canadian Energy",
  "COST":    "US Consumer",
  "ENB.TO":  "Canadian Energy",
  "IONQ":    "US Technology",
  "JPM":     "US Financials",
  "LLY":     "US Healthcare",
  "MSFT":    "US Technology",
  "NVDA":    "US Technology",
  "RIVN":    "US Consumer",
  "RY.TO":   "Canadian Banks",
  "SHOP.TO": "Canadian Technology",
  "SOFI":    "US Fintech",
  "WELL.TO": "Canadian Healthcare",
};

async function main() {
  const docs = await sanity.fetch(
    `*[_type == "stockFile" && sectorLabel == "DRAFT — pending Tom review"] { _id, ticker }`
  );
  console.log(`Fixing ${docs.length} stocks with DRAFT sectorLabel...`);
  for (const d of docs) {
    const sector = SECTORS[d.ticker] || "Other";
    await sanity.patch(d._id).set({ sectorLabel: sector }).commit();
    console.log(`  ✅ ${d.ticker} → ${sector}`);
  }
  console.log("Done.");
}

main().catch(console.error);
