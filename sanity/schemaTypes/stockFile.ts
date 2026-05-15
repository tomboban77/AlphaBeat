import { defineField, defineType } from "sanity";

const ACCOUNT_FIT_FIELDS = (prefix: string) => [
  defineField({
    name: "recommendation",
    title: "Recommendation",
    type: "string",
    options: {
      list: [
        { title: "Ideal", value: "ideal" },
        { title: "Good", value: "good" },
        { title: "Acceptable", value: "acceptable" },
        { title: "Avoid", value: "avoid" },
      ],
      layout: "radio",
    },
    initialValue: "acceptable",
  }),
  defineField({
    name: "reasoning",
    title: "Reasoning (1–2 sentences)",
    type: "text",
    rows: 2,
    placeholder: `Why is ${prefix} ideal/good/acceptable/avoid for this stock?`,
  }),
];

export default defineType({
  name: "stockFile",
  title: "Stock File",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "thesis", title: "Thesis" },
    { name: "accountFit", title: "Account Fit" },
    { name: "score", title: "Score Overrides" },
  ],
  fields: [
    // ── Identity ──────────────────────────────────────────────────────────────
    defineField({
      name: "ticker",
      title: "Ticker (display, e.g. RY.TO)",
      type: "string",
      group: "identity",
      validation: (R) => R.required().uppercase(),
    }),
    defineField({
      name: "exchange",
      title: "Exchange",
      type: "string",
      group: "identity",
      options: {
        list: [
          { title: "TSX", value: "TSX" },
          { title: "TSXV", value: "TSXV" },
          { title: "NYSE", value: "NYSE" },
          { title: "NASDAQ", value: "NASDAQ" },
        ],
        layout: "radio",
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "finnhubSymbol",
      title: "Finnhub symbol (API format, e.g. RY — no .TO)",
      type: "string",
      group: "identity",
      description:
        "Bare ticker used for Finnhub API calls. For dual-listed stocks omit .TO (RY not RY.TO). For US stocks use as-is (AAPL).",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "companyName",
      title: "Company name",
      type: "string",
      group: "identity",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "sectorLabel",
      title: "Sector label (plain text, e.g. Canadian Banks)",
      type: "string",
      group: "identity",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "identity",
      options: { source: "ticker", maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "lastReviewed",
      title: "Last reviewed",
      type: "datetime",
      group: "identity",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "reviewType",
      title: "Review type",
      type: "string",
      group: "identity",
      options: {
        list: [
          { title: "Quick (thesis verified, 15-min check)", value: "quick" },
          { title: "Deep (full rewrite)", value: "deep" },
        ],
        layout: "radio",
      },
      initialValue: "quick",
    }),

    // ── Thesis ────────────────────────────────────────────────────────────────
    defineField({
      name: "bullCase",
      title: "Bull case (exactly 3 points)",
      type: "array",
      group: "thesis",
      of: [{ type: "string" }],
      validation: (R) => R.required().min(3).max(3),
    }),
    defineField({
      name: "bearCase",
      title: "Bear case (exactly 3 points)",
      type: "array",
      group: "thesis",
      of: [{ type: "string" }],
      validation: (R) => R.required().min(3).max(3),
    }),
    defineField({
      name: "canadianInvestorParagraph",
      title: "Why a Canadian investor might own this",
      type: "text",
      rows: 4,
      group: "thesis",
      validation: (R) => R.required(),
    }),

    // ── Account Fit ───────────────────────────────────────────────────────────
    defineField({
      name: "accountFit",
      title: "Account fit",
      type: "object",
      group: "accountFit",
      fields: [
        defineField({
          name: "tfsa",
          title: "TFSA",
          type: "object",
          fields: ACCOUNT_FIT_FIELDS("TFSA"),
        }),
        defineField({
          name: "rrsp",
          title: "RRSP",
          type: "object",
          fields: ACCOUNT_FIT_FIELDS("RRSP"),
        }),
        defineField({
          name: "fhsa",
          title: "FHSA",
          type: "object",
          fields: ACCOUNT_FIT_FIELDS("FHSA"),
        }),
        defineField({
          name: "nonRegistered",
          title: "Non-registered",
          type: "object",
          fields: ACCOUNT_FIT_FIELDS("Non-registered"),
        }),
      ],
    }),

    // ── Score Overrides ───────────────────────────────────────────────────────
    defineField({
      name: "editorScoreOverrides",
      title: "Score overrides (0–100 per factor)",
      type: "object",
      group: "score",
      description:
        "Override a computed factor. Leave blank to use the computed value.",
      fields: [
        defineField({ name: "value", title: "Value (0-100)", type: "number", validation: (R) => R.min(0).max(100) }),
        defineField({ name: "growth", title: "Growth (0-100)", type: "number", validation: (R) => R.min(0).max(100) }),
        defineField({ name: "quality", title: "Quality (0-100)", type: "number", validation: (R) => R.min(0).max(100) }),
        defineField({ name: "dividendSafety", title: "Dividend Safety (0-100)", type: "number", validation: (R) => R.min(0).max(100) }),
        defineField({ name: "momentum", title: "Momentum (0-100)", type: "number", validation: (R) => R.min(0).max(100) }),
        defineField({ name: "taxEfficiency", title: "Canadian Tax Efficiency (0-100)", type: "number", validation: (R) => R.min(0).max(100) }),
      ],
    }),
    defineField({
      name: "editorNotes",
      title: "Editor notes (internal)",
      type: "text",
      rows: 3,
      group: "score",
    }),
  ],

  preview: {
    select: { ticker: "ticker", company: "companyName", exchange: "exchange" },
    prepare({ ticker, company, exchange }) {
      return { title: ticker, subtitle: `${company} · ${exchange}` };
    },
  },
});
