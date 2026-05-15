# AlphaBeat

> The investing platform for stocks worth watching. Editor-led coverage of US &amp; Canadian markets with a flagship Weekly Top 10, sector hubs, ETF deep-dives, evergreen top-by-sector lists, market pulse, and a fast stock screener.

This repository is a production-ready, SEO-optimized, sponsorship-friendly investing site built on **Next.js 16** (App Router), **Sanity CMS**, **Tailwind CSS v4**, **Recharts**, and **Finnhub**. **Treat this file as the canonical inventory** of routes, env vars, CMS types, APIs, and ops workflows — when code changes, update this document in the same PR.

---

## What this is

- **Curated stock coverage** — each ticker: editor headline, full take, bull case, bear case, catalysts, live price (or sample data if Finnhub is unset).
- **Sectors &amp; themes** — every stock links to a **sector hub** with hero treatment.
- **ETF library** — categorized (US broad, US tech, dividends, Canada, thematic, bonds…) with editor takes.
- **Weekly Top 10** — flagship, time-bound product: thesis, conviction, time horizon per pick.
- **Top by sector (evergreen)** — permanent **`topList`** pages under `/top` — *not* the same as the weekly list (tactical vs reference).
- **Hidden gems** — curated subset of stocks surfaced on `/hidden-gems` and the home page.
- **Market pulse** — `/pulse`: regime-style signals, heat, movers, Finnhub news, plus the latest Sanity **`marketNote`**; home also embeds a pulse widget.
- **Insights** — long-form editorial (`insight` documents, Portable Text).
- **Stock screener** — client-side filter/sort across the published stock universe.
- **Watchlist** — `localStorage` only, no accounts; live quotes via `/api/quote`.
- **Cmd-K search** — stocks, sectors, ETFs, insights, plus Finnhub ticker lookup.
- **Newsletter** — Beehiiv-backed **`/subscribe`**, **`/api/subscribe`**, and **`/newsletter`** archive when API keys are set; provider lives under `lib/newsletter/`.
- **Sponsorship** — `Sponsored` ribbon, disclosures, sponsor CTAs from CMS.

There is **no logged-in product** beyond email capture (watchlist stays in the browser).

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router (TypeScript strict) |
| UI | Tailwind CSS v4 + custom dark-first palette |
| Content | Sanity (GROQ, ISR, on-demand revalidation) |
| Market data | Finnhub (free tier, ~60 calls/min) + server-side caching in `lib/market/finnhub.ts` |
| Pulse aggregates | `lib/market/pulse.ts` (computed views on top of Finnhub + CMS) |
| Charts | Recharts (area chart + range switcher) |
| Search palette | `cmdk` |
| Email list | Beehiiv (via `lib/newsletter/beehiiv.ts` + `lib/newsletter/provider.ts`) |
| Deployment | Vercel-ready (ISR + on-demand revalidate) |
| Sitemap | `next-sitemap` (`postbuild` in `package.json`) |
| Analytics | Google Analytics 4 (optional) |
| Monetization | Google AdSense + sponsored placements (optional) |

