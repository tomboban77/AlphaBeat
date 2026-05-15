import { defineField, defineType } from "sanity";

export default defineType({
  name: "rankedList",
  title: "Top List (Ranked)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (R) => R.required().integer().min(2024).max(2099),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Dividend stocks", value: "dividend-stocks" },
          { title: "Growth stocks", value: "growth-stocks" },
          { title: "Bank stocks", value: "bank-stocks" },
          { title: "Precious metals", value: "precious-metals" },
          { title: "REIT stocks", value: "reit-stocks" },
          { title: "ETFs", value: "etfs" },
          { title: "Under $20", value: "under-20" },
          { title: "Under $40", value: "under-40" },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "accountFocus",
      title: "Account focus",
      type: "string",
      options: {
        list: [
          { title: "TFSA", value: "tfsa" },
          { title: "RRSP", value: "rrsp" },
          { title: "FHSA", value: "fhsa" },
          { title: "Non-registered", value: "non-registered" },
          { title: "Any", value: "any" },
        ],
      },
      initialValue: "any",
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "methodologyNote",
      title: "Methodology note",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "entries",
      title: "Entries (exactly 10)",
      type: "array",
      of: [
        {
          type: "object",
          name: "entry",
          title: "Entry",
          fields: [
            defineField({ name: "rank", title: "Rank (1–10)", type: "number", validation: (R) => R.required().min(1).max(10).integer() }),
            defineField({ name: "stockFile", title: "Stock File", type: "reference", to: [{ type: "stockFile" }] }),
            defineField({ name: "etfTicker", title: "ETF ticker (if no Stock File)", type: "string" }),
            defineField({ name: "etfName", title: "ETF name (if no Stock File)", type: "string" }),
            defineField({ name: "editorTake", title: "Editor take (2–3 sentences)", type: "text", rows: 2, validation: (R) => R.required() }),
            defineField({ name: "keyMetric", title: "Key metric (e.g. 5.2% yield)", type: "string", validation: (R) => R.required() }),
          ],
          preview: {
            select: { rank: "rank", ticker: "stockFile.ticker", etf: "etfTicker" },
            prepare({ rank, ticker, etf }) {
              return { title: `#${rank} — ${ticker || etf || "No ticker"}` };
            },
          },
        },
      ],
      validation: (R) => R.min(1).max(10),
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "datetime",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "changesLog",
      title: "Changes log",
      type: "array",
      of: [
        {
          type: "object",
          name: "logEntry",
          fields: [
            defineField({ name: "date", title: "Date", type: "date", validation: (R) => R.required() }),
            defineField({ name: "change", title: "Change description", type: "string", validation: (R) => R.required() }),
          ],
          preview: { select: { date: "date", change: "change" }, prepare({ date, change }) { return { title: change, subtitle: date }; } },
        },
      ],
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description (max 160 chars)",
      type: "text",
      rows: 2,
      validation: (R) => R.max(160),
    }),
    defineField({
      name: "relatedPlaybooks",
      title: "Related Playbooks",
      type: "array",
      of: [{ type: "reference", to: [{ type: "playbook" }] }],
    }),
  ],

  preview: {
    select: { title: "title", category: "category", year: "year" },
    prepare({ title, year }) {
      return { title, subtitle: String(year) };
    },
  },

  orderings: [
    {
      title: "Last updated",
      name: "lastUpdatedDesc",
      by: [{ field: "lastUpdated", direction: "desc" }],
    },
  ],
});
