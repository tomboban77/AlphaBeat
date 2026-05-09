import { defineField, defineType } from "sanity";

export default defineType({
  name: "sector",
  title: "Sector",
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
      options: { source: "title", maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "One line shown on sector cards.",
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: "description",
      title: "Long description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "icon",
      title: "Icon (lucide name or emoji)",
      type: "string",
      description: 'Lucide icon name like "cpu", "battery", "heart-pulse", or an emoji. Falls back to a default if blank.',
    }),
    defineField({
      name: "accent",
      title: "Accent color",
      type: "string",
      options: {
        list: [
          { title: "Cyan (default)", value: "cyan" },
          { title: "Emerald", value: "emerald" },
          { title: "Violet", value: "violet" },
          { title: "Amber", value: "amber" },
          { title: "Rose", value: "rose" },
          { title: "Sky", value: "sky" },
          { title: "Lime", value: "lime" },
          { title: "Fuchsia", value: "fuchsia" },
        ],
      },
      initialValue: "cyan",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      initialValue: 100,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "tagline", media: "heroImage" },
  },
});
