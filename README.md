# AlphaBeat

> The investing platform for stocks worth watching. Editor-led coverage of US &amp; Canadian markets with a flagship Weekly Top 10, sector hubs, ETF deep-dives, and a fast stock screener.

A production-ready, SEO-optimized, sponsorship-friendly investing platform built on Next.js 16, Sanity CMS, Tailwind CSS v4, Recharts, and Finnhub.

## What this is

- **Curated stock coverage** — every ticker has an editor's one-liner, full take, bull case, bear case, catalysts, and live price.
- **Sectors & themes** — every stock lives inside a sector hub with hero treatment.
- **ETF library** — categorized (US broad, US tech, dividends, Canada, thematic, bonds…) with editor's takes.
- **Weekly Top 10** — flagship product. Each pick comes with thesis, conviction, and time horizon.
- **Live stock screener** — client-side filter/sort across our entire universe.
- **localStorage watchlist** — no signup, just tap the star.
- **Cmd-K search** — global search across stocks, sectors, ETFs, insights, plus live ticker lookup via Finnhub.
- **Sponsorship-ready** — `Sponsored` ribbon, regulatory disclosure, sponsor logos / CTAs, all driven from CMS.

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router (TypeScript strict) |
| UI | Tailwind CSS v4 + custom dark-first palette |
| Content | Sanity v3 (GROQ, on-demand revalidation) |
| Market data | Finnhub free tier (60 calls/min) with server-side caching |
| Charts | Recharts (area chart with range switcher) |
| Search palette | `cmdk` |
| Deployment | Vercel-ready (ISR + on-demand revalidate) |
| Analytics | Google Analytics 4 |
| Monetization | Google AdSense + sponsored placements |

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Fill in your Sanity project ID and Finnhub key (see below)
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Default `production` |
| `SANITY_API_TOKEN` | dev / preview | Server-side Sanity token |
| `FINNHUB_API_KEY` | recommended | Get a free key at https://finnhub.io — without it the site renders deterministic *sample* quotes (clearly labelled). |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | optional | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | optional | `ca-pub-XXXXXXXXXXXXXXXX` |
| `REVALIDATION_SECRET` | optional | Used by the Sanity webhook → `/api/revalidate` |
| `NEXT_PUBLIC_SITE_URL` | yes for prod | Your live domain (e.g. `https://alphabeat.io`) |

## How market data works

The Finnhub wrapper (`lib/market/finnhub.ts`) wraps:
- `getQuote(symbol)` — cached 60 s
- `getQuotes(symbols)` — parallel batch
- `getCandles(symbol, range)` — cached 1 h
- `getCompanyProfile(symbol)` — cached 24 h
- `searchSymbol(query)` — cached 1 h

Server pages call these directly (server components). Client components hit our pass-through routes:
- `GET /api/quote?symbols=AAPL,MSFT,…`
- `GET /api/candles?symbol=AAPL&range=1M`
- `GET /api/search?q=apple`

Free-tier rate limit (60/min) is comfortably respected by these cache windows. **No `FINNHUB_API_KEY`?** The site still works — every quote / chart falls back to deterministic sample data labelled with a `Sample` badge so users (and you) know it's not real.

### Symbol formatting

- US stocks: bare ticker, e.g. `NVDA`
- TSX: `.TO` suffix, e.g. `SHOP.TO`, `RY.TO`
- TSXV: `.V` suffix
- Indices: `^GSPC`, `^IXIC`, `^DJI`, `^GSPTSE`, `^VIX`
- Editor short-hand `tsx:shop` / `tse:ry` → normalized in `lib/market/symbols.ts`

## Content model (Sanity)

Open `/studio` once the dev server is running to log in.

| Document | Use it for |
|---|---|
| `weeklyPick` | The Weekly Top 10. Each row references a `stock` + thesis + conviction + horizon |
| `stock` | Curated ticker entry — editor's headline, bull case, bear case, catalysts, related stocks/ETFs, sector ref, sponsorship link |
| `etfEntry` | ETF deep-dive — listings, MER, AUM, distribution yield, top holdings |
| `sector` | Sector taxonomy — Tech, AI, Energy, Healthcare, etc. with accent color &amp; icon |
| `insight` | Editorial articles (analysis, news, earnings, macro, explainer, opinion) |
| `sponsorship` | Sponsor metadata — logo, ticker, CTA, disclosure. Linked from `stock.sponsorship` |
| `author` | Bylines |
| `siteSettings` | Site name, tagline, ticker symbols for the top marquee, footer text |

