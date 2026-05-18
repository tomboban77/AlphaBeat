/**
 * scripts/publish-all.mjs
 *
 * Publishes all draft stockFile, brief, playbook, and rankedList documents.
 * Run once after seeding to make everything visible on the live site.
 *
 * Usage: node scripts/publish-all.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

const env       = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();

if (!projectId || !token) { console.error("Missing Sanity env vars"); process.exit(1); }

const client = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

const TYPES = ["stockFile", "brief", "playbook", "rankedList"];

async function main() {
  console.log("Publishing all AlphaBeat content documents…\n");

  // Fetch all draft documents (IDs start with "drafts.")
  const drafts = await client.fetch(
    `*[_type in $types && _id in path("drafts.**")] { _id, _type, "publishedId": string::split(_id, "drafts.")[1] }`,
    { types: TYPES }
  );

  // Also fetch documents that were created without going through Studio
  // (they exist as published but might not show in Studio as published)
  const published = await client.fetch(
    `*[_type in $types && !(_id in path("drafts.**"))] { _id, _type }`,
    { types: TYPES }
  );

  console.log(`Found ${drafts.length} drafts and ${published.length} published documents\n`);

  let ok = 0, failed = 0;

  // Publish each draft via Sanity Actions API
  for (const doc of drafts) {
    const publishedId = doc._id.replace(/^drafts\./, "");
    process.stdout.write(`  Publishing ${doc._type} ${publishedId} … `);
    try {
      await client.request({
        url: `/data/actions/${dataset}`,
        withCredentials: true,
        method: "POST",
        body: {
          actions: [{
            actionType: "sanity.action.document.publish",
            draftId:     doc._id,
            publishedId: publishedId,
          }],
        },
      });
      console.log("✅");
      ok++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }
  }

  // For documents that only exist as published (created via createOrReplace),
  // they're already live — just report them
  if (published.length > 0 && drafts.length === 0) {
    console.log(`All ${published.length} documents are already published ✅`);
  }

  console.log(`\nDone. Published: ${ok}  Already live: ${published.length - ok}  Failed: ${failed}`);
}

main().catch(err => { console.error(err); process.exit(1); });
