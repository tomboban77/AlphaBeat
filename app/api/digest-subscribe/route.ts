import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { getNewsletterProvider } from "@/lib/newsletter/provider";

const writeSanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token:     process.env.SANITY_API_TOKEN,
  apiVersion: "2024-01-01",
  useCdn:    false,
});

interface DigestSubscribeBody {
  email:            string;
  watchlistTickers: string[];
  website?:         string; // honeypot
}

export async function POST(request: Request) {
  let body: DigestSubscribeBody;
  try {
    body = (await request.json()) as DigestSubscribeBody;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Honeypot
  if (body.website) return NextResponse.json({ ok: true });

  const email   = (body.email || "").trim().toLowerCase();
  const tickers = (body.watchlistTickers || []).map((t) => t.toUpperCase()).filter(Boolean).slice(0, 50);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // 1. Store in Sanity
  const docId = `digest-${Buffer.from(email).toString("base64").replace(/[^a-z0-9]/gi, "").slice(0, 32)}`;
  try {
    await writeSanity.createOrReplace({
      _id:              docId,
      _type:            "digestSubscriber",
      email,
      watchlistTickers: tickers,
      subscribedAt:     new Date().toISOString(),
      active:           true,
      source:           "watchlist-page",
    });
  } catch (err) {
    console.error("[digest-subscribe] Sanity write failed:", err);
    return NextResponse.json({ error: "Could not save subscription" }, { status: 500 });
  }

  // 2. Also add to Beehiiv for the main Brief newsletter
  try {
    const provider = getNewsletterProvider();
    await provider.subscribe({ email, source: "watchlist-digest" });
  } catch {
    // Non-fatal — Sanity record is the source of truth for the digest
  }

  return NextResponse.json({ ok: true });
}
