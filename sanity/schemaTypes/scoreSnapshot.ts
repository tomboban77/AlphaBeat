import { defineField, defineType } from "sanity";

export default defineType({
  name: "scoreSnapshot",
  title: "Score Snapshot",
  type: "document",
  fields: [
    defineField({ name: "ticker",       title: "Ticker",        type: "string", readOnly: true }),
    defineField({ name: "finnhubSymbol",title: "Finnhub symbol",type: "string", readOnly: true }),
    defineField({ name: "computedAt",   title: "Computed at",   type: "datetime", readOnly: true }),
    defineField({
      name: "scores",
      title: "Factor scores (0-100, null = insufficient data)",
      type: "object",
      readOnly: true,
      fields: [
        defineField({ name: "value",          title: "Value",                type: "number" }),
        defineField({ name: "growth",         title: "Growth",               type: "number" }),
        defineField({ name: "quality",        title: "Quality",              type: "number" }),
        defineField({ name: "dividendSafety", title: "Dividend Safety",      type: "number" }),
        defineField({ name: "momentum",       title: "Momentum",             type: "number" }),
        defineField({ name: "taxEfficiency",  title: "Tax Efficiency",       type: "number" }),
        defineField({ name: "overall",        title: "Overall (weighted)",   type: "number" }),
      ],
    }),
    defineField({
      name: "insufficient",
      title: "Insufficient data flags",
      type: "object",
      readOnly: true,
      fields: [
        defineField({ name: "value",          type: "boolean", title: "Value" }),
        defineField({ name: "growth",         type: "boolean", title: "Growth" }),
        defineField({ name: "quality",        type: "boolean", title: "Quality" }),
        defineField({ name: "dividendSafety", type: "boolean", title: "Dividend Safety" }),
        defineField({ name: "momentum",       type: "boolean", title: "Momentum" }),
      ],
    }),
  ],
  preview: {
    select: { ticker: "ticker", overall: "scores.overall", computedAt: "computedAt" },
    prepare({ ticker, overall, computedAt }) {
      const date = computedAt ? new Date(computedAt).toLocaleDateString() : "?";
      return { title: ticker, subtitle: `Overall: ${overall ?? "N/A"} · ${date}` };
    },
  },
});