---

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local — see [Environment variables](#environment-variables)
npm run dev
```

- App: **http://localhost:3000**  
- CMS: **http://localhost:3000/studio** (Sanity Studio; sign in with your Sanity account)

---

## Information architecture

**Primary header** (`components/layout/Header.tsx`): Pulse · Weekly Top 10 · Hidden Gems · ETFs · Insights · Newsletter — plus search, watchlist, subscribe (large screens).

**Footer** (`components/layout/Footer.tsx`): Top picks (weekly, gems, top by sector), Discover (pulse, ETFs, stocks index, sectors, screener, watchlist), Read (newsletter archive, subscribe, insights, about, sponsor), Legal (disclaimer, privacy, sponsorship policy anchor).

**Implication:** `/stocks`, `/sectors`, `/screener`, `/top`, and `/weekly-picks` detail URLs are **secondary** in the top nav but reachable from home and footer — adjust nav if product priority changes.

---

## Routes reference (every user-facing page)

| Path | Purpose |
|---|---|
| `/` | Home: hero, featured stock, weekly teaser, hidden gems, insights, sectors/ETFs/top-list teasers, pulse widget, recent Beehiiv posts (when configured). |
| `/pulse` | Market pulse dashboard + latest `marketNote` + Finnhub news and computed signals. |
| `/weekly-picks` | Archive of Weekly Top 10 editions (`weeklyPick`). |
| `/weekly-picks/[slug]` | Single week: ranked picks with editor fields per stock. |
| `/top` | Index of evergreen **top by sector** lists (`topList`). |
| `/top/[slug]` | One evergreen list document. |
| `/hidden-gems` | Hidden gems collection / landing. |
| `/stocks` | Browse all published stocks. |
| `/stocks/[slug]` | Stock detail: editorial, quote, chart, related links, sponsored treatment. |
| `/sectors` | Sector taxonomy landing. |
| `/sectors/[slug]` | Sector hub. |
| `/etfs` | ETF library browse. |
| `/etfs/[slug]` | ETF deep-dive. |
| `/screener` | Client-side stock screener. |
| `/watchlist` | Watchlist UI + quotes for starred tickers. |
| `/insights` | Insights index. |
| `/insights/[slug]` | Single insight article. |
| `/newsletter` | Newsletter archive (Beehiiv posts when keys set). |
| `/subscribe` | Dedicated subscribe landing + form → `POST /api/subscribe`. |
| `/sponsor` | Sponsorship funnel + `#policy` anchor. |
| `/about` | About the publication. |
| `/disclaimer` | Disclaimer. |
| `/privacy-policy` | Privacy policy. |
| `/studio/[[...tool]]` | Sanity Studio (editors). |

**App Router UX:** `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx` apply where configured.

---

## Global shell (wraps every page)

| Piece | Location | Role |
|---|---|---|
| Root layout metadata, GA4, AdSense | `app/layout.tsx` | SEO defaults; scripts load only when env vars are set. |
| JSON-LD Organization | `app/layout.tsx` | Structured data. |
| Market ticker marquee | `components/market/MarketTicker.tsx` | Symbols from `siteSettings` + quotes. |
| Header / Footer | `components/layout/` | Nav, links, footer newsletter form. |
| Command palette (⌘K) | `components/layout/CommandPalette.tsx` | Local + remote search. |
| Sticky subscribe bar | `components/newsletter/StickySubscribeBar.tsx` | Persistent CTA. |

---

## API routes

| Method &amp; path | Role |
|---|---|
| `GET /api/quote?symbols=AAPL,MSFT` | Cached quote proxy for client components (~60s cache in handler). |
| `GET /api/candles?symbol=AAPL&range=1M` | Cached OHLC for charts (~1h cache in handler). |
| `GET /api/search?q=…` | Local index + Finnhub symbol search. |
| `POST /api/revalidate` | Sanity webhook: validates `x-revalidation-secret`, then `revalidatePath` for affected routes (see below). |
| `POST /api/subscribe` | Newsletter signup: JSON body `{ email, source?, utm_*?, website? }` — `website` is a honeypot; uses `lib/newsletter/provider.ts` (Beehiiv). |

---

## Environment variables

Copy **`.env.local.example`** → **`.env.local`** and fill in values. Never commit `.env.local`.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes (real site) | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Default `production` |
| `SANITY_API_TOKEN` | dev / seed / preview | Server-side Sanity token (see `lib/sanity/client.ts`, `scripts/seed.mjs`) |
| `NEXT_PUBLIC_SITE_URL` | yes for prod | Canonical site URL (OG, sitemap, `lib/utils.ts` `siteUrl()`) |
| `FINNHUB_API_KEY` | recommended | https://finnhub.io — without it, quotes/charts use deterministic **sample** data labelled “Sample” |
| `REVALIDATION_SECRET` | optional | Shared secret for `POST /api/revalidate` header `x-revalidation-secret` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | optional | Google Analytics 4, e.g. `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | optional | AdSense client ID, e.g. `ca-pub-XXXXXXXXXXXXXXXX` |
| `BEEHIIV_API_KEY` | optional | Beehiiv API key — required together with publication ID for subscribe + archive |
| `BEEHIIV_PUBLICATION_ID` | optional | Beehiiv publication ID |
| `BEEHIIV_REACTIVATE` | optional | Default on unless set to `false` — reactivate unsubscribed emails (`lib/newsletter/beehiiv.ts`) |
| `BEEHIIV_SEND_WELCOME` | optional | Default on unless set to `false` — control welcome automation |

---

## How market data works

The Finnhub wrapper (`lib/market/finnhub.ts`) implements:

- `getQuote(symbol)` — cached ~60s  
- `getQuotes(symbols)` — parallel batch  
- `getCandles(symbol, range)` — cached ~1h  
- `getCompanyProfile(symbol)` — cached ~24h  
- `searchSymbol(query)` — cached ~1h  
- Market news and other helpers used by `/pulse`

**Server components** call Finnhub directly. **Client components** use the pass-through routes listed above.

**No `FINNHUB_API_KEY`:** the app still runs; quotes and charts use deterministic sample data with a **Sample** badge.

### Symbol formatting

- US: bare ticker, e.g. `NVDA`  
- TSX: `.TO`, e.g. `SHOP.TO`  
- TSXV: `.V`  
- Indices: `^GSPC`, `^IXIC`, `^DJI`, `^GSPTSE`, `^VIX`  
- Editor shorthand `tsx:shop` / `tse:ry` → `lib/market/symbols.ts`

---

## Newsletter (Beehiiv)

- **Subscribe UI:** `components/newsletter/NewsletterForm.tsx`, pages `/subscribe`, sticky bar, footer, CTAs.  
- **Server subscribe:** `POST /api/subscribe` → `getNewsletterProvider()` → **`lib/newsletter/beehiiv.ts`**.  
- **Archive / “recent posts” on home:** `lib/newsletter/beehiiv-posts.ts` (requires both Beehiiv env vars).

Without Beehiiv keys, subscribe may return a **not-configured** style outcome and archive lists may be empty — verify UX for your launch.

---

## Content model (Sanity)

Open **`/studio`** after `npm run dev` to sign in.

| Document type | Use it for |
|---|---|
| `siteSettings` | Site name, tagline, marquee tickers, footer copy |
| `stock` | Curated ticker: headline, bull/bear, catalysts, sector ref, related picks, `sponsored` + `sponsorship` ref |
| `sector` | Taxonomy + hub: name, accent, icon |
| `etfEntry` | ETF pages: MER, AUM, yield, holdings, categories |
| `weeklyPick` | **Weekly Top 10** — time-bound list referencing stocks + per-row thesis / conviction / horizon |
| `topList` | **Evergreen** “top by sector” lists for `/top` and `/top/[slug]` |
| `insight` | Editorial articles (Portable Text, categories, featured flag) |
| `marketNote` | Editor note powering **`/pulse`** and surfaced on home; webhook revalidates `/pulse` and `/` |
| `sponsorship` | Sponsor logo, CTA, disclosure, dates — linked from `stock` when sponsored |
| `author` | Bylines |

**Legacy:** `post` and `category` remain registered so older Studio documents still resolve. Remove from `sanity/schemaTypes/index.ts` after migration.

---

## Sanity webhook (on-demand revalidation)

Configure in Sanity → **API** → **Webhooks**:

- **URL:** `https://yourdomain.com/api/revalidate`  
- **Trigger on:** Create, Update, Delete  
- **HTTP Headers:** `x-revalidation-secret: <REVALIDATION_SECRET>` (must match env)  
- **Filter (GROQ):** keep in sync with **`app/api/revalidate/route.ts`**. As of this writing:

```groq
_type in ["stock","etfEntry","sector","weeklyPick","topList","insight","marketNote","sponsorship","siteSettings"]
```

**Behavior summary:** the handler always revalidates the **root layout** (marquee / settings). Then by `_type` it revalidates **`/stocks`**, **`/sectors`**, **`/screener`**, **`/hidden-gems`**, **`/top`**, detail slugs, **`/weekly-picks`**, **`/etfs`**, **`/insights`**, **`/pulse`**, **`/`**, etc. If you add a new content-driven route, extend the switch in `route.ts` **and** update the filter line above.

---

## Project structure (high level)

```
app/
├── page.tsx                 Home
├── pulse/page.tsx           Market pulse
├── weekly-picks/            Archive + [slug] week detail
├── top/                     Evergreen lists + [slug]
├── hidden-gems/page.tsx
├── stocks/                  Browse + [slug] detail
├── sectors/                 Index + [slug] hub
├── etfs/                    Browse + [slug] detail
├── screener/page.tsx
├── watchlist/page.tsx
├── insights/                Index + [slug]
├── newsletter/page.tsx      Beehiiv archive
├── subscribe/page.tsx     Subscribe landing
├── sponsor/page.tsx
├── about, disclaimer, privacy-policy
├── loading.tsx, error.tsx, not-found.tsx
├── api/
│   ├── quote/route.ts
│   ├── candles/route.ts
│   ├── search/route.ts
│   ├── revalidate/route.ts
│   └── subscribe/route.ts
└── studio/[[...tool]]/      Sanity Studio

components/
├── layout/                  Header, Footer, Logo, CommandPalette
├── market/                  MarketTicker, PriceCell, Sparkline, StockChart
├── pulse/                   MarketPulseWidget (home), pulse-only UI
├── stocks/                  StockCard, grids, screener, SponsoredRibbon, HiddenGemCard
├── etfs/                    EtfCard, EtfGrid
├── sectors/                 SectorIcon, SectorBadge, SectorTile
├── insights/                InsightCard
├── newsletter/              NewsletterForm, NewsletterCTA, StickySubscribeBar
├── watchlist/               WatchlistButton, WatchlistView
├── portable/                PortableProse
├── ui/                      SectionHeading, Disclaimer, Breadcrumb, Pagination
└── ads/                     AdBanner, AdInArticle

lib/
├── sanity/                  client, image URL, GROQ queries
├── market/                  finnhub.ts, symbols.ts, pulse.ts
├── newsletter/              provider.ts, beehiiv.ts, beehiiv-posts.ts, exclusive helpers
├── types.ts
├── utils.ts
└── watchlist.ts

sanity/schemaTypes/          marketNote, weeklyPick, topList, stock, etfEntry, sector,
                             insight, sponsorship, author, siteSettings, post, category

scripts/
├── seed.mjs                 npm run seed | seed:reset
└── newsletter/              Optional local issue drafts (e.g. issue-001.md), not wired to prod send
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run seed` | Seed Sanity (`scripts/seed.mjs`, requires env) |
| `npm run seed:reset` | Reset + seed |

---

## Deployment checklist

- [ ] Set all required env vars on the host (see table above)  
- [ ] Finnhub: `FINNHUB_API_KEY` for real market data  
- [ ] Sanity project + `SANITY_API_TOKEN` for server/seed  
- [ ] Beehiiv: `BEEHIIV_*` if using subscribe + archive  
- [ ] Webhook → `/api/revalidate` with **full `_type` filter** and secret header  
- [ ] `public/ads.txt` after AdSense approval  
- [ ] Submit `sitemap.xml` (from `next-sitemap`) to Search Console  
- [ ] Replace placeholder `mailto:` targets (partners, privacy) sitewide if still generic  
- [ ] Fill `siteSettings` in Sanity  
- [ ] Publish initial stocks (3–4+ across sectors), at least one `weeklyPick`, and any `topList` / `marketNote` you want live day one  
- [ ] AdSense / alternative ad network policy compliance  

---

## Sponsorship workflow

1. Create a `sponsorship` document — name, logo, ticker, CTA URL, disclosure, dates.  
2. On the `stock`, set `sponsored = true` and reference the sponsorship.  
3. Publish — stock cards show **Sponsored**, detail page shows disclosure; search palette behavior follows implementation.  
4. Editorial copy (bull/bear, thesis) stays independent — do not let sponsorship override editor fields.

---

## License

All rights reserved.
