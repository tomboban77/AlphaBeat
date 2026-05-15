# AlphaBeat

> AlphaBeat helps Canadian millennials and Gen Z invest with clarity — tax-aware, account-aware, TSX-fluent.

**Audience:** Canadian DIY investors aged 25–40. Tech-comfortable, mobile-first, uses Wealthsimple or Questrade, knows what a TFSA is but wants deeper understanding of asset location and tax-aware investing.

**Promise:** "AlphaBeat helps Canadian millennials and Gen Z invest with clarity — tax-aware, account-aware, TSX-fluent." Every page, headline, and Brief issue speaks to this person.

This file is the canonical reference document. Update it in the same PR as any code change that affects routes, schemas, APIs, or env vars.

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router (TypeScript strict) |
| UI | Tailwind CSS v4 + custom dark-first palette |
| Content | Sanity (GROQ, ISR, on-demand revalidation) |
| Market data | Finnhub (free tier, ~60 calls/min) |
| Charts | Recharts (area chart + range switcher) |
| Search palette | `cmdk` (⌘K) |
| Email list | Beehiiv (via `lib/newsletter/beehiiv.ts`) |
| Deployment | Vercel-ready (ISR + on-demand revalidate) |
| Sitemap | `next-sitemap` (`postbuild`) |
| Analytics | GA4 (optional, env var gated) |

---

## Information architecture

**Four sections, nothing else:**

| Section | Route | Description |
|---|---|---|
| The Brief | `/brief` | Sunday newsletter archive + individual issues |
| Stock Files | `/stocks` | Score-driven reference pages per ticker |
| Playbooks | `/playbooks` | Deep evergreen guides for Canadian investors |
| The Tracker | `/watchlist` | localStorage watchlist + weekly digest (Phase 5) |

**Supporting content (no nav slot):**

| Content type | Route | Description |
|---|---|---|
| Top Lists | `/best` | Quarterly-updated ranked lists by category |
| Methodology | `/methodology` | How the 6-factor score works |

**Nav (Header):** The Brief · Stock Files · Playbooks · Watchlist + search icon + Subscribe CTA

**Footer:** Read (Brief, Playbooks, Stock Files, Top Lists) · Tools (Watchlist, Methodology, Subscribe) · Legal (About, Disclaimer, Privacy)

---

## Routes reference

| Path | Status | Purpose |
|---|---|---|
| `/` | Live | Homepage: hero, sections, recent Stock Files, Top List teasers, Playbook teasers |
| `/brief` | Stub (Phase 2) | Brief archive — paginated list of issues |
| `/brief/[slug]` | Stub (Phase 2) | Single Brief issue |
| `/stocks` | Live | Stock Files index |
| `/stocks/[slug]` | Live (Phase 2 redesign) | Stock File detail |
| `/playbooks` | Stub (Phase 2) | Playbooks index |
| `/playbooks/[slug]` | Stub (Phase 2) | Single Playbook |
| `/best` | Stub (Phase 2) | Top Lists index |
| `/best/[slug]` | Stub (Phase 2) | Single Top List |
| `/methodology` | Live | How the 6-factor score works |
| `/watchlist` | Live (Phase 5 redesign) | Watchlist UI + quotes |
| `/subscribe` | Live | Subscribe landing + form |
| `/newsletter` | Live | Beehiiv archive (when configured) |
| `/about` | Live | About |
| `/disclaimer` | Live | Disclaimer |
| `/privacy-policy` | Live | Privacy policy |
| `/sponsor` | Live | Sponsorship (live UI, no active sponsor at launch) |
| `/studio/[[...tool]]` | Live | Sanity Studio |

**Deleted in Phase 1:** `/pulse`, `/weekly-picks`, `/hidden-gems`, `/etfs`, `/insights`, `/sectors`, `/screener`, `/top`

---

## Sanity content model

| Document type | Status | Use |
|---|---|---|
| `stockFile` | **Live** | Score-driven ticker reference pages |
| `brief` | **Live** | Weekly newsletter issues |
| `playbook` | **Live** | Deep evergreen guides |
| `rankedList` | **Live** | Quarterly Top 10 lists |
| `siteSettings` | Live | Site name, tagline, marquee tickers |
| `sponsorship` | Live (dormant) | Sponsor placements — schema ready, UI off at launch |
| `author` | Live | Bylines |
| `stock` | **DEPRECATED** — migrate to `stockFile` | Legacy stock documents |
| `weeklyPick` | **DEPRECATED** — migrate to `brief` | Legacy weekly pick issues |
| `insight` | **DEPRECATED** — migrate to `brief`/`playbook` | Legacy editorial articles |

**Webhook GROQ filter:**
```groq
_type in ["stockFile","brief","playbook","rankedList","siteSettings","sponsorship"]
```

