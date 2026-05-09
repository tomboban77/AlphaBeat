import { defineField, defineType } from "sanity";

export default defineType({
  name: "stock",
  title: "Stock",
  type: "document",
  groups: [
    { name: "core", title: "Core", default: true },
    { name: "editorial", title: "Editorial" },
    { name: "thesis", title: "Thesis" },
    { name: "sponsor", title: "Sponsor / display" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "ticker",
      title: "Ticker symbol",
      type: "string",
      group: "core",
      description: 'Use the primary listing — e.g. "NVDA", "SHOP.TO", "RY.TO".',
      validation: (Rule) => Rule.required().min(1).max(12),
    }),
    defineField({
      name: "exchange",
      title: "Exchange",
      type: "string",
      group: "core",
      options: {
        list: [
          { title: "NASDAQ", value: "NASDAQ" },
          { title: "NYSE", value: "NYSE" },
          { title: "TSX (Toronto)", value: "TSX" },
          { title: "TSXV (TSX Venture)", value: "TSXV" },
          { title: "Other", value: "OTHER" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      group: "core",
      options: {
        list: [
          { title: "United States", value: "US" },
          { title: "Canada", value: "CA" },
          { title: "Other", value: "OTHER" },
        ],
      },
      initialValue: "US",
    }),
    defineField({
      name: "name",
      title: "Company name",
      type: "string",
      group: "core",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (auto = ticker, lowercased)",
      type: "slug",
      group: "core",
      options: {
        source: (doc) => (doc.ticker as string)?.toLowerCase().replace(/\./g, "-") || "",
        maxLength: 24,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo / brandmark",
      type: "image",
      group: "core",
      options: { hotspot: true },
    }),
    defineField({
      name: "sector",
      title: "Sector",
      type: "reference",
      group: "core",
      to: [{ type: "sector" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "industry",
      title: "Industry (sub-sector)",
      type: "string",
      group: "core",
      description: 'Free-text — e.g. "Semiconductors", "Cloud software", "Big Six bank"',
    }),
    defineField({
      name: "marketCapBand",
      title: "Market cap band",
      type: "string",
      group: "core",
      options: {
        list: [
          { title: "Mega cap (>$200B)", value: "mega" },
          { title: "Large cap ($10B–$200B)", value: "large" },
          { title: "Mid cap ($2B–$10B)", value: "mid" },
          { title: "Small cap ($300M–$2B)", value: "small" },
          { title: "Micro cap (<$300M)", value: "micro" },
        ],
      },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "core",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
        list: [
          { title: "Hidden Gem (under $20, high upside)", value: "hidden-gem" },
          { title: "Dividend champion", value: "dividend-champion" },
          { title: "Growth compounder", value: "growth-compounder" },
          { title: "Defensive / recession-resistant", value: "defensive" },
          { title: "Turnaround / special situation", value: "turnaround" },
          { title: "Cyclical leader", value: "cyclical-leader" },
          { title: "AI infrastructure", value: "ai-infrastructure" },
          { title: "Fintech disruptor", value: "fintech" },
          { title: "Clean energy", value: "clean-energy" },
        ],
      },
      description:
        'Tags drive discovery pages. "hidden-gem" puts the stock on the Hidden Gems landing page (/hidden-gems).',
    }),
    defineField({
      name: "riskScore",
      title: "Risk score",
      type: "string",
      group: "core",
      options: {
        list: [
          { title: "Low (blue chip / dividend stalwart)", value: "low" },
          { title: "Medium (mainstream growth)", value: "medium" },
          { title: "High (volatile / earlier-stage)", value: "high" },
          { title: "Speculative (small cap, high beta, story stock)", value: "speculative" },
        ],
      },
      description:
        "Required for Hidden Gem entries — sets the risk badge shown beside the price on cards and detail pages.",
    }),
    defineField({
      name: "pickedPrice",
      title: "Picked at price (USD/CAD as relevant)",
      type: "number",
      group: "core",
      description:
        'Optional — the price when this entry was added. Shown on Hidden Gems as "Picked at $X.XX" so readers see the editor\'s entry point.',
    }),
    defineField({
      name: "pickedAt",
      title: "Picked at date",
      type: "date",
      group: "core",
      description: "Optional — the day this entry was added. Pairs with Picked at price.",
    }),
    defineField({
      name: "headline",
      title: "One-line thesis (the hook)",
      type: "string",
      group: "editorial",
      description: "ONE sentence — what makes this stock interesting right now. Shows on cards.",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: "editorTake",
      title: "Editor's take (rich text)",
      type: "array",
      group: "editorial",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                title: "URL",
                name: "link",
                type: "object",
                fields: [
                  { title: "URL", name: "href", type: "url" },
                  { title: "New tab", name: "blank", type: "boolean", initialValue: true },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "bullCase",
      title: "Bull case (3–5 bullets)",
      type: "array",
      group: "thesis",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "bearCase",
      title: "Bear case / risks (3–5 bullets)",
      type: "array",
      group: "thesis",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "catalysts",
      title: "Upcoming catalysts",
      type: "array",
      group: "thesis",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "date", title: "Approx date", type: "string", description: 'Free text — e.g. "Q3 2026 earnings", "Apr 24"' }),
          ],
          preview: { select: { title: "label", subtitle: "date" } },
        },
      ],
    }),
    defineField({
      name: "relatedStocks",
      title: "Related stocks",
      type: "array",
      group: "editorial",
      of: [{ type: "reference", to: [{ type: "stock" }] }],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "relatedEtfs",
      title: "Related ETFs",
      type: "array",
      group: "editorial",
      of: [{ type: "reference", to: [{ type: "etfEntry" }] }],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "trending",
      title: "Trending (show on home + sector pages)",
      type: "boolean",
      group: "sponsor",
      initialValue: false,
    }),
    defineField({
      name: "featured",
      title: "Featured (hero / spotlight)",
      type: "boolean",
      group: "sponsor",
      initialValue: false,
    }),
    defineField({
      name: "sponsored",
      title: "Sponsored placement",
      type: "boolean",
      group: "sponsor",
      description:
        "If true, this entry shows a 'Sponsored' ribbon and disclosure. Required by SEC/CSA paid-promotion rules.",
      initialValue: false,
    }),
    defineField({
      name: "sponsorship",
      title: "Sponsorship details",
      type: "reference",
      group: "sponsor",
      to: [{ type: "sponsorship" }],
      hidden: ({ parent }) => !parent?.sponsored,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      group: "sponsor",
      initialValue: 100,
      description: "Lower = appears first.",
    }),
    defineField({
      name: "published",
      title: "Published on site",
      type: "boolean",
      group: "sponsor",
      initialValue: false,
    }),
    defineField({
      name: "metaTitle",
      title: "SEO title override",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "metaDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (Rule) => Rule.max(170),
    }),
  ],
  orderings: [
    { title: "Sort order", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] },
    { title: "Ticker A-Z", name: "tickerAsc", by: [{ field: "ticker", direction: "asc" }] },
  ],
  preview: {
    select: {
      ticker: "ticker",
      name: "name",
      exchange: "exchange",
      published: "published",
      sponsored: "sponsored",
      media: "logo",
    },
    prepare({ ticker, name, exchange, published, sponsored, media }) {
      const flags = [
        published ? "live" : "draft",
        sponsored ? "sponsored" : null,
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        title: `${ticker || "—"}  ${name || ""}`,
        subtitle: `${exchange || ""}${flags ? ` · ${flags}` : ""}`,
        media,
      };
    },
  },
});
