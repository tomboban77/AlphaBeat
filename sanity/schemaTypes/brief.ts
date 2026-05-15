import { defineField, defineType } from "sanity";

export default defineType({
  name: "brief",
  title: "Brief",
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
      name: "issueNumber",
      title: "Issue number",
      type: "number",
      validation: (R) => R.required().positive().integer(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "featureStock",
      title: "Feature stock",
      type: "reference",
      to: [{ type: "stockFile" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "featureThesis",
      title: "Feature thesis (~400–500 words)",
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
            annotations: [
              { name: "link", type: "object", title: "Link", fields: [{ name: "href", type: "url", title: "URL" }] },
            ],
          },
        },
      ],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "taxOrAccountTip",
      title: "Tax or account tip (~100–200 words)",
      type: "array",
      of: [{ type: "block" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "tsxQuickNote",
      title: "TSX quick note (one sentence, optional)",
      type: "string",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "briefSponsor",
      title: "Sponsored by (optional — leave blank at launch)",
      type: "object",
      description: "Dormant at launch. Populate once subscriber count justifies selling sponsorships.",
      fields: [
        defineField({ name: "sponsorName", title: "Sponsor name", type: "string" }),
        defineField({ name: "sponsorUrl",  title: "Sponsor URL",  type: "url" }),
        defineField({ name: "disclosure",  title: "Disclosure text", type: "string",
          description: 'e.g. "This issue is sponsored by Acme Corp. AlphaBeat editorial is always independent."' }),
      ],
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description (max 160 chars)",
      type: "text",
      rows: 2,
      validation: (R) => R.max(160),
    }),
  ],

  preview: {
    select: {
      title: "title",
      issue: "issueNumber",
      date: "publishedAt",
      stock: "featureStock.ticker",
    },
    prepare({ title, issue, stock }) {
      return {
        title: `#${issue} — ${title}`,
        subtitle: stock ? `Feature: ${stock}` : "No stock linked",
      };
    },
  },

  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
