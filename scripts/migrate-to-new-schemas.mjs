/**
 * scripts/migrate-to-new-schemas.mjs
 *
 * Migrates legacy Sanity documents to the Phase 2 schemas:
 *   stock        → stockFile
 *   weeklyPick   → brief
 *   topList      → rankedList
 *
 * IMPORTANT:
 *   1. Run against a DUPLICATE dataset first (never production without Tom's explicit go-ahead)
 *   2. Review the output log before running on production
 *   3. Pass --dry-run to preview without writing
 *
 * Usage:
 *   node scripts/migrate-to-new-schemas.mjs --dry-run
 *   node scripts/migrate-to-new-schemas.mjs --dataset staging
 *   node scripts/migrate-to-new-schemas.mjs --dataset production   ← requires Tom confirmation
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const datasetIdx = args.indexOf("--dataset");
const datasetArg = args.find((a) => a.startsWith("--dataset="))?.split("=")[1]
  || (datasetIdx !== -1 ? args[datasetIdx + 1] : undefined);
const dataset = datasetArg || "production";

if (dataset === "production" && !DRY_RUN && !args.includes("--confirm-production")) {
  console.error(
    "❌ STOP. You're about to run this against PRODUCTION.\n" +
    "   This requires Tom's explicit go-ahead.\n" +
    "   If you have it, re-run with --confirm-production added.\n"
  );
  process.exit(1);
}

const env = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

const LOG = [];
let created = 0, skipped = 0, errored = 0;

function log(msg) {
  console.log(msg);
  LOG.push(msg);
}

async function createDoc(doc) {
  if (DRY_RUN) {
    log(`  [DRY] Would create ${doc._type}: ${doc._id}`);
    return;
  }
  try {
    await client.createOrReplace(doc);
    log(`  ✅ Created ${doc._type}: ${doc._id}`);
    created++;
  } catch (err) {
    log(`  ❌ Error creating ${doc._type}: ${doc._id} — ${err.message}`);
    errored++;
  }
}

// ---------------------------------------------------------------------------
// stock → stockFile
// ---------------------------------------------------------------------------

async function migrateStocks() {
  log("\n── Migrating stock → stockFile ──────────────────────────────");
  const stocks = await client.fetch(`*[_type == "stock"]`);
  log(`Found ${stocks.length} stock documents`);

  for (const s of stocks) {
    const slug = s.slug?.current || s.ticker?.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (!slug) { log(`  ⚠ Skipping stock with no slug/ticker: ${s._id}`); skipped++; continue; }

    const exchange = (s.exchange === "TSX" || s.exchange === "TSXV" || s.exchange === "NYSE" || s.exchange === "NASDAQ")
      ? s.exchange : "TSX";

    const finnhubSymbol = s.ticker?.replace(/\.(TO|V)$/i, "") || s.ticker;

    // Pad bull/bear to exactly 3 or leave empty
    const bullCase = padTo3(s.bullCase, "DRAFT — pending Tom review");
    const bearCase = padTo3(s.bearCase, "DRAFT — pending Tom review");

    const stockFile = {
      _id: `stockFile-${s._id}`,
      _type: "stockFile",
      ticker: (s.ticker || "UNKNOWN").toUpperCase(),
      exchange,
      finnhubSymbol,
      companyName: s.name || "DRAFT — pending Tom review",
      sectorLabel: s.sector?.title || "DRAFT — pending Tom review",
      slug: { _type: "slug", current: slug },
      lastReviewed: new Date().toISOString(),
      reviewType: "quick",
      bullCase,
      bearCase,
      canadianInvestorParagraph: s.headline || "DRAFT — pending Tom review",
      accountFit: {
        tfsa:          { recommendation: "acceptable", reasoning: "DRAFT — pending Tom review" },
        rrsp:          { recommendation: "acceptable", reasoning: "DRAFT — pending Tom review" },
        fhsa:          { recommendation: "acceptable", reasoning: "DRAFT — pending Tom review" },
        nonRegistered: { recommendation: "acceptable", reasoning: "DRAFT — pending Tom review" },
      },
    };

    log(`  → stock "${s.ticker}" (${s._id}) → stockFile "${stockFile._id}"`);
    await createDoc(stockFile);
  }
}

// ---------------------------------------------------------------------------
// weeklyPick → brief (best-effort)
// ---------------------------------------------------------------------------

async function migrateWeeklyPicks() {
  log("\n── Migrating weeklyPick → brief ─────────────────────────────");
  const picks = await client.fetch(`*[_type == "weeklyPick"]`);
  log(`Found ${picks.length} weeklyPick documents`);

  for (let i = 0; i < picks.length; i++) {
    const p = picks[i];
    const slug = p.slug?.current || `issue-${i + 1}`;

    const featureRef = p.picks?.[0]?.stock?._ref
      ? { _type: "reference", _ref: `stockFile-${p.picks[0].stock._ref}` }
      : undefined;

    const brief = {
      _id: `brief-${p._id}`,
      _type: "brief",
      title: p.title || "DRAFT — pending Tom review",
      slug: { _type: "slug", current: slug },
      issueNumber: i + 1,
      publishedAt: p.weekOf || new Date().toISOString(),
      ...(featureRef && { featureStock: featureRef }),
      featureThesis: p.intro || [{ _type: "block", _key: "draft", style: "normal", children: [{ _type: "span", _key: "t", text: "DRAFT — pending Tom review", marks: [] }], markDefs: [] }],
      taxOrAccountTip: [{ _type: "block", _key: "tip", style: "normal", children: [{ _type: "span", _key: "t", text: "DRAFT — pending Tom review", marks: [] }], markDefs: [] }],
    };

    log(`  → weeklyPick "${p.title}" (${p._id}) → brief "${brief._id}"`);
    await createDoc(brief);
  }
}

// ---------------------------------------------------------------------------
// topList → rankedList (best-effort)
// ---------------------------------------------------------------------------

async function migrateTopLists() {
  log("\n── Migrating topList → rankedList ───────────────────────────");
  const lists = await client.fetch(`*[_type == "topList"]`);
  log(`Found ${lists.length} topList documents`);

  for (const l of lists) {
    const slug = l.slug?.current || l.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!slug) { log(`  ⚠ Skipping topList with no slug: ${l._id}`); skipped++; continue; }

    const entries = (l.picks || []).slice(0, 10).map((pick, i) => ({
      _key: `entry-${i}`,
      rank: i + 1,
      ...(pick.stock?._ref && { stockFile: { _type: "reference", _ref: `stockFile-${pick.stock._ref}` } }),
      editorTake: pick.thesis || "DRAFT — pending Tom review",
      keyMetric: "DRAFT — pending Tom review",
    }));

    const rankedList = {
      _id: `rankedList-${l._id}`,
      _type: "rankedList",
      title: l.title || "DRAFT — pending Tom review",
      slug: { _type: "slug", current: slug },
      year: new Date().getFullYear(),
      category: "dividend-stocks",
      accountFocus: "any",
      lastUpdated: l.lastUpdated || new Date().toISOString(),
      entries,
    };

    log(`  → topList "${l.title}" (${l._id}) → rankedList "${rankedList._id}"`);
    await createDoc(rankedList);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function padTo3(arr, placeholder) {
  const base = Array.isArray(arr) ? arr.slice(0, 3) : [];
  while (base.length < 3) base.push(placeholder);
  return base;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("═".repeat(60));
  console.log(`AlphaBeat migration: legacy → Phase 2 schemas`);
  console.log(`Dataset : ${dataset}`);
  console.log(`Dry run : ${DRY_RUN}`);
  console.log("═".repeat(60));

  if (DRY_RUN) {
    console.log("DRY RUN — no documents will be written\n");
  }

  await migrateStocks();
  await migrateWeeklyPicks();
  await migrateTopLists();

  console.log("\n" + "═".repeat(60));
  console.log(`Done. Created: ${created}, Skipped: ${skipped}, Errors: ${errored}`);
  if (DRY_RUN) console.log("Re-run without --dry-run to apply changes.");
  if (errored > 0) { console.error(`\n${errored} errors — review log above before proceeding.`); process.exit(1); }
}

main().catch((err) => { console.error(err); process.exit(1); });
