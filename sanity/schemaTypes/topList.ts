import { defineField, defineType } from "sanity";

/**
 * topList — the permanent "Top 10 in [Sector]" editorial product.
 * One per sector (recommended). Lives at /top/[slug].
 * Refreshed periodically; lastUpdated drives the "Updated MMM YYYY" badge.
 */
export default defineType({
  name: "topList",
  title: "Top 10 by Sector",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "Top 10 AI & Semiconductor Stocks for 2026"',
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
      name: "sector",
      title: "Sector",
      type: "reference",
      to: [{ type: "sector" }],
      validation: (Rule) => Rule.required(),
      description: "The sector this list covers. One topList per sector recommended.",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle / tagline",
      type: "string",
      description: "Single line shown under the title.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "intro",
      title: "Editorial intro",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H3", value: "h3" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "date",
      description: "Drives the 'Updated MMM YYYY' badge. Bump whenever you swap or re-rank picks.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "picks",
      title: "Picks (in rank order)",
      type: "array",
      validation: (Rule) => Rule.min(1).max(15),
      of: [
        {
          type: "object",
          name: "topListRow",
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
              title: "Why it makes the list (1-2 paragraphs)",
              type: "text",
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "verdict",
              title: "Verdict tag",
              type: "string",
              options: {
                list: [
                  { title: "Top pick", value: "top-pick" },
                  { title: "Buy on weakness", value: "buy-weakness" },
                  { title: "Watchlist", value: "watchlist" },
                  { title: "Speculative bet", value: "speculative" },
                ],
              },
              initialValue: "top-pick",
            }),
          ],
          preview: {
            select: {
              ticker: "stock.ticker",
              name: "stock.name",
              thesis: "thesis",
              verdict: "verdict",
            },
            prepare({ ticker, name, thesis, verdict }) {
              return {
                title: `${ticker || "—"} ${name || ""}`,
                subtitle: `${verdict || ""}${verdict ? " · " : ""}${(thesis || "").slice(0, 70)}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "metaTitle",
      title: "SEO title override",
      type: "string",
    }),
    defineField({
      name: "metaDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(170),
    }),
    defineField({
      name: "published",
      title: "Published on site",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    { title: "Most recent update", name: "lastUpdatedDesc", by: [{ field: "lastUpdated", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", sectorTitle: "sector.title", media: "heroImage", published: "published" },
    prepare({ title, sectorTitle, media, published }) {
      return {
        title: title || "Untitled list",
        subtitle: `${sectorTitle || "no sector"} · ${published ? "live" : "draft"}`,
        media,
      };
    },
  },
});
