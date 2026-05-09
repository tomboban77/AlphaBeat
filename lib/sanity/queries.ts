import { groq } from "next-sanity";

// ============================================================================
// Stock
// ============================================================================

const stockCardFields = groq`
  _id,
  ticker,
  exchange,
  country,
  name,
  slug,
  industry,
  marketCapBand,
  headline,
  trending,
  featured,
  sponsored,
  sortOrder,
  logo,
  tags,
  riskScore,
  pickedPrice,
  pickedAt,
  "sector": sector->{_id, title, slug, accent, icon},
  "sponsorship": sponsorship->{_id, sponsorName, sponsorLogo, ctaLabel, ctaUrl, disclosure, active}
`;

const stockDetailFields = groq`
  ${stockCardFields},
  editorTake,
  bullCase,
  bearCase,
  catalysts,
  metaTitle,
  metaDescription,
  "relatedStocks": relatedStocks[]->{ ${stockCardFields} },
  "relatedEtfs": relatedEtfs[]->{
    _id, title, slug, primaryTicker, tracksIndexName, categoryTag, headline, merPercent, logo
  }
`;

export const allPublishedStocksQuery = groq`
  *[_type == "stock" && published == true]
  | order(sortOrder asc, ticker asc) {
    ${stockCardFields}
  }
`;

export const trendingStocksQuery = groq`
  *[_type == "stock" && published == true && trending == true]
  | order(sortOrder asc, ticker asc)[0...12] {
    ${stockCardFields}
  }
`;

export const featuredStockQuery = groq`
  *[_type == "stock" && published == true && featured == true]
  | order(sortOrder asc)[0] {
    ${stockDetailFields}
  }
`;

export const stocksBySectorSlugQuery = groq`
  *[_type == "stock" && published == true && sector->slug.current == $slug]
  | order(sortOrder asc, ticker asc) {
    ${stockCardFields}
  }
`;

export const stockBySlugQuery = groq`
  *[_type == "stock" && slug.current == $slug && published == true][0] {
    ${stockDetailFields}
  }
`;

export const stockByTickerQuery = groq`
  *[_type == "stock" && lower(ticker) == lower($ticker) && published == true][0] {
    ${stockDetailFields}
  }
`;

export const stockSlugsQuery = groq`
  *[_type == "stock" && published == true && defined(slug.current)][].slug.current
`;

export const stockTickersQuery = groq`
  *[_type == "stock" && published == true && defined(ticker)][].ticker
`;

// ============================================================================
// Sector
// ============================================================================

const sectorFields = groq`
  _id, title, slug, tagline, description, icon, accent, heroImage, sortOrder
`;

export const allSectorsQuery = groq`
  *[_type == "sector"] | order(sortOrder asc, title asc) {
    ${sectorFields}
  }
`;

export const sectorBySlugQuery = groq`
  *[_type == "sector" && slug.current == $slug][0] { ${sectorFields} }
`;

export const sectorSlugsQuery = groq`
  *[_type == "sector" && defined(slug.current)][].slug.current
`;

// Sector list with counts of published stocks each — used on /sectors landing.
export const sectorsWithCountsQuery = groq`
  *[_type == "sector"] | order(sortOrder asc, title asc) {
    ${sectorFields},
    "stockCount": count(*[_type == "stock" && published == true && references(^._id)])
  }
`;

// ============================================================================
// ETF
// ============================================================================

const etfCardFields = groq`
  _id, title, slug, primaryTicker, tracksIndexName, categoryTag,
  headline, merPercent, aumLabel, distributionYield, trending, featured,
  sortOrder, logo,
  returnYTD, return1Y, return3Y, return5Y, returnsAsOf
`;

const etfDetailFields = groq`
  ${etfCardFields},
  summary, mechanics, whoItsFor, listings, topHoldings, returnContext
`;

export const allPublishedEtfsQuery = groq`
  *[_type == "etfEntry" && published == true]
  | order(sortOrder asc, title asc) {
    ${etfCardFields}
  }
`;

export const trendingEtfsQuery = groq`
  *[_type == "etfEntry" && published == true && trending == true]
  | order(sortOrder asc)[0...8] { ${etfCardFields} }
`;

// All ETFs with return data (for leaderboard splits in /etfs page).
export const etfsWithReturnsQuery = groq`
  *[_type == "etfEntry" && published == true && defined(return1Y)] {
    ${etfCardFields}
  }
`;

export const etfBySlugQuery = groq`
  *[_type == "etfEntry" && slug.current == $slug && published == true][0] { ${etfDetailFields} }
`;

export const etfSlugsQuery = groq`
  *[_type == "etfEntry" && published == true && defined(slug.current)][].slug.current
`;

// ============================================================================
// Weekly picks
// ============================================================================

const weeklyPickListFields = groq`
  _id, title, slug, weekOf, marketTone, heroImage, published,
  "pickCount": count(picks),
  "author": author->{name, slug, image, credentials}
`;

