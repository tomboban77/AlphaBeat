import { defineField, defineType } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "color",
      title: "Badge Color",
      type: "string",
      description: "Tailwind color name (e.g. green, blue, purple)",
      options: {
        list: [
          { title: "Green", value: "green" },
          { title: "Blue", value: "blue" },
          { title: "Purple", value: "purple" },
          { title: "Amber", value: "amber" },
          { title: "Teal", value: "teal" },
          { title: "Red", value: "red" },
          { title: "Orange", value: "orange" },
          { title: "Pink", value: "pink" },
        ],
      },
    }),
    defineField({
      name: "icon",
      title: "Icon (Emoji)",
      type: "string",
      description: "Emoji icon for the category",
    }),
  ],
});