---

## The 6-factor score

Each Stock File is scored 0–100 across six factors, weighted to an overall score. Scores are computed from Finnhub data, cached daily.

| Factor | Weight | Key inputs |
|---|---|---|
| Value | ~20% | P/E vs sector median, P/B, EV/EBITDA, FCF yield |
| Growth | ~20% | Revenue 3yr CAGR, EPS 3yr CAGR, forward estimate |
| Quality | ~20% | ROE, ROIC, debt/equity, gross margin stability |
| Dividend Safety | ~15% | Payout ratio, growth streak, FCF coverage, yield penalty >10% |
| Momentum | ~10% | 6m + 12m return vs ^GSPTSE, 50/200 DMA |
| Canadian Tax Efficiency | ~15% | Rule-based: account type × dividend eligibility × listing |

Missing data → factor shows "Insufficient data" + neutral 50 baseline. No silent defaults.
Editor overrides → visible flag + editor note on Stock File page.
Score caching → Vercel KV or Sanity `scoreSnapshot` document (decision in Phase 3 README update).

See `/methodology` for plain-English explanation with formulas.

---

## Top Lists at launch (4 exactly)

| List | Slug | Account focus |
|---|---|---|
| Top 10 Canadian Dividend Stocks for TFSA | `top-canadian-dividend-stocks-tfsa` | TFSA |
| Top 10 Canadian Growth Stocks Under $40 | `top-canadian-growth-stocks-under-40` | Any |
| Top 10 Canadian Bank Stocks | `top-canadian-bank-stocks` | Any |
| Top 10 Canadian ETFs for TFSA | `top-canadian-etfs-tfsa` | TFSA |

Update cadence: quarterly, with visible changelogs.

---

## API routes

| Method & path | Role |
|---|---|
| `GET /api/quote?symbols=RY.TO,SHOP.TO` | Cached quote proxy (~60s) |
| `GET /api/candles?symbol=RY.TO&range=1M` | Cached OHLC for charts (~1h) |
| `GET /api/search?q=…` | Stock search (local Sanity + Finnhub remote) |
| `POST /api/revalidate` | Sanity webhook: validates secret, revalidates affected routes |
| `POST /api/subscribe` | Newsletter signup → Beehiiv |
| `POST /api/cron/weekly-digest` | (Phase 5) Personalized watchlist digest |

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Default `production` |
| `SANITY_API_TOKEN` | dev/seed | Server-side Sanity token |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Canonical URL |
| `FINNHUB_API_KEY` | recommended | Finnhub free tier; without it, quotes use sample data labelled "Sample" |
| `REVALIDATION_SECRET` | recommended | Shared secret for webhook header `x-revalidation-secret` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | optional | GA4 (e.g. `G-XXXXXXXXXX`) |
| `BEEHIIV_API_KEY` | optional | Beehiiv API key |
| `BEEHIIV_PUBLICATION_ID` | optional | Beehiiv publication ID |
| `BEEHIIV_REACTIVATE` | optional | Default on — reactivate lapsed subscribers |
| `BEEHIIV_SEND_WELCOME` | optional | Default on — send welcome automation |

**Removed in Phase 1:** `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` (AdSense removed)

---

## Market data

**Provider:** Finnhub (free tier). `lib/market/finnhub.ts` wraps:
- `getQuote(symbol)` — cached ~60s
- `getQuotes(symbols)` — parallel batch
- `getCandles(symbol, range)` — cached ~1h
- `getCompanyProfile(symbol)` — cached ~24h
- `searchSymbol(query)` — cached ~1h

**TSX symbol format:** `RY.TO`, `SHOP.TO`. TSXV: `.V`. Indices: `^GSPTSE`, `^GSPC`. CAD/USD: `CAD=X`.

**Marquee fallback symbols (Phase 1):** `^GSPTSE`, `^GSPC`, `RY.TO`, `SHOP.TO`, `ENB.TO`, `CAD=X`, `CNQ.TO`, `TD.TO`, `BNS.TO`, `OTEX.TO` — configurable via `siteSettings.marketTickerSymbols` in Sanity.

---

## Project structure

