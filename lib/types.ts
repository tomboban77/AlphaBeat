// ============================================================================
// Sanity primitives
// ============================================================================

export interface SanitySlug {
  current: string;
  _type?: "slug";
}

export interface SanityImageAsset {
  _ref: string;
  _type?: "reference";
}

export interface SanityImage {
  asset: SanityImageAsset;
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
}

export interface SanitySpan {
  _type: string;
  _key: string;
  text: string;
  marks?: string[];
}

export interface SanityMarkDef {
  _type: string;
  _key: string;
  href?: string;
  blank?: boolean;
}

export interface SanityTextBlock {
  _type: "block";
  _key: string;
  style?: string;
  children: SanitySpan[];
  markDefs?: SanityMarkDef[];
  listItem?: string;
  level?: number;
}

export interface SanityImageBlock {
  _type: "image";
  _key: string;
  asset: SanityImageAsset;
  alt?: string;
  caption?: string;
}

export type SanityBodyBlock = SanityTextBlock | SanityImageBlock;

// ============================================================================
// Author / Site
// ============================================================================

export interface Author {
  name: string;
  slug?: SanitySlug;
  image?: SanityImage;
  bio?: string;
  credentials?: string;
  twitter?: string;
  linkedin?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  logo?: SanityImage;
  defaultOgImage?: SanityImage;
  googleAnalyticsId?: string;
  adsensePublisherId?: string;
  marketTickerSymbols?: string[];
  footerText?: string;
  disclaimerText?: string;
}

// ============================================================================
// Sector
// ============================================================================

export type AccentColor =
  | "cyan"
  | "emerald"
  | "violet"
  | "amber"
  | "rose"
  | "sky"
  | "lime"
  | "fuchsia";

export interface Sector {
  _id: string;
  title: string;
  slug: SanitySlug;
  tagline?: string;
  description?: string;
  icon?: string;
  accent?: AccentColor;
  heroImage?: SanityImage;
  sortOrder?: number;
  stockCount?: number;
}

// ============================================================================
// Sponsorship
// ============================================================================

export interface Sponsorship {
  _id: string;
  name?: string;
  sponsorName: string;
  sponsorLogo?: SanityImage;
  ticker?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  disclosure?: string;
  active?: boolean;
}

// ============================================================================
// Stock
// ============================================================================

export type ExchangeCode = "NASDAQ" | "NYSE" | "TSX" | "TSXV" | "OTHER";
export type CountryCode = "US" | "CA" | "OTHER";
export type MarketCapBand = "mega" | "large" | "mid" | "small" | "micro";
export type RiskScore = "low" | "medium" | "high" | "speculative";
export type StockTag =
  | "hidden-gem"
  | "dividend-champion"
  | "growth-compounder"
  | "defensive"
  | "turnaround"
  | "cyclical-leader"
  | "ai-infrastructure"
  | "fintech"
  | "clean-energy";

export interface StockCatalyst {
  _key?: string;
  label?: string;
  date?: string;
}

export interface Stock {
  _id: string;
  ticker: string;
  exchange: ExchangeCode;
  country?: CountryCode;
  name: string;
  slug: SanitySlug;
  industry?: string;
  marketCapBand?: MarketCapBand;
  headline?: string;
  logo?: SanityImage;
  trending?: boolean;
  featured?: boolean;
  sponsored?: boolean;
  sortOrder?: number;
  sector?: Pick<Sector, "_id" | "title" | "slug" | "accent" | "icon">;
  sponsorship?: Sponsorship;

  // discovery / risk
  tags?: StockTag[];
  riskScore?: RiskScore;
  pickedPrice?: number;
  pickedAt?: string;

  // detail-only
  editorTake?: SanityBodyBlock[];
  bullCase?: string[];
  bearCase?: string[];
  catalysts?: StockCatalyst[];
  metaTitle?: string;
  metaDescription?: string;
  relatedStocks?: Stock[];
  relatedEtfs?: EtfEntry[];
}

// ============================================================================
// ETF
// ============================================================================

export interface EtfListingRow {
  marketLabel?: string;
  ticker: string;
  currency?: string;
  note?: string;
}

export interface EtfHolding {
  name?: string;
  weightPercent?: number;
}

