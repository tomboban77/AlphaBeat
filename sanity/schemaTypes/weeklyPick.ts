import { defineField, defineType } from "sanity";

export default defineType({
  name: "weeklyPick",
  title: "Weekly Top 10",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Headline",
      type: "string",
      description: 'e.g. "Top 10 Stocks for the Week of Apr 28"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "weekOf",
      title: "Week of (Monday)",
      type: "date",
      description: "Use the Monday of that week. Drives sort + slug.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "marketTone",
      title: "Market tone",
      type: "string",
      options: {
        list: [
          { title: "Risk-on", value: "risk-on" },
          { title: "Risk-off", value: "risk-off" },
          { title: "Neutral / mixed", value: "neutral" },
          { title: "Choppy / range-bound", value: "choppy" },
        ],
      },
      initialValue: "neutral",
    }),
    defineField({
      name: "intro",
      title: "Intro / market commentary",
      type: "array",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }, { title: "H3", value: "h3" }],
          marks: { decorators: [{ title: "Bold", value: "strong" }, { title: "Italic", value: "em" }] },
        },
      ],
    }),
    defineField({
      name: "picks",
      title: "Picks (in rank order)",
      type: "array",
      validation: (Rule) => Rule.min(1).max(15),
      of: [
        {
          type: "object",
          name: "weeklyPickRow",
          fields: [
            defineField({
              name: "stock",
              title: "Stock",
              type: "reference",
              to: [{ type: "stock" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "thesis",
              title: "Why we picked it (1-2 paragraphs)",
              type: "text",
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "horizon",
              title: "Time horizon",
              type: "string",
              options: {
                list: [
                  { title: "Short term (weeks)", value: "short" },
                  { title: "Medium term (months)", value: "medium" },
                  { title: "Long term (1+ years)", value: "long" },
                ],
              },
              initialValue: "medium",
            }),
            defineField({
              name: "conviction",
              title: "Conviction",
              type: "string",
              options: {
                list: [
                  { title: "Low", value: "low" },
                  { title: "Medium", value: "medium" },
                  { title: "High", value: "high" },
                ],
              },
              initialValue: "medium",
            }),
          ],
          preview: {
            select: { ticker: "stock.ticker", name: "stock.name", thesis: "thesis" },
            prepare({ ticker, name, thesis }) {
              return {
                title: `${ticker || "—"} ${name || ""}`,
                subtitle: thesis?.slice(0, 80) || "",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "published",
      title: "Published on site",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    { title: "Most recent week", name: "weekOfDesc", by: [{ field: "weekOf", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", weekOf: "weekOf", media: "heroImage", published: "published" },
    prepare({ title, weekOf, media, published }) {
      return {
        title: title || "Untitled week",
        subtitle: `${weekOf || "no date"} · ${published ? "live" : "draft"}`,
        media,
      };
    },
  },
});
