/**
 * scripts/cleanup-ai-copy.mjs
 *
 * Patches AI-sounding phrases in Sanity Portable Text content.
 * Targets: playbooks, brief issues, stock file canadianInvestorParagraph.
 *
 * Usage: node scripts/cleanup-ai-copy.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

const env       = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();
const sanity    = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

// ---------------------------------------------------------------------------
// Text replacements — ordered by priority
// ---------------------------------------------------------------------------
const REPLACEMENTS = [
  // "Here is..." openers — the #1 AI tell
  { from: "Here is the core principle: ",    to: "" },
  { from: "Here is the core rule: ",         to: "" },
  { from: "Here is the core principle:",     to: "" },
  { from: "Here is the core rule:",          to: "" },
  { from: "Here is how it works. ",          to: "" },
  { from: "Here is how it works: ",          to: "" },
  { from: "Here is how it works.",           to: "" },
  { from: "Here is a concrete example. ",   to: "" },
  { from: "Here is a concrete example.",    to: "" },
  { from: "A concrete example. ",            to: "" },
  { from: "A concrete example.",             to: "" },
  { from: "Here is a practical three-tier structure:",      to: "A practical three-tier structure:" },
  { from: "Here are the annual limits by year, as confirmed by the CRA:",  to: "Annual TFSA limits (confirmed by CRA):" },
  { from: "Here is how the current 2026 guidance stacks up for the major names:", to: "2026 AISC guidance for the major names:" },
  { from: "Here is a concise profile of each major name and what role it plays in a portfolio.", to: "" },
  { from: "Here is a concise profile of each major name and what role it plays in a portfolio:", to: "" },
  { from: "Here is a practical $90,000",    to: "A practical $90,000" },
  { from: "Here are the benchmarks",        to: "The benchmarks" },
  { from: "Here are five implementation",   to: "Five implementation" },
  { from: "Here are essentially four",      to: "There are essentially four" },
  { from: "Here is the practical screening rules:", to: "Practical screening rules:" },

  // "straightforward" — flagged AI word
  { from: "The rule is straightforward: the United States", to: "The rule is simple: the United States" },
  { from: "is straightforward", to: "is simple" },
  { from: "straightforward", to: "simple" },

  // Stiff formal transitions
  { from: "It is worth noting that", to: "Worth noting:" },
  { from: "It is important to note that", to: "Note:" },
  { from: "It is important to understand that", to: "" },
  { from: "The implication is direct: ", to: "" },
  { from: "The implication is direct:", to: "" },

  // Robotic explainer openers
  { from: "The concept to understand is ", to: "" },
  { from: "The concept to understand is: ", to: "" },
  { from: "The variables that actually matter: ", to: "What actually matters: " },

  // Over-formal quantifiers
  { from: "There are essentially four implementation choices", to: "Four implementation choices" },
  { from: "There are three primary categories.", to: "Three categories stand out." },
  { from: "There are essentially four", to: "Four" },

  // "Here is the correct framework" variants
  { from: "The correct framework inverts the question.", to: "Flip the question." },
];

function cleanText(text) {
  let result = text;
  for (const { from, to } of REPLACEMENTS) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
    }
  }
  // Clean up double spaces left by removals
  result = result.replace(/  +/g, " ").trim();
  return result;
}

function cleanBlocks(blocks) {
  if (!Array.isArray(blocks)) return blocks;
  return blocks
    .map(block => {
      if (block._type !== "block") return block;
      const children = (block.children || []).map(child => {
        if (child._type !== "span" || typeof child.text !== "string") return child;
        return { ...child, text: cleanText(child.text) };
      });
      // Remove blocks that are now empty after cleanup
      const hasContent = children.some(c => c.text && c.text.trim().length > 0);
      if (!hasContent) return null;
      return { ...block, children };
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Patch playbooks
// ---------------------------------------------------------------------------
async function cleanPlaybooks() {
  console.log("\n── Playbooks ─────────────────────────────────────");
  const playbooks = await sanity.fetch(`*[_type == "playbook"] { _id, title, sections }`);
  console.log(`Found ${playbooks.length} playbooks`);

  for (const pb of playbooks) {
    const cleanedSections = (pb.sections || []).map(sec => ({
      ...sec,
      body: cleanBlocks(sec.body),
    }));
    await sanity.patch(pb._id).set({ sections: cleanedSections }).commit();
    console.log(`  ✅ ${pb.title}`);
  }
}

// ---------------------------------------------------------------------------
// Patch Brief issues
// ---------------------------------------------------------------------------
async function cleanBriefs() {
  console.log("\n── Brief issues ──────────────────────────────────");
  const briefs = await sanity.fetch(`*[_type == "brief"] { _id, title, featureThesis, taxOrAccountTip }`);
  console.log(`Found ${briefs.length} brief issues`);

  for (const b of briefs) {
    await sanity.patch(b._id).set({
      featureThesis:   cleanBlocks(b.featureThesis),
      taxOrAccountTip: cleanBlocks(b.taxOrAccountTip),
    }).commit();
    console.log(`  ✅ ${b.title}`);
  }
}

// ---------------------------------------------------------------------------
// Patch stock file canadianInvestorParagraph
// ---------------------------------------------------------------------------
async function cleanStockFiles() {
  console.log("\n── Stock File paragraphs ─────────────────────────");
  const stocks = await sanity.fetch(`*[_type == "stockFile"] { _id, ticker, canadianInvestorParagraph }`);
  console.log(`Found ${stocks.length} stock files`);

  let patched = 0;
  for (const sf of stocks) {
    if (!sf.canadianInvestorParagraph) continue;
    const cleaned = cleanText(sf.canadianInvestorParagraph);
    if (cleaned !== sf.canadianInvestorParagraph) {
      await sanity.patch(sf._id).set({ canadianInvestorParagraph: cleaned }).commit();
      console.log(`  ✅ ${sf.ticker}`);
      patched++;
    }
  }
  if (patched === 0) console.log("  No changes needed.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("AlphaBeat AI copy cleanup — " + new Date().toISOString());
  console.log("Removing: 'Here is...', 'straightforward', 'A concrete example.', formal openers\n");

  await cleanPlaybooks();
  await cleanBriefs();
  await cleanStockFiles();

  console.log("\n✅ Done. Check the live site — content should read more naturally now.");
}

main().catch(err => { console.error(err); process.exit(1); });
