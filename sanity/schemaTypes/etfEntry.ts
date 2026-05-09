import { defineField, defineType } from "sanity";

export default defineType({
  name: "etfEntry",
  title: "ETF",
  type: "document",
  groups: [
    { name: "core", title: "Core", default: true },
    { name: "editorial", title: "Editorial" },
    { name: "details", title: "Details" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "ETF name",
      type: "string",
      group: "core",
      description: 'e.g. "Vanguard S&P 500 ETF"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "core",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "primaryTicker",
      title: "Primary ticker (for live quote)",
      type: "string",
      group: "core",
      description: 'The ticker we will pull the live quote for. Suffix .TO for TSX, e.g. "VFV.TO".',
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "core",
      options: { hotspot: true },
    }),
    defineField({
      name: "tracksIndexName",
      title: "Tracks (index / benchmark)",
      type: "string",
      group: "core",
      description: 'e.g. "S&P 500", "Nasdaq-100", "S&P/TSX 60"',
    }),
    defineField({
      name: "categoryTag",
      title: "Category",
      type: "string",
      group: "core",
      options: {
        list: [
          { title: "US broad market", value: "us-broad" },
          { title: "US technology", value: "us-tech" },
          { title: "US dividends", value: "us-dividend" },
          { title: "Canada", value: "canada" },
          { title: "International / global", value: "global" },
          { title: "Emerging markets", value: "emerging" },
          { title: "Bonds / fixed income", value: "bonds" },
          { title: "Thematic (AI, clean energy, etc.)", value: "thematic" },
          { title: "Commodities", value: "commodities" },
          { title: "Other", value: "other" },
        ],
        layout: "dropdown",
      },
      initialValue: "us-broad",
    }),
    defineField({
      name: "headline",
      title: "One-line take",
      type: "string",
      group: "editorial",
      description: "Short tagline shown on cards.",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: "summary",
      title: "What it is (plain language)",
      type: "text",
      group: "editorial",
      rows: 5,
      description: "Short explanation a beginner can understand.",
    }),
    defineField({
      name: "mechanics",
      title: "How your money is invested",
      type: "text",
      group: "editorial",
      rows: 5,
    }),
    defineField({
      name: "whoItsFor",
      title: "Who it's for",
      type: "text",
      group: "editorial",
      rows: 3,
      description: "1-3 sentences on the ideal investor profile.",
    }),
    defineField({
      name: "listings",
      title: "Ticker listings",
      type: "array",
      group: "details",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "marketLabel", title: "Market / exchange", type: "string", description: 'e.g. "TSX", "NYSE", "NASDAQ"' }),
            defineField({ name: "ticker", title: "Ticker", type: "string", validation: (Rule) => Rule.required() }),
            defineField({
              name: "currency",
              title: "Currency",
              type: "string",
              options: { list: [{ title: "CAD", value: "CAD" }, { title: "USD", value: "USD" }] },
              initialValue: "CAD",
            }),
            defineField({ name: "note", title: "Note", type: "string", description: 'e.g. "CAD-hedged", "Accumulating"' }),
          ],
          preview: {
            select: { ticker: "ticker", market: "marketLabel" },
            prepare({ ticker, market }) {
              return { title: ticker || "Listing", subtitle: market };
            },
          },
        },
      ],
    }),
    defineField({
      name: "merPercent",
      title: "MER (%)",
      type: "number",
      group: "details",
    }),
    defineField({
      name: "aumLabel",
      title: "AUM (display string)",
      type: "string",
      group: "details",
      description: 'Free text — e.g. "$418B", "$8.2B CAD"',
    }),
    defineField({
      name: "distributionYield",
      title: "Distribution yield (%)",
      type: "number",
      group: "details",
    }),
    defineField({
      name: "topHoldings",
      title: "Top holdings",
      type: "array",
      group: "details",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "weightPercent", title: "Weight %", type: "number" }),
          ],
          preview: {
            select: { title: "name", weight: "weightPercent" },
            prepare({ title, weight }) {
              return { title: title || "Holding", subtitle: weight != null ? `${weight}%` : "" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "returnContext",
      title: "Historical return context",
      type: "text",
      rows: 6,
      group: "details",
      description: "Past performance is not indicative of future results.",
    }),
    defineField({
      name: "returnYTD",
      title: "Return YTD (%)",
      type: "number",
      group: "details",
      description: "Year-to-date total return (price + distributions). Used in /etfs Top 10 ranking.",
    }),
    defineField({
      name: "return1Y",
      title: "Return 1Y (%)",
      type: "number",
      group: "details",
      description: "Trailing 1-year total return. Default sort key for the /etfs leaderboard.",
    }),
    defineField({
      name: "return3Y",
      title: "Return 3Y annualized (%)",
      type: "number",
      group: "details",
    }),
    defineField({
      name: "return5Y",
      title: "Return 5Y annualized (%)",
      type: "number",
      group: "details",
    }),
    defineField({
      name: "returnsAsOf",
      title: "Returns as-of date",
      type: "date",
      group: "details",
      description: "Date the return numbers above were measured. Refresh monthly.",
    }),
    defineField({
      name: "trending",
      title: "Trending",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      initialValue: 100,
    }),
    defineField({
      name: "published",
      title: "Published on site",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    { title: "Sort order", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", tracks: "tracksIndexName", pub: "published", media: "logo" },
    prepare({ title, tracks, pub, media }) {
      return {
        title: title || "Untitled",
        subtitle: [tracks, pub ? "live" : "draft"].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
