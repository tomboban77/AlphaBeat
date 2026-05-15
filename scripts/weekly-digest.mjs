/**
 * scripts/weekly-digest.mjs
 *
 * Generates and sends a personalised weekly watchlist digest to every
 * active digestSubscriber in Sanity.
 *
 * Each email contains, per watchlist ticker:
 *   • Current price + week change %
 *   • AlphaBeat overall score
 *   • One recent Finnhub news headline
 *
 * Email sending: uses Resend REST API (free tier: 3,000/mo).
 *   Requires: RESEND_API_KEY env var.
 *   Signup: https://resend.com (free, no credit card)
 *
 * Run:  node scripts/weekly-digest.mjs
 * Cron: .github/workflows/weekly-digest.yml (Sunday 10:00 UTC = 06:00 ET)
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const env        = readFileSync(".env.local", "utf8");
const projectId  = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset    = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token      = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();
const finnhubKey = env.match(/FINNHUB_API_KEY=(.+)/)?.[1]?.trim();
const resendKey  = env.match(/RESEND_API_KEY=(.+)/)?.[1]?.trim()
                || process.env.RESEND_API_KEY;
const siteUrl    = env.match(/NEXT_PUBLIC_SITE_URL=(.+)/)?.[1]?.trim() || "https://alphabeat.io";

if (!projectId || !token) { console.error("Missing Sanity env vars"); process.exit(1); }
if (!finnhubKey)           { console.error("Missing FINNHUB_API_KEY"); process.exit(1); }
if (!resendKey)            {
  console.warn("⚠  RESEND_API_KEY not set — emails will be logged to console only.");
  console.warn("   Sign up at https://resend.com (free) and add RESEND_API_KEY to .env.local");
}

const sanity   = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });
const BASE_FH  = "https://finnhub.io/api/v1";
const FROM     = "AlphaBeat <brief@alphabeat.io>"; // set a verified Resend sender domain

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------------------------------------------------------------------------
// Finnhub helpers
// ---------------------------------------------------------------------------
async function getQuote(symbol) {
  const bare = symbol.replace(/\.(TO|V)$/i, "");
  try {
    const r = await fetch(`${BASE_FH}/quote?symbol=${encodeURIComponent(bare)}&token=${finnhubKey}`, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const d = await r.json();
    if (!d.c) return null;
    return { price: d.c, change: d.d ?? 0, changePct: d.dp ?? 0 };
  } catch { return null; }
}

async function getNewsHeadline(symbol) {
  const bare = symbol.replace(/\.(TO|V)$/i, "");
  const to   = new Date().toISOString().slice(0,10);
  const from = new Date(Date.now() - 7 * 86400000).toISOString().slice(0,10);
  try {
    const r = await fetch(`${BASE_FH}/company-news?symbol=${encodeURIComponent(bare)}&from=${from}&to=${to}&token=${finnhubKey}`, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const d = await r.json();
    return Array.isArray(d) && d.length > 0 ? d[0].headline : null;
  } catch { return null; }
}

// ---------------------------------------------------------------------------
// Score lookup
// ---------------------------------------------------------------------------
async function getScores(tickers) {
  const snaps = await sanity.fetch(
    `*[_type == "scoreSnapshot" && ticker in $tickers] | order(computedAt desc) { ticker, "overall": scores.overall }`,
    { tickers }
  );
  const map = new Map();
  for (const s of snaps) { if (!map.has(s.ticker)) map.set(s.ticker, s.overall); }
  return map;
}

// ---------------------------------------------------------------------------
// HTML email generator
// ---------------------------------------------------------------------------
function formatPct(n) {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}
function formatPx(n, currency = "CAD") {
  if (!n) return "—";
  const sym = currency === "USD" ? "US$" : "CA$";
  return `${sym}${n.toFixed(2)}`;
}
function scoreColor(s) {
  if (s == null) return "#6b7280";
  if (s >= 70) return "#34d399";
  if (s >= 50) return "#60a5fa";
  if (s >= 30) return "#fbbf24";
  return "#f87171";
}

function generateHtml({ email, tickers, tickerData, weekEnding }) {
  const rows = tickers.map((ticker) => {
    const d = tickerData[ticker] || {};
    const pct = d.changePct ?? null;
    const pctColor = pct == null ? "#6b7280" : pct >= 0 ? "#34d399" : "#f87171";
    const scoreVal = d.score ?? null;
    return `
      <tr style="border-bottom:1px solid #1f2937">
        <td style="padding:14px 16px;font-family:monospace;font-size:15px;font-weight:700;color:#f9fafb">${ticker}</td>
        <td style="padding:14px 16px;font-size:13px;color:#d1d5db">${d.name || ticker}</td>
        <td style="padding:14px 16px;font-family:monospace;font-size:14px;color:#f9fafb;text-align:right">${formatPx(d.price, d.currency)}</td>
        <td style="padding:14px 16px;font-family:monospace;font-size:13px;color:${pctColor};text-align:right">${formatPct(pct)}</td>
        <td style="padding:14px 16px;font-family:monospace;font-size:14px;font-weight:700;color:${scoreColor(scoreVal)};text-align:right">${scoreVal ?? "N/A"}</td>
        ${d.headline ? `<td style="padding:14px 16px;font-size:12px;color:#9ca3af;max-width:260px">${d.headline}</td>` : `<td style="padding:14px 16px;font-size:12px;color:#6b7280">—</td>`}
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your AlphaBeat Watchlist — ${weekEnding}</title></head>
<body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:700px;margin:0 auto;padding:32px 16px">
    <!-- Header -->
    <div style="margin-bottom:32px">
      <a href="${siteUrl}" style="font-size:22px;font-weight:800;color:#f9fafb;text-decoration:none">AlphaBeat</a>
      <p style="margin:8px 0 0;font-size:14px;color:#6b7280">Your watchlist digest · Week ending ${weekEnding}</p>
    </div>

    <!-- Table -->
    <div style="background:#111827;border-radius:16px;overflow:hidden;margin-bottom:24px">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#1f2937">
            <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Ticker</th>
            <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Company</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Price</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Week</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Score</th>
            <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Headline</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="margin-bottom:24px">
      <a href="${siteUrl}/stocks" style="display:inline-block;background:#06b6d4;color:#030712;font-size:14px;font-weight:600;padding:12px 24px;border-radius:999px;text-decoration:none">
        Open Stock Files →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1f2937;padding-top:20px;font-size:12px;color:#4b5563;line-height:1.6">
      <p>Nothing in this email is investment advice. Prices are delayed ~15 min. Scores refresh daily.</p>
      <p style="margin-top:8px">
        <a href="${siteUrl}/disclaimer" style="color:#6b7280">Disclaimer</a> ·
        <a href="${siteUrl}/watchlist" style="color:#6b7280">Update watchlist</a> ·
        <a href="mailto:unsubscribe@alphabeat.io?subject=Unsubscribe+digest&body=${encodeURIComponent(email)}" style="color:#6b7280">Unsubscribe</a>
      </p>
      <p style="margin-top:4px">© ${new Date().getFullYear()} AlphaBeat</p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Send via Resend REST API (no npm package needed)
// ---------------------------------------------------------------------------
async function sendEmail({ to, subject, html }) {
  if (!resendKey) {
    console.log(`  [DRY] Would send to ${to}: ${subject}`);
    return true;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!r.ok) {
      const err = await r.text();
      console.warn(`  ⚠  Resend error for ${to}: ${err}`);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`  ⚠  Send failed for ${to}: ${e.message}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const weekEnding = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  console.log(`AlphaBeat Weekly Digest — ${weekEnding}`);
  if (!resendKey) console.log("DRY RUN (no RESEND_API_KEY) — emails logged only\n");

  // Fetch active subscribers
  const subscribers = await sanity.fetch(
    `*[_type == "digestSubscriber" && active == true && count(watchlistTickers) > 0] { email, watchlistTickers }`
  );
  console.log(`${subscribers.length} active digest subscribers\n`);

  if (!subscribers.length) { console.log("Nothing to send."); return; }

  // Collect all unique tickers
  const allTickers = [...new Set(subscribers.flatMap((s) => s.watchlistTickers))];
  console.log(`Fetching data for ${allTickers.length} unique tickers…`);

  // Fetch metadata + scores from Sanity
  const stockFiles = await sanity.fetch(
    `*[_type == "stockFile" && ticker in $tickers] { ticker, companyName }`,
    { tickers: allTickers }
  );
  const sfMap = new Map(stockFiles.map((s) => [s.ticker, s.companyName]));
  const scoreMap = await getScores(allTickers);

  // Fetch quotes + headlines per ticker (rate-limited)
  const tickerData = {};
  for (const ticker of allTickers) {
    await sleep(1200);
    const q = await getQuote(ticker);
    await sleep(1200);
    const headline = await getNewsHeadline(ticker);
    tickerData[ticker] = {
      name:     sfMap.get(ticker) || ticker,
      price:    q?.price    ?? null,
      changePct: q?.changePct ?? null,
      currency: ticker.endsWith(".TO") || ticker.endsWith(".V") ? "CAD" : "USD",
      score:    scoreMap.get(ticker) ?? null,
      headline,
    };
  }

  // Send per subscriber
  let sent = 0, failed = 0;
  for (const sub of subscribers) {
    const subject = `Your AlphaBeat watchlist — ${sub.watchlistTickers.slice(0,3).join(", ")}${sub.watchlistTickers.length > 3 ? " + more" : ""}`;
    const html    = generateHtml({ email: sub.email, tickers: sub.watchlistTickers, tickerData, weekEnding });
    process.stdout.write(`  Sending to ${sub.email} (${sub.watchlistTickers.length} tickers) … `);
    const ok = await sendEmail({ to: sub.email, subject, html });
    console.log(ok ? "✅" : "❌");
    if (ok) { sent++; } else { failed++; }
  }

  console.log(`\nDone. Sent: ${sent}  Failed: ${failed}`);
}

main().catch(err => { console.error(err); process.exit(1); });
