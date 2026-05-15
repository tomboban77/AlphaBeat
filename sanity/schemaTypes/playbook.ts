import { defineField, defineType } from "sanity";

export default defineType({
  name: "playbook",
  title: "Playbook",
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
      name: "intro",
      title: "Intro",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          name: "section",
          title: "Section",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string", validation: (R) => R.required() }),
            defineField({
              name: "body",
              title: "Body",
              type: "array",
              of: [
                {
                  type: "block",
                  marks: {
                    annotations: [
                      { name: "link", type: "object", title: "Link", fields: [{ name: "href", type: "url", title: "URL" }] },
                    ],
                  },
                },
              ],
            }),
            defineField({
              name: "relatedStocks",
              title: "Related Stock Files",
              type: "array",
              of: [{ type: "reference", to: [{ type: "stockFile" }] }],
            }),
          ],
          preview: { select: { title: "heading" } },
        },
      ],
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "datetime",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "targetQuery",
      title: "Target query (SEO, hidden)",
      type: "string",
      hidden: true,
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
    select: { title: "title", date: "lastUpdated" },
    prepare({ title }) {
      return { title };
    },
  },
});