export interface EtfEntry {
  _id: string;
  title: string;
  slug: SanitySlug;
  primaryTicker?: string;
  tracksIndexName?: string;
  categoryTag?: string;
  headline?: string;
  summary?: string;
  mechanics?: string;
  whoItsFor?: string;
  listings?: EtfListingRow[];
  merPercent?: number;
  aumLabel?: string;
  distributionYield?: number;
  topHoldings?: EtfHolding[];
  returnContext?: string;
  returnYTD?: number;
  return1Y?: number;
  return3Y?: number;
  return5Y?: number;
  returnsAsOf?: string;
  trending?: boolean;
  featured?: boolean;
  sortOrder?: number;
  logo?: SanityImage;
}

// ============================================================================
// Weekly pick
// ============================================================================

export type MarketTone = "risk-on" | "risk-off" | "neutral" | "choppy";
export type Horizon = "short" | "medium" | "long";
export type Conviction = "low" | "medium" | "high";

export interface WeeklyPickRow {
  _key?: string;
  horizon?: Horizon;
  conviction?: Conviction;
  thesis: string;
  stock: Stock;
}

export interface WeeklyPick {
  _id: string;
  title: string;
  slug: SanitySlug;
  weekOf: string;
  marketTone?: MarketTone;
  heroImage?: SanityImage;
  intro?: SanityBodyBlock[];
  picks?: WeeklyPickRow[];
  pickCount?: number;
  author?: Author;
  published?: boolean;
}

// ============================================================================
// Top-by-sector list (permanent /top/[slug])
// ============================================================================

export type TopVerdict = "top-pick" | "buy-weakness" | "watchlist" | "speculative";

export interface TopListRow {
  _key?: string;
  thesis: string;
  verdict?: TopVerdict;
  stock: Stock;
}

export interface TopList {
  _id: string;
  title: string;
  slug: SanitySlug;
  subtitle?: string;
  sector: Pick<Sector, "_id" | "title" | "slug" | "accent" | "icon">;
  intro?: SanityBodyBlock[];
  heroImage?: SanityImage;
  lastUpdated: string;
  picks?: TopListRow[];
  pickCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  published?: boolean;
}

// ============================================================================
// Insight (article)
// ============================================================================

export type InsightKind =
  | "analysis"
  | "news"
  | "earnings"
  | "macro"
  | "explainer"
  | "opinion";

export interface Insight {
  _id: string;
  title: string;
  slug: SanitySlug;
  kind?: InsightKind;
  author?: Author;
  sector?: Pick<Sector, "_id" | "title" | "slug" | "accent">;
  tickers?: Pick<Stock, "_id" | "ticker" | "name" | "slug">[];
  mainImage?: SanityImage;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  body?: SanityBodyBlock[];
  tags?: string[];
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  readingTime?: number;
}

// ============================================================================
// Market Note (daily editorial)
// ============================================================================

export type MarketRegime = "risk-on" | "mixed" | "risk-off" | "auto";
export type SectorDirection = "tailwind" | "headwind" | "neutral";

export interface SectorRead {
  _key?: string;
  direction: SectorDirection;
  rationale: string;
  sector: Pick<Sector, "_id" | "title" | "slug" | "accent" | "icon">;
}

export interface MarketNote {
  _id: string;
  title: string;
  summary: string;
  publishedAt: string;
  regime: MarketRegime;
  themes?: string[];
  body?: SanityBodyBlock[];
  sectorReads?: SectorRead[];
  stockMentions?: Pick<
    Stock,
    "_id" | "ticker" | "name" | "slug" | "sector"
  >[];
  author?: Author;
  pinned?: boolean;
}

// ============================================================================
// Market data (Finnhub-shaped, normalized)
// ============================================================================

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  asOf?: number; // unix seconds
  currency?: string;
  stale?: boolean;
}

export interface CandlePoint {
  t: number; // unix seconds
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

export interface CompanyProfile {
  symbol: string;
  name?: string;
  exchange?: string;
  country?: string;
  industry?: string;
  marketCap?: number; // in millions
  shareOutstanding?: number;
  ipo?: string;
  weburl?: string;
  logo?: string;
  currency?: string;
}
