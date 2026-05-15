/**
 * scripts/import-content.mjs
 *
 * Reads a markdown file with YAML frontmatter and creates or updates the
 * corresponding Sanity document. Supports: stockFile, brief, playbook, rankedList.
 *
 * Usage:
 *   node scripts/import-content.mjs content/stocks/ry-to.md
 *   node scripts/import-content.mjs content/briefs/issue-001.md
 *
 * Frontmatter fields map directly to Sanity schema fields.
 * The body (below the --- delimiter) becomes featureThesis for briefs,
 * or the first section body for playbooks.
 */

import { readFileSync, existsSync } from "fs";
import { createClient } from "@sanity/client";

const envRaw    = readFileSync(".env.local", "utf8");
const projectId = envRaw.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = envRaw.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = envRaw.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();

if (!projectId || !token) { console.error("Missing Sanity env vars"); process.exit(1); }
const sanity = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

// ---------------------------------------------------------------------------
// Minimal YAML frontmatter parser (no external dep)
// ---------------------------------------------------------------------------
function parseFrontmatter(raw) {
  const lines = raw.split("\n");
  if (lines[0].trim() !== "---") throw new Error("File must start with ---");

  const endIdx = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (endIdx === -1) throw new Error("No closing --- found");

  const fmLines = lines.slice(1, endIdx);
  const body    = lines.slice(endIdx + 1).join("\n").trim();

  const fm = {};
  for (const line of fmLines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let   val = line.slice(colonIdx + 1).trim();
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  }

  return { fm, body };
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");
}

function bodyToPortableText(body) {
  if (!body) return [];
  return body.split("\n\n").filter(Boolean).map((para, i) => ({
    _type: "block",
    _key:  `p${i}`,
    style: "normal",
    children: [{ _type: "span", _key: `s${i}`, text: para.trim(), marks: [] }],
    markDefs: [],
  }));
}

// ---------------------------------------------------------------------------
// Builders per type
// ---------------------------------------------------------------------------
function buildStockFile(fm) {
  const ticker = (fm.ticker || "").toUpperCase();
  const slug   = fm.slug || slugify(ticker);
  return {
    _id:   `sf-${slug}`,
    _type: "stockFile",
    ticker,
    exchange:     fm.exchange || "TSX",
    finnhubSymbol: fm.finnhubSymbol || ticker.replace(/\.(TO|V)$/i, ""),
    companyName:  fm.companyName || "DRAFT",
    sectorLabel:  fm.sectorLabel || "DRAFT",
    slug:         { _type: "slug", current: slug },
    lastReviewed: fm.lastReviewed || new Date().toISOString(),
    reviewType:   fm.reviewType || "quick",
    bullCase:     fm.bullCase ? fm.bullCase.split("|").map(s => s.trim()) : ["DRAFT","DRAFT","DRAFT"],
    bearCase:     fm.bearCase ? fm.bearCase.split("|").map(s => s.trim()) : ["DRAFT","DRAFT","DRAFT"],
    canadianInvestorParagraph: fm.canadianInvestorParagraph || "DRAFT",
  };
}

function buildBrief(fm, body) {
  const slug = fm.slug || slugify(fm.title || "issue");
  return {
    _id:   `brief-${slug}`,
    _type: "brief",
    title:       fm.title || "DRAFT",
    slug:        { _type: "slug", current: slug },
    issueNumber: parseInt(fm.issueNumber || "1", 10),
    publishedAt: fm.publishedAt || new Date().toISOString(),
    featureThesis: bodyToPortableText(body),
    taxOrAccountTip: bodyToPortableText(fm.taxOrAccountTip || ""),
    tsxQuickNote: fm.tsxQuickNote || undefined,
    seoDescription: fm.seoDescription || undefined,
  };
}

function buildPlaybook(fm, body) {
  const slug = fm.slug || slugify(fm.title || "playbook");
  return {
    _id:   `pb-${slug}`,
    _type: "playbook",
    title:       fm.title || "DRAFT",
    slug:        { _type: "slug", current: slug },
    lastUpdated: fm.lastUpdated || new Date().toISOString(),
    seoDescription: fm.seoDescription || undefined,
    sections: body ? [{
      _key:    "s0",
      heading: fm.firstSectionHeading || "Overview",
      body:    bodyToPortableText(body),
    }] : [],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const filePath = process.argv[2];
  if (!filePath) { console.error("Usage: node scripts/import-content.mjs <file.md>"); process.exit(1); }
  if (!existsSync(filePath)) { console.error(`File not found: ${filePath}`); process.exit(1); }

  const raw = readFileSync(filePath, "utf8");
  const { fm, body } = parseFrontmatter(raw);

  const type = fm.type;
  if (!type) { console.error("Frontmatter must include: type: stockFile|brief|playbook"); process.exit(1); }

  let doc;
  if (type === "stockFile")  doc = buildStockFile(fm);
  else if (type === "brief") doc = buildBrief(fm, body);
  else if (type === "playbook") doc = buildPlaybook(fm, body);
  else { console.error(`Unknown type: ${type}`); process.exit(1); }

  console.log(`Importing ${type}: ${doc._id}`);
  await sanity.createOrReplace(doc);
  console.log(`✅  Done — view in Studio at /studio`);
}

main().catch(err => { console.error(err); process.exit(1); });