const weeklyPickDetailFields = groq`
  ${weeklyPickListFields},
  intro,
  picks[] {
    horizon,
    conviction,
    thesis,
    "stock": stock->{
      _id, ticker, exchange, country, name, slug, industry,
      headline, logo,
      "sector": sector->{_id, title, slug, accent}
    }
  }
`;

export const latestWeeklyPickQuery = groq`
  *[_type == "weeklyPick" && published == true]
  | order(weekOf desc)[0] { ${weeklyPickDetailFields} }
`;

export const weeklyPicksListQuery = groq`
  *[_type == "weeklyPick" && published == true]
  | order(weekOf desc) { ${weeklyPickListFields} }
`;

export const weeklyPickBySlugQuery = groq`
  *[_type == "weeklyPick" && slug.current == $slug && published == true][0] { ${weeklyPickDetailFields} }
`;

export const weeklyPickSlugsQuery = groq`
  *[_type == "weeklyPick" && published == true && defined(slug.current)][].slug.current
`;

// ============================================================================
// Hidden Gems (stocks tagged "hidden-gem")
// ============================================================================

export const hiddenGemsQuery = groq`
  *[_type == "stock" && published == true && "hidden-gem" in tags]
  | order(sortOrder asc, ticker asc) {
    ${stockCardFields}
  }
`;

export const featuredHiddenGemsQuery = groq`
  *[_type == "stock" && published == true && "hidden-gem" in tags]
  | order(sortOrder asc, ticker asc)[0...4] {
    ${stockCardFields}
  }
`;

// ============================================================================
// Top lists (permanent /top/[slug])
// ============================================================================

const topListCardFields = groq`
  _id, title, slug, subtitle, lastUpdated, heroImage, published,
  "sector": sector->{_id, title, slug, accent, icon},
  "pickCount": count(picks)
`;

const topListDetailFields = groq`
  ${topListCardFields},
  intro, metaTitle, metaDescription,
  picks[] {
    _key,
    thesis,
    verdict,
    "stock": stock->{
      _id, ticker, exchange, country, name, slug, industry, marketCapBand,
      headline, logo, tags, riskScore,
      "sector": sector->{_id, title, slug, accent, icon}
    }
  }
`;

export const allTopListsQuery = groq`
  *[_type == "topList" && published == true]
  | order(lastUpdated desc) { ${topListCardFields} }
`;

export const topListBySlugQuery = groq`
  *[_type == "topList" && slug.current == $slug && published == true][0] {
    ${topListDetailFields}
  }
`;

export const topListBySectorQuery = groq`
  *[_type == "topList" && published == true && sector->slug.current == $sectorSlug][0] {
    ${topListCardFields}
  }
`;

export const topListSlugsQuery = groq`
  *[_type == "topList" && published == true && defined(slug.current)][].slug.current
`;

// ============================================================================
// Insights (formerly post)
// ============================================================================

const insightCardFields = groq`
  _id, title, slug, kind, mainImage, excerpt, publishedAt, updatedAt,
  readingTime, featured,
  "author": author->{name, slug, image, credentials},
  "sector": sector->{_id, title, slug, accent},
  "tickers": tickers[]->{_id, ticker, name, slug}
`;

const insightDetailFields = groq`
  ${insightCardFields},
  body, tags, metaTitle, metaDescription
`;

export const latestInsightsQuery = groq`
  *[_type == "insight"] | order(publishedAt desc)[0...$limit] { ${insightCardFields} }
`;

export const paginatedInsightsQuery = groq`
  *[_type == "insight"] | order(publishedAt desc)[$start...$end] { ${insightCardFields} }
`;

export const insightCountQuery = groq`count(*[_type == "insight"])`;

export const insightBySlugQuery = groq`
  *[_type == "insight" && slug.current == $slug][0] { ${insightDetailFields} }
`;

export const insightSlugsQuery = groq`
  *[_type == "insight" && defined(slug.current)][].slug.current
`;

export const insightsByTickerQuery = groq`
  *[_type == "insight" && $stockId in tickers[]._ref] | order(publishedAt desc)[0...4] {
    ${insightCardFields}
  }
`;

export const insightsBySectorQuery = groq`
  *[_type == "insight" && sector._ref == $sectorId] | order(publishedAt desc)[0...6] {
    ${insightCardFields}
  }
`;

// ============================================================================
// Sponsorships
// ============================================================================

export const activeSponsorshipsQuery = groq`
  *[_type == "sponsorship" && active == true] | order(_createdAt desc) {
    _id, name, sponsorName, sponsorLogo, ticker, ctaLabel, ctaUrl, disclosure
  }
`;

// ============================================================================
// Site settings
// ============================================================================

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    siteName, tagline, logo, defaultOgImage,
    googleAnalyticsId, adsensePublisherId, marketTickerSymbols,
    footerText, disclaimerText
  }
`;

// Tiny: just the marquee ticker symbol list for the layout.
export const tickerSymbolsQuery = groq`
  *[_type == "siteSettings"][0].marketTickerSymbols
`;
