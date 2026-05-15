/**
 * scripts/seed-phase4-stocks.mjs
 *
 * Creates stockFile documents for the full Phase 4 ticker list.
 * Skips tickers that already exist in Sanity (checks by ticker field).
 * All editorial fields are marked "DRAFT — pending Tom review".
 * After creation, runs score computation on new stocks.
 *
 * Usage: node scripts/seed-phase4-stocks.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@sanity/client";

const env       = readFileSync(".env.local", "utf8");
const projectId = env.match(/NEXT_PUBLIC_SANITY_PROJECT_ID=(.+)/)?.[1]?.trim();
const dataset   = env.match(/NEXT_PUBLIC_SANITY_DATASET=(.+)/)?.[1]?.trim() || "production";
const token     = env.match(/SANITY_API_TOKEN=(.+)/)?.[1]?.trim();
const finnhubKey = env.match(/FINNHUB_API_KEY=(.+)/)?.[1]?.trim();

if (!projectId || !token) { console.error("Missing Sanity env vars"); process.exit(1); }

const sanity = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false });

// ---------------------------------------------------------------------------
// Phase 4 stock list — auto-derivable fields only
// ---------------------------------------------------------------------------
const STOCKS = [
  // Canadian Banks
  { ticker: "TD.TO",   exchange: "TSX",    finnhub: "TD",    name: "The Toronto-Dominion Bank",               sector: "Canadian Banks" },
  { ticker: "BMO.TO",  exchange: "TSX",    finnhub: "BMO",   name: "Bank of Montreal",                        sector: "Canadian Banks" },
  { ticker: "BNS.TO",  exchange: "TSX",    finnhub: "BNS",   name: "Bank of Nova Scotia",                     sector: "Canadian Banks" },
  { ticker: "CM.TO",   exchange: "TSX",    finnhub: "CM",    name: "Canadian Imperial Bank of Commerce",      sector: "Canadian Banks" },
  // Energy
  { ticker: "SU.TO",   exchange: "TSX",    finnhub: "SU",    name: "Suncor Energy Inc.",                      sector: "Canadian Energy" },
  { ticker: "TRP.TO",  exchange: "TSX",    finnhub: "TRP",   name: "TC Energy Corporation",                   sector: "Canadian Energy" },
  // Telecom / Utility
  { ticker: "BCE.TO",  exchange: "TSX",    finnhub: "BCE",   name: "BCE Inc.",                                sector: "Canadian Telecom" },
  { ticker: "T.TO",    exchange: "TSX",    finnhub: "TU",    name: "TELUS Corporation",                       sector: "Canadian Telecom" },
  { ticker: "FTS.TO",  exchange: "TSX",    finnhub: "FTS",   name: "Fortis Inc.",                             sector: "Canadian Utilities" },
  // REITs
  { ticker: "REI-UN.TO", exchange: "TSX", finnhub: "REI-UN", name: "RioCan Real Estate Investment Trust",    sector: "Canadian REITs" },
  { ticker: "CAR-UN.TO", exchange: "TSX", finnhub: "CAR-UN", name: "Canadian Apartment Properties REIT",    sector: "Canadian REITs" },
  // Technology
  { ticker: "SHOP.TO", exchange: "TSX",    finnhub: "SHOP",  name: "Shopify Inc.",                            sector: "Canadian Technology" },
  { ticker: "CSU.TO",  exchange: "TSX",    finnhub: "CSU",   name: "Constellation Software Inc.",             sector: "Canadian Technology" },
  { ticker: "OTEX.TO", exchange: "TSX",    finnhub: "OTEX",  name: "OpenText Corporation",                    sector: "Canadian Technology" },
  // Precious Metals (dual-listed, NYSE ticker used for Finnhub)
  { ticker: "ABX.TO",  exchange: "TSX",    finnhub: "ABX",   name: "Barrick Gold Corporation",                sector: "Precious Metals" },
  { ticker: "AEM.TO",  exchange: "TSX",    finnhub: "AEM",   name: "Agnico Eagle Mines Limited",              sector: "Precious Metals" },
  { ticker: "FNV.TO",  exchange: "TSX",    finnhub: "FNV",   name: "Franco-Nevada Corporation",               sector: "Precious Metals" },
  { ticker: "WPM.TO",  exchange: "TSX",    finnhub: "WPM",   name: "Wheaton Precious Metals Corp.",           sector: "Precious Metals" },
  { ticker: "K.TO",    exchange: "TSX",    finnhub: "KGC",   name: "Kinross Gold Corporation",                sector: "Precious Metals" },
  // US holdings Canadians own
  { ticker: "GOOGL",   exchange: "NASDAQ", finnhub: "GOOGL", name: "Alphabet Inc.",                           sector: "US Technology" },
  { ticker: "BRK.B",   exchange: "NYSE",   finnhub: "BRK.B", name: "Berkshire Hathaway Inc.",                 sector: "US Financials" },
  // Mid-cap
  { ticker: "ATD.TO",  exchange: "TSX",    finnhub: "ATD",   name: "Alimentation Couche-Tard Inc.",           sector: "Canadian Consumer" },
  { ticker: "WCN.TO",  exchange: "TSX",    finnhub: "WCN",   name: "Waste Connections Inc.",                  sector: "Canadian Industrials" },
  { ticker: "MFC.TO",  exchange: "TSX",    finnhub: "MFC",   name: "Manulife Financial Corporation",          sector: "Canadian Financials" },
];

const DRAFT = "DRAFT — pending Tom review";

function slugify(ticker) {
  return ticker.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");
}

function makeStockFile(s) {
  const slug = slugify(s.ticker);
  return {
    _id:   `sf-${slug}`,
    _type: "stockFile",
    ticker:       s.ticker,
    exchange:     s.exchange,
    finnhubSymbol: s.finnhub,
    companyName:  s.name,
    sectorLabel:  s.sector,
    slug:         { _type: "slug", current: slug },
    lastReviewed: new Date().toISOString(),
    reviewType:   "quick",
    bullCase:     [DRAFT, DRAFT, DRAFT],
    bearCase:     [DRAFT, DRAFT, DRAFT],
    canadianInvestorParagraph: DRAFT,
    accountFit: {
      tfsa:          { recommendation: "acceptable", reasoning: DRAFT },
      rrsp:          { recommendation: "acceptable", reasoning: DRAFT },
      fhsa:          { recommendation: "acceptable", reasoning: DRAFT },
      nonRegistered: { recommendation: "acceptable", reasoning: DRAFT },
    },
  };
}

// ---------------------------------------------------------------------------
// Finnhub scoring (inlined from score.mjs)
// ---------------------------------------------------------------------------
const BASE = "https://finnhub.io/api/v1";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchMetrics(symbol) {
  if (!finnhubKey) return null;
  try {
    const res = await fetch(`${BASE}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${finnhubKey}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const d = await res.json();
    return d.metric || null;
  } catch { return null; }
}

async function fetchCandles(symbol, daysBack = 420) {
  if (!finnhubKey) return [];
  const now = Math.floor(Date.now() / 1000);
  const from = now - daysBack * 86400;
  try {
    const res = await fetch(`${BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${now}&token=${finnhubKey}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const d = await res.json();
    return d.s === "ok" && d.t?.length ? d.t.map((t, i) => ({ t, c: d.c[i] })) : [];
  } catch { return []; }
}

function piecewise(v, thr) { for (const [t, s] of thr) { if (v <= t) return s; } return thr[thr.length-1][1]; }

function scoreAll(m, sectorLabel, exchange, candles, indexCandles) {
  const SECTOR_PE = { "Canadian Banks":12,"Canadian Energy":14,"Canadian Telecom":16,"Utilities":17,"Canadian Utilities":17,"Canadian REITs":22,"REITs":22,"Precious Metals":28,"Technology":32,"US Technology":32,"Consumer Discretionary":20,"Canadian Consumer":20,"Healthcare":24,"Industrials":19,"Canadian Industrials":19,"Materials":16,"Financials":14,"Canadian Financials":14,"US Financials":14 };
  const medianPE = Object.entries(SECTOR_PE).find(([k]) => sectorLabel.toLowerCase().includes(k.toLowerCase()))?.[1] ?? 18;
  const isBank = /bank|financial/i.test(sectorLabel);

  const ro = v => v>25?95:v>18?82:v>12?68:v>6?50:v>0?32:12;
  const g  = v => { const c=Math.min(v,200); return c>20?95:c>15?85:c>10?72:c>5?58:c>0?45:c>-5?30:15; };
  const ps = r => r===0?50:r<=50?95:r<=65?78:r<=80?55:r<=90?35:15;
  const gs = p => p>10?95:p>7?82:p>5?70:p>3?57:p>0?44:22;
  const sma = (c,n) => c.length>=n ? c.slice(-n).reduce((a,x)=>a+x.c,0)/n : null;
  const ret = (c,d) => { if(c.length<d+1) return null; const r=c[c.length-1].c, p=c[c.length-1-d]?.c; return p&&p>0?((r-p)/p)*100:null; };
  const exScore = e => e>15?95:e>8?82:e>3?68:e>0?55:e>-5?42:e>-10?28:15;

  // Value
  let vScores=[], vWts=[];
  if (m.peNormalizedAnnual>0) { vScores.push(piecewise(m.peNormalizedAnnual/medianPE,[[0.6,95],[0.8,80],[1,65],[1.25,45],[1.5,30],[Infinity,15]])); vWts.push(0.35); }
  if (m.pbAnnual>0) { vScores.push(piecewise(m.pbAnnual,[[1,90],[2,75],[3,60],[5,40],[Infinity,20]])); vWts.push(0.25); }
  if (m.evEbitdaTTM>0) { vScores.push(piecewise(m.evEbitdaTTM,[[8,90],[12,75],[18,55],[25,35],[Infinity,15]])); vWts.push(0.25); }
  const pfcf=m.pfcfShareTTM??m.pfcfShareAnnual; if(pfcf>0){const y=(1/pfcf)*100; vScores.push(piecewise(-y,[[-10,90],[-7,75],[-5,60],[-3,40],[Infinity,20]])); vWts.push(0.15);}
  const vw=vWts.reduce((a,b)=>a+b,0); const value = vw>0 ? Math.round(vScores.reduce((s,v,i)=>s+v*vWts[i],0)/vw) : null;

  // Growth
  let gPairs=[[m.revenueGrowth3Y,0.40],[m.epsGrowth3Y,0.35],[m.revenueGrowthQuarterlyYoy,0.25]].filter(([v])=>v!=null&&isFinite(v));
  const gw=gPairs.reduce((s,[,w])=>s+w,0); const growth = gw>0 ? Math.round(gPairs.reduce((s,[v,w])=>s+g(v)*w,0)/gw) : null;

  // Quality
  let qScores=[], qWts=[];
  if(m.roeTTM!=null&&isFinite(m.roeTTM)){qScores.push(ro(m.roeTTM));qWts.push(0.30);}
  if(m.roiTTM!=null&&isFinite(m.roiTTM)){qScores.push(ro(m.roiTTM));qWts.push(0.30);}
  const de=m["totalDebt/totalEquityAnnual"]??m["totalDebt/totalEquityQuarterly"];
  if(de!=null&&isFinite(de)&&de>=0){const s=isBank?(de<5?70:de<10?55:de<15?40:30):(de<0.3?95:de<0.5?82:de<1?65:de<2?45:25);qScores.push(s);qWts.push(0.20);}
  const mg=m.netProfitMarginTTM??m.grossMarginTTM;
  if(mg!=null&&isFinite(mg)){const s=mg>25?95:mg>15?80:mg>8?65:mg>3?48:mg>0?32:12;qScores.push(s);qWts.push(0.20);}
  const qw=qWts.reduce((a,b)=>a+b,0); const quality = qw>0 ? Math.round(qScores.reduce((s,v,i)=>s+v*qWts[i],0)/qw) : null;

  // Dividend safety
  const yield_=m.dividendYieldIndicatedAnnual??m.currentDividendYieldTTM??0;
  let divSafety;
  if(!yield_||yield_<=0){divSafety=50;}
  else{
    let dPairs=[[m.payoutRatioAnnual??m.payoutRatioTTM,0.35],[m.dividendGrowthRate5Y,0.35],[pfcf>0?pfcf:null,0.30]].filter(([v])=>v!=null&&isFinite(v)&&v>0);
    if(!dPairs.length){divSafety=null;}
    else{
      const dw=dPairs.reduce((s,[,w])=>s+w,0);
      let r=dPairs.reduce((s,[v,w],i)=>{
        if(i===0) return s+ps(v)*w;
        if(i===1) return s+gs(v)*w;
        const y=(1/v)*100; return s+(y>10?95:y>7?80:y>5?65:y>3?45:25)*w;
      },0)/dw;
      if(yield_>10) r=Math.max(0,r-20);
      divSafety=Math.round(r);
    }
  }

  // Momentum
  const b6m=ret(indexCandles,126)??4, b12m=ret(indexCandles,252)??8;
  const r6=m["26WeekPriceReturnDaily"],r12=m["52WeekPriceReturnDaily"];
  const sma50=sma(candles,50),sma200=sma(candles,200);
  const price=candles.length?candles[candles.length-1].c:null;
  let dma=null; if(sma50&&sma200&&price){dma=price>sma50&&sma50>sma200?90:price>sma50?60:price>sma200?45:20;}
  let mScores=[],mWts=[];
  if(r6!=null&&isFinite(r6)){mScores.push(exScore(r6-b6m));mWts.push(0.35);}
  if(r12!=null&&isFinite(r12)){mScores.push(exScore(r12-b12m));mWts.push(0.35);}
  if(dma!==null){mScores.push(dma);mWts.push(0.30);}
  const mw=mWts.reduce((a,b)=>a+b,0); const momentum = mw>0?Math.round(mScores.reduce((s,v,i)=>s+v*mWts[i],0)/mw):null;

  // Tax efficiency (rule-based)
  const isCA=exchange==="TSX"||exchange==="TSXV";
  const isREIT=/reit/i.test(sectorLabel);
  const paysDividend=yield_>0.5;
  const taxEfficiency=isCA&&isREIT?50:isCA&&paysDividend?80:isCA?55:paysDividend?50:50;

  // Overall
  const W={value:0.20,growth:0.20,quality:0.20,dividendSafety:0.15,momentum:0.10,taxEfficiency:0.15};
  const raw={value,growth,quality,dividendSafety:divSafety,momentum,taxEfficiency};
  let wSum=0,wUsed=0; for(const[k,w] of Object.entries(W)){if(raw[k]!=null){wSum+=raw[k]*w;wUsed+=w;}}
  raw.overall=wUsed>0?Math.round(wSum/wUsed):null;
  return raw;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Phase 4 Stock File Seeding — " + new Date().toISOString());

  // Fetch existing tickers
  const existing = await sanity.fetch(`*[_type == "stockFile"][].ticker`);
  const existingSet = new Set(existing.map(t => t.toUpperCase()));
  console.log(`Existing stockFiles: ${existing.length} (${[...existingSet].join(", ")})\n`);

  const toCreate = STOCKS.filter(s => !existingSet.has(s.ticker.toUpperCase()));
  const skipped  = STOCKS.length - toCreate.length;
  console.log(`Creating: ${toCreate.length}  Skipping (already exist): ${skipped}\n`);

  // Fetch index candles once
  const indexCandles = finnhubKey ? await fetchCandles("^GSPTSE") : [];
  console.log(`GSPTSE candles: ${indexCandles.length} bars`);
  if (finnhubKey) await sleep(1200);

  for (const s of toCreate) {
    process.stdout.write(`  Creating ${s.ticker.padEnd(12)} `);
    const doc = makeStockFile(s);
    await sanity.createOrReplace(doc);

    // Compute and persist score
    if (finnhubKey) {
      await sleep(1200);
      const metrics = await fetchMetrics(s.finnhub);
      await sleep(1200);
      const candles = await fetchCandles(s.finnhub);

      if (metrics) {
        const scores = scoreAll(metrics, s.sector, s.exchange, candles, indexCandles);
        const dateStr = new Date().toISOString().slice(0,10);
        const snapId  = `scoreSnapshot-${s.ticker.toLowerCase().replace(/[^a-z0-9]/g,"-")}-${dateStr}`;
        await sanity.createOrReplace({
          _id: snapId, _type: "scoreSnapshot",
          ticker: s.ticker, finnhubSymbol: s.finnhub,
          computedAt: new Date().toISOString(),
          scores,
          insufficient: {
            value:s.scores?.value==null, growth:scores.growth==null, quality:scores.quality==null,
            dividendSafety:scores.dividendSafety==null, momentum:scores.momentum==null,
          },
        });
        const display = Object.entries(scores).map(([k,v])=>`${k[0].toUpperCase()}:${v??"N/A"}`).join(" ");
        console.log(`✅  ${display}`);
      } else {
        console.log("✅  (no Finnhub data — scored later)");
      }
    } else {
      console.log("✅  (no API key — score manually with npm run score)");
    }
  }

  console.log(`\nDone. Created ${toCreate.length} new stockFiles.`);
  if (skipped) console.log(`Skipped ${skipped} (already existed): check /studio if you expected them to be recreated.`);
}

main().catch(err => { console.error(err); process.exit(1); });
