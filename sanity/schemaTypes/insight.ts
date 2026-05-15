import { defineField, defineType } from "sanity";

export default defineType({
  name: "insight",
  title: "Insight (DEPRECATED — migrate to Brief/Playbook)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
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
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Analysis / deep-dive", value: "analysis" },
          { title: "News brief", value: "news" },
          { title: "Earnings recap", value: "earnings" },
          { title: "Macro / market", value: "macro" },
          { title: "Education / explainer", value: "explainer" },
          { title: "Opinion", value: "opinion" },
        ],
      },
      initialValue: "analysis",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "tickers",
      title: "Tickers mentioned",
      type: "array",
      description: "References to stock documents — drives the 'related insights' panel on stock pages.",
      of: [{ type: "reference", to: [{ type: "stock" }] }],
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text", validation: (Rule) => Rule.required() }],
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
    }),
    defineField({
      name: "updatedAt",
      title: "Updated at",
      type: "datetime",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Code", value: "code" },
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
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", type: "string", title: "Alt text" },
            { name: "caption", type: "string", title: "Caption" },
          ],
        },
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "featured",
      title: "Featured (homepage spotlight)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "metaTitle",
      title: "SEO title override",
      type: "string",
    }),
    defineField({
      name: "metaDescription",
      title: "SEO description override",
      type: "string",
    }),
    defineField({
      name: "readingTime",
      title: "Reading time (min)",
      type: "number",
    }),
  ],
  orderings: [
    { title: "Most recent", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", author: "author.name", media: "mainImage", kind: "kind" },
    prepare({ title, author, media, kind }) {
      return {
        title: title || "Untitled",
        subtitle: [kind, author && `by ${author}`].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
