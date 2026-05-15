/**
 * scripts/score.mjs
 *
 * Computes AlphaBeat 6-factor scores for all published stockFile documents,
 * then persists a scoreSnapshot to Sanity (keyed by ticker + date).
 *
 * Run manually:   node scripts/score.mjs
 * GitHub Actions: .github/workflows/score-refresh.yml (daily cron)
 *
 * Rate limiting: Finnhub free tier = 60 req/min.
 * This script uses 2–3 calls per stock + 1 for GSPTSE index.
 * A 1.2s delay between calls keeps us safely within limits.
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

// ---------------------------------------------------------------------------
// Load env + init Sanity client
// ---------------------------------------------------------------------------

const env       = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();
const finnhubKey = env.match(/FINNHUB_API_KEY=(.+)/)?.[1]?.trim();

if (!projectId || !token) { console.error("Missing Sanity env vars"); process.exit(1); }
if (!finnhubKey)          { console.error("Missing FINNHUB_API_KEY"); process.exit(1); }

const sanity = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

// ---------------------------------------------------------------------------
// Finnhub helpers (plain fetch — no Next.js cache here)
// ---------------------------------------------------------------------------

const BASE = "https://finnhub.io/api/v1";

async function fetchMetrics(symbol) {
  const url = `${BASE}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${finnhubKey}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.metric || null;
  } catch { return null; }
}

async function fetchCandles(symbol, daysBack = 420) {
  const now  = Math.floor(Date.now() / 1000);
  const from = now - daysBack * 86400;
  const url  = `${BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${now}&token=${finnhubKey}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.s !== "ok" || !data.t?.length) return [];
    return data.t.map((t, i) => ({ t, c: data.c[i] }));
  } catch { return []; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------------------------------------------------------------------------
// Scoring functions (duplicated from TypeScript to avoid TS compilation)
// ---------------------------------------------------------------------------

function piecewise(value, thresholds) {
  for (const [threshold, score] of thresholds) {
    if (value <= threshold) return score;
  }
  return thresholds[thresholds.length - 1][1];
}

function scoreValue(m, sectorLabel) {
  const SECTOR_PE = { "Canadian Banks": 12, "Canadian Energy": 14, "Canadian Telecom": 16, "Utilities": 17, "Canadian Utilities": 17, "Canadian REITs": 22, "REITs": 22, "Precious Metals": 28, "Technology": 32, "Consumer Discretionary": 20, "Healthcare": 24, "Industrials": 19, "Materials": 16, "Financials": 14 };
  const pe = m.peNormalizedAnnual, pb = m.pbAnnual, evEbitda = m.evEbitdaTTM, pfcf = m.pfcfShareTTM ?? m.pfcfShareAnnual;
  const pairs = [[pe, 0.35], [pb, 0.25], [evEbitda, 0.25], [pfcf, 0.15]].filter(([v]) => v != null && v > 0 && isFinite(v));
  if (!pairs.length) return null;
  const medianPE = Object.entries(SECTOR_PE).find(([k]) => sectorLabel.toLowerCase().includes(k.toLowerCase()))?.[1] ?? 18;
  const scores = []; const weights = [];
  if (pe != null && pe > 0 && isFinite(pe))         { scores.push(piecewise(pe/medianPE, [[0.6,95],[0.8,80],[1.0,65],[1.25,45],[1.5,30],[Infinity,15]])); weights.push(0.35); }
  if (pb != null && pb > 0 && isFinite(pb))         { scores.push(piecewise(pb, [[1,90],[2,75],[3,60],[5,40],[Infinity,20]])); weights.push(0.25); }
  if (evEbitda != null && evEbitda > 0 && isFinite(evEbitda)) { scores.push(piecewise(evEbitda, [[8,90],[12,75],[18,55],[25,35],[Infinity,15]])); weights.push(0.25); }
  if (pfcf != null && pfcf > 0 && isFinite(pfcf))   { const y = (1/pfcf)*100; scores.push(piecewise(-y, [[-10,90],[-7,75],[-5,60],[-3,40],[Infinity,20]])); weights.push(0.15); }
  const tw = weights.reduce((a,b)=>a+b,0);
  return Math.round(scores.reduce((s,v,i)=>s+v*weights[i],0)/tw);
}

function scoreGrowth(m) {
  const g = v => { const c = Math.min(v,200); return c>20?95:c>15?85:c>10?72:c>5?58:c>0?45:c>-5?30:15; };
  const pairs = [[m.revenueGrowth3Y,0.40],[m.epsGrowth3Y,0.35],[m.revenueGrowthQuarterlyYoy,0.25]].filter(([v])=>v!=null&&isFinite(v));
  if (!pairs.length) return null;
  const tw = pairs.reduce((s,[,w])=>s+w,0);
  return Math.round(pairs.reduce((s,[v,w])=>s+g(v)*w,0)/tw);
}

function scoreQuality(m, sectorLabel) {
  const isBank = /bank|financial/i.test(sectorLabel);
  const ro = v => v>25?95:v>18?82:v>12?68:v>6?50:v>0?32:12;
  const de = (v,b) => b?(v<5?70:v<10?55:v<15?40:30):(v<0.3?95:v<0.5?82:v<1?65:v<2?45:25);
  const mg = v => v>25?95:v>15?80:v>8?65:v>3?48:v>0?32:12;
  const roe=m.roeTTM, roic=m.roiTTM, deRatio=m["totalDebt/totalEquityAnnual"]??m["totalDebt/totalEquityQuarterly"], margin=m.netProfitMarginTTM??m.grossMarginTTM;
  const scores=[]; const weights=[];
  if (roe!=null&&isFinite(roe))       { scores.push(ro(roe));          weights.push(0.30); }
  if (roic!=null&&isFinite(roic))     { scores.push(ro(roic));         weights.push(0.30); }
  if (deRatio!=null&&isFinite(deRatio)&&deRatio>=0) { scores.push(de(deRatio,isBank)); weights.push(0.20); }
  if (margin!=null&&isFinite(margin)) { scores.push(mg(margin));       weights.push(0.20); }
  if (!scores.length) return null;
  const tw = weights.reduce((a,b)=>a+b,0);
  return Math.round(scores.reduce((s,v,i)=>s+v*weights[i],0)/tw);
}

function scoreDividendSafety(m) {
  const yield_ = m.dividendYieldIndicatedAnnual ?? m.currentDividendYieldTTM ?? 0;
  if (!yield_ || yield_ <= 0) return 50;
  const payout=m.payoutRatioAnnual??m.payoutRatioTTM, g5y=m.dividendGrowthRate5Y, pfcf=m.pfcfShareTTM??m.pfcfShareAnnual;
  if ([payout,g5y,pfcf].filter(v=>v!=null&&isFinite(v)).length===0) return null;
  const ps = r => r===0?50:r<=50?95:r<=65?78:r<=80?55:r<=90?35:15;
  const gs = p => p>10?95:p>7?82:p>5?70:p>3?57:p>0?44:22;
  const fs = p => { const y=(1/p)*100; return y>10?95:y>7?80:y>5?65:y>3?45:25; };
  const scores=[]; const weights=[];
  if (payout!=null&&isFinite(payout)&&payout>=0) { scores.push(ps(payout)); weights.push(0.35); }
  if (g5y!=null&&isFinite(g5y))   { scores.push(gs(g5y));  weights.push(0.35); }
  if (pfcf!=null&&isFinite(pfcf)&&pfcf>0) { scores.push(fs(pfcf)); weights.push(0.30); }
  const tw = weights.reduce((a,b)=>a+b,0);
  let r = scores.reduce((s,v,i)=>s+v*weights[i],0)/tw;
  if (yield_ > 10) r = Math.max(0, r - 20);
  return Math.round(r);
}

function scoreMomentum(m, stockCandles, indexCandles) {
  const sma = (c, n) => { if (c.length<n) return null; const s=c.slice(-n); return s.reduce((a,x)=>a+x.c,0)/n; };
  const ret = (c, d) => { if (c.length<d+1) return null; const r=c[c.length-1].c, p=c[c.length-1-d]?.c; return p&&p>0?((r-p)/p)*100:null; };
  const b6m = ret(indexCandles, 126) ?? 4;
  const b12m = ret(indexCandles, 252) ?? 8;
  const r6  = m["26WeekPriceReturnDaily"], r12 = m["52WeekPriceReturnDaily"];
  const sma50=sma(stockCandles,50), sma200=sma(stockCandles,200);
  const price = stockCandles.length ? stockCandles[stockCandles.length-1].c : null;
  let dma = null;
  if (sma50&&sma200&&price) { dma = price>sma50&&sma50>sma200?90:price>sma50?60:price>sma200?45:20; }
  const exScore = e => e>15?95:e>8?82:e>3?68:e>0?55:e>-5?42:e>-10?28:15;
  const scores=[]; const weights=[];
  if (r6!=null&&isFinite(r6))   { scores.push(exScore(r6-b6m));  weights.push(0.35); }
  if (r12!=null&&isFinite(r12)) { scores.push(exScore(r12-b12m)); weights.push(0.35); }
  if (dma!==null)               { scores.push(dma);              weights.push(0.30); }
  if (!scores.length) return null;
  const tw = weights.reduce((a,b)=>a+b,0);
  return Math.round(scores.reduce((s,v,i)=>s+v*weights[i],0)/tw);
}

function scoreTaxEfficiency(exchange, sectorLabel, dividendYield) {
  const isCA = exchange==="TSX"||exchange==="TSXV";
  const isREIT = /reit/i.test(sectorLabel);
  const paysDividend = dividendYield!=null&&dividendYield>0.5;
  if (isCA&&isREIT) return 50;
  if (isCA&&paysDividend) return 80;
  if (isCA&&!paysDividend) return 55;
  if (!isCA&&paysDividend) return 50;
  return 50;
}

function overall(scores) {
  const W = { value:0.20, growth:0.20, quality:0.20, dividendSafety:0.15, momentum:0.10, taxEfficiency:0.15 };
  let wSum=0, wUsed=0;
  for (const [k,w] of Object.entries(W)) { if (scores[k]!=null) { wSum+=scores[k]*w; wUsed+=w; } }
  return wUsed>0 ? Math.round(wSum/wUsed) : null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("AlphaBeat Score Refresh — " + new Date().toISOString());
  console.log("Dataset:", dataset);

  const stockFiles = await sanity.fetch(`*[_type == "stockFile"] { _id, ticker, exchange, finnhubSymbol, sectorLabel, editorScoreOverrides }`);
  console.log(`Found ${stockFiles.length} stockFile documents\n`);

  // Fetch TSX index candles once
  console.log("Fetching ^GSPTSE candles…");
  await sleep(1200);
  const indexCandles = await fetchCandles("^GSPTSE");
  console.log(`  GSPTSE candles: ${indexCandles.length} daily bars`);

  let ok=0, failed=0;

  for (const sf of stockFiles) {
    const sym = sf.finnhubSymbol || sf.ticker?.replace(/\.(TO|V)$/i,"") || sf.ticker;
    process.stdout.write(`  ${sf.ticker.padEnd(12)} (${sym}) … `);

    await sleep(1200);
    const metrics = await fetchMetrics(sym);
    await sleep(1200);
    const candles = await fetchCandles(sym);

    if (!metrics) {
      console.log("no Finnhub data");
      failed++;
      continue;
    }

    const dividendYield = metrics.dividendYieldIndicatedAnnual ?? metrics.currentDividendYieldTTM;
    const rawScores = {
      value:          scoreValue(metrics, sf.sectorLabel),
      growth:         scoreGrowth(metrics),
      quality:        scoreQuality(metrics, sf.sectorLabel),
      dividendSafety: scoreDividendSafety(metrics),
      momentum:       scoreMomentum(metrics, candles, indexCandles),
      taxEfficiency:  scoreTaxEfficiency(sf.exchange, sf.sectorLabel, dividendYield),
    };

    // Editor overrides supersede computed values
    const ov = sf.editorScoreOverrides || {};
    const scores = {
      value:          ov.value          ?? rawScores.value,
      growth:         ov.growth         ?? rawScores.growth,
      quality:        ov.quality        ?? rawScores.quality,
      dividendSafety: ov.dividendSafety ?? rawScores.dividendSafety,
      momentum:       ov.momentum       ?? rawScores.momentum,
      taxEfficiency:  ov.taxEfficiency  ?? rawScores.taxEfficiency,
    };
    scores.overall = overall(scores);

    const insufficient = {
      value:          scores.value          == null,
      growth:         scores.growth         == null,
      quality:        scores.quality        == null,
      dividendSafety: scores.dividendSafety == null,
      momentum:       scores.momentum       == null,
    };

    const dateStr = new Date().toISOString().slice(0,10);
    const docId   = `scoreSnapshot-${sf.ticker.toLowerCase().replace(/[^a-z0-9]/g,"-")}-${dateStr}`;

    await sanity.createOrReplace({
      _id:   docId,
      _type: "scoreSnapshot",
      ticker: sf.ticker,
      finnhubSymbol: sym,
      computedAt: new Date().toISOString(),
      scores,
      insufficient,
    });

    const display = Object.entries(scores).map(([k,v])=>`${k[0].toUpperCase()}:${v??"N/A"}`).join(" ");
    console.log(`✅  ${display}`);
    ok++;
  }

  console.log(`\nDone. ✅ ${ok}  ❌ ${failed}`);
}

main().catch(err => { console.error(err); process.exit(1); });