Legacy types `post` and `category` remain registered so any existing Sanity documents from MapleWealth still resolve in Studio. Safe to delete after you've migrated.

## Sanity webhook (on-demand revalidation)

In Sanity Studio → API → Webhooks:
- **URL:** `https://yourdomain.com/api/revalidate`
- **Trigger on:** Create, Update, Delete
- **Filter:** `_type in ["stock","etfEntry","sector","weeklyPick","insight","sponsorship","siteSettings"]`
- **HTTP Headers:** `x-revalidation-secret: <REVALIDATION_SECRET>`

When you publish in Sanity, the affected pages refresh in seconds — no redeploy.

## Project structure

```
app/
├── page.tsx              Home (market pulse, top 10, sectors, ETFs, insights)
├── stocks/               /stocks browse + /stocks/[slug] detail
├── sectors/              /sectors landing + /sectors/[slug] hub
├── etfs/                 /etfs browse + /etfs/[slug] detail
├── weekly-picks/         Top 10 archive + week detail
├── screener/             Client-side stock screener
├── watchlist/            localStorage watchlist (live quotes)
├── insights/             Editorial articles
├── sponsor/              Sponsorship landing (revenue funnel)
├── about, disclaimer, privacy-policy
├── api/
│   ├── quote/            Live quotes proxy (60s server cache)
│   ├── candles/          Historical candles (1h server cache)
│   ├── search/           Local + remote symbol search
│   └── revalidate/       Sanity webhook receiver
└── studio/               Sanity Studio mounted at /studio

components/
├── layout/               Header, Footer, Logo, CommandPalette
├── market/               MarketTicker, PriceCell, Sparkline, StockChart
├── stocks/               StockCard, StockGrid, StockFilterBar, Screener, SponsoredRibbon
├── etfs/                 EtfCard, EtfGrid
├── sectors/              SectorIcon, SectorBadge, SectorTile
├── insights/             InsightCard
├── watchlist/            WatchlistButton, WatchlistView
├── portable/             PortableProse (dark theme rich-text)
├── ui/                   SectionHeading, Disclaimer, Breadcrumb, Pagination
└── ads/                  AdBanner, AdInArticle (only render when AdSense ID set)

lib/
├── sanity/               client, image url builder, GROQ queries
├── market/               finnhub.ts, symbols.ts (normalization)
├── types.ts              Strict TS types for all CMS + market shapes
├── utils.ts              Formatters: price, percent, market cap, ticker, currency
└── watchlist.ts          localStorage-backed reactive store

sanity/
└── schemaTypes/          stock, sector, weeklyPick, sponsorship, etfEntry, insight, author, siteSettings
```

## Deployment checklist

- [ ] Set all env variables in Vercel
- [ ] Sign up for Finnhub, paste API key into `FINNHUB_API_KEY`
- [ ] Create Sanity project, paste IDs in env
- [ ] Add Sanity webhook → `/api/revalidate`
- [ ] Update `public/ads.txt` once approved for AdSense
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Update `mailto:partners@alphabeat.io` and `mailto:privacy@alphabeat.io` to your real addresses
- [ ] Fill in `siteSettings` in Sanity (name, tagline, ticker symbols for the marquee)
- [ ] Publish at least 3-4 stocks across 2-3 sectors before going live (the home page is data-driven)
- [ ] Publish your first `weeklyPick`
- [ ] Apply for AdSense (need real content + traffic; come back at 10K/mo for Ezoic, 50K/mo for Mediavine)

## Sponsorship workflow

1. Create a `sponsorship` document — sponsor name, logo, ticker, CTA URL, disclosure, dates
2. On the relevant `stock`, toggle `sponsored = true` and reference the sponsorship
3. Publish — the stock card immediately gets the `Sponsored` ribbon, the detail page gets a disclosure ribbon, and the search palette de-prioritizes it
4. Editorial (one-line take, bull/bear, risks) remains untouched. Always.

## License

All rights reserved.