```
app/
├── page.tsx                  Homepage
├── brief/                    Brief archive + [slug] issue
├── stocks/                   Stock Files index + [slug] detail
├── playbooks/                Playbooks index + [slug]
├── best/                     Top Lists index + [slug]
├── methodology/              Scoring methodology (static)
├── watchlist/page.tsx        Watchlist (Phase 5 redesign)
├── subscribe/page.tsx        Subscribe landing
├── newsletter/page.tsx       Beehiiv archive
├── about, disclaimer, privacy-policy
├── sponsor/page.tsx          Sponsorship (dormant at launch)
├── not-found.tsx, error.tsx, loading.tsx
└── api/
    ├── quote, candles, search, subscribe
    ├── revalidate/           Sanity webhook
    └── cron/weekly-digest/   (Phase 5)

components/
├── layout/                   Header, Footer, Logo, CommandPalette
├── market/                   MarketTicker, StockChart, PriceCell, Sparkline
├── stocks/                   StockCard, StockGrid
├── newsletter/               NewsletterForm, NewsletterCTA, StickySubscribeBar
├── watchlist/                WatchlistButton, WatchlistView
├── portable/                 PortableProse
└── ui/                       SectionHeading, Disclaimer, Breadcrumb, Pagination

lib/
├── sanity/                   client, queries, image
├── market/                   finnhub.ts, symbols.ts
├── newsletter/               provider.ts, beehiiv.ts, beehiiv-posts.ts
├── scoring/                  (Phase 3) value, growth, quality, dividendSafety, momentum, taxEfficiency
├── affiliates/               (Phase 4, dormant) providers.ts, slots.tsx
├── rankings/                 (Phase 4.5) auto-rank.ts
├── types.ts
├── utils.ts
└── watchlist.ts

sanity/schemaTypes/
    stock (deprecated), weeklyPick (deprecated), insight (deprecated),
    sponsorship, author, siteSettings
    [Phase 2 adds: stockFile, brief, playbook, rankedList]

scripts/
├── seed.mjs                  npm run seed / npm run seed:reset
├── migrate-to-new-schemas.mjs (Phase 2) — stock→stockFile, weeklyPick→brief, topList→rankedList
├── score.mjs                 (Phase 3) — compute and persist score snapshots
└── import-content.mjs        (Phase 4) — frontmatter markdown → Sanity document
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build + sitemap |
| `npm start` | Production serve |
| `npm run lint` | ESLint |
| `npm run seed` | Seed Sanity (`scripts/seed.mjs`) |
| `npm run seed:reset` | Reset + seed |
| `npm run migrate` | (Phase 2) Migrate legacy docs to new schemas |
| `npm run import-content` | (Phase 4) Import markdown frontmatter to Sanity |

---

## Sanity webhook

Configure in Sanity → API → Webhooks:
- **URL:** `https://yourdomain.com/api/revalidate`
- **Trigger on:** Create, Update, Delete
- **Header:** `x-revalidation-secret: <REVALIDATION_SECRET>`
- **GROQ filter:** `_type in ["stockFile","brief","playbook","rankedList","siteSettings","sponsorship"]`

---

## Out of scope (Phase 1 locked)

Refuse these unless Tom explicitly revisits the plan:

- User accounts, login, paywalls
- Live sponsorships at launch (schema exists, UI off)
- ETF detail pages (`/etfs/[slug]`)
- Sector hub pages
- Market dashboard / screener
- Hidden gems section
- Comments, forums
- Mobile app, push notifications, SMS
- AdSense or display ad networks
- Any non-Canadian-investor positioning

---

## Growth strategy (Tom's remit, not the agent's)

AlphaBeat's goal of becoming a top Canadian financial site is a 3–5 year distribution problem, not a product problem. Promotion priority order:

1. Reddit (r/PersonalFinanceCanada, r/CanadianInvestor) — value-add comments, not link-dropping
2. Twitter/X — daily Canadian market takes, link Stock Files contextually
3. Guest posts on Genymoney, Million Dollar Journey, Tawcan, PiggyBank
4. YouTube short-form (2-min Brief recaps) — high-leverage discovery, v2 priority
5. Email exchanges with other Canadian PF newsletters (cross-promotion)

---

## Phase log

| Phase | Status | Description |
|---|---|---|
| Phase 1 — Demolition | ✅ Complete | Stripped old IA, new nav/footer/homepage, 4 stub sections |
| Phase 2 — New schemas + routes | ✅ Complete | stockFile, brief, playbook, rankedList schemas + full pages, migration script |
| Phase 3 — The Score | ✅ Complete | 6-factor scoring engine, daily GitHub Actions cron, scoreSnapshot caching, /methodology |
| Phase 4 — Content plumbing + affiliates | ✅ Complete | 38 stockFiles seeded + scored, import script, affiliate slots (dormant) |
| Phase 4.5 — Top Lists | ✅ Complete | 4 rankedList drafts in Sanity, auto-rank helper |
| Phase 5 — Tracker + digest | ✅ Complete | Watchlist table with live scores, personalized Sunday digest via Resend |
| Phase 6 — Polish + launch | ✅ Complete | GA4 events, sitemap with Sanity slugs, 404 rewrite, Canadian disclaimer, JSON-LD, accessible playbook sections |
