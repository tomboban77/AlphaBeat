// One-shot Sanity seeder.
// Usage:  node scripts/seed.mjs            -> seeds sectors then stocks
//         node scripts/seed.mjs --reset    -> deletes existing seeded docs first
//
// Reads .env.local for SANITY_API_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET.
// Idempotent: uses createOrReplace with deterministic IDs from the NDJSON files.

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "next-sanity";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (!m) continue;
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
loadEnv();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env.local"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

function readNdjson(file) {
  const path = resolve(ROOT, "scripts", "seed", file);
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function upsert(docs, label) {
  const tx = client.transaction();
  for (const d of docs) tx.createOrReplace(d);
  const res = await tx.commit({ visibility: "async" });
  console.log(`  ${label}: ${docs.length} upserted (transactionId=${res.transactionId})`);
}

async function reset(ids) {
  if (!ids.length) return;
  const tx = client.transaction();
  for (const id of ids) tx.delete(id);
  const res = await tx.commit({ visibility: "async" }).catch((e) => {
    console.warn("  reset warning:", e.message);
    return null;
  });
  if (res) console.log(`  reset: deleted ${ids.length} docs`);
}

async function main() {
  const args = process.argv.slice(2);
  const doReset = args.includes("--reset");

  const authors = readNdjson("authors.ndjson");
  const sectors = readNdjson("sectors.ndjson");
  const stocks = readNdjson("stocks.ndjson");
  const hiddenGems = readNdjson("hidden-gems.ndjson");
  const etfs = readNdjson("etfs.ndjson");
  const insights = readNdjson("insights.ndjson");
  const weeklyPicks = readNdjson("weekly-picks.ndjson");
  const topLists = readNdjson("top-lists.ndjson");

  console.log(`Seeding into ${projectId}/${dataset}…`);

  if (doReset) {
    console.log("Resetting existing seeded docs…");
    // Reverse dependency order: leaf docs first, refs/parents last.
    await reset([
      ...topLists.map((d) => d._id),
      ...weeklyPicks.map((d) => d._id),
      ...insights.map((d) => d._id),
      ...etfs.map((d) => d._id),
      ...hiddenGems.map((d) => d._id),
      ...stocks.map((d) => d._id),
      ...sectors.map((d) => d._id),
      ...authors.map((d) => d._id),
    ]);
  }

  console.log("Upserting authors…");
  await upsert(authors, "authors");

  console.log("Upserting sectors…");
  await upsert(sectors, "sectors");

  console.log("Upserting stocks…");
  await upsert(stocks, "stocks");

  console.log("Upserting hidden gems…");
  await upsert(hiddenGems, "hiddenGems");

  console.log("Upserting ETFs…");
  await upsert(etfs, "etfs");

  console.log("Upserting insights…");
  await upsert(insights, "insights");

  console.log("Upserting weekly picks…");
  await upsert(weeklyPicks, "weeklyPicks");

  console.log("Upserting top lists…");
  await upsert(topLists, "topLists");

  console.log("\nDone. Visit http://localhost:3000 to see populated rails.");
  console.log("  /weekly-picks      → weekly Top 10");
  console.log("  /top               → permanent top-by-sector lists");
  console.log("  /hidden-gems       → 5 sub-$20 high-upside picks");
  console.log("  /stocks            → 15 curated stocks");
  console.log("  /sectors           → 6 sector hubs");
  console.log("  /etfs              → 6 ETFs");
  console.log("  /insights          → 5 articles");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
