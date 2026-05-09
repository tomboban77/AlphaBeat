import { defineField, defineType } from "sanity";

export default defineType({
  name: "sponsorship",
  title: "Sponsorship",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Internal name",
      type: "string",
      description: 'For your own reference — e.g. "Acme Corp Q2 2026"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sponsorName",
      title: "Sponsor name (public)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sponsorLogo",
      title: "Sponsor logo",
      type: "image",
    }),
    defineField({
      name: "ticker",
      title: "Sponsored ticker",
      type: "string",
      description: "Ticker the sponsor is promoting (must match a `stock` document if you want it linked).",
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA label",
      type: "string",
      initialValue: "Learn more",
    }),
    defineField({
      name: "ctaUrl",
      title: "CTA URL",
      type: "url",
    }),
    defineField({
      name: "disclosure",
      title: "Disclosure text",
      type: "text",
      rows: 3,
      description:
        "Required. Plain-language statement that this is paid placement. Shown adjacent to sponsored content.",
      initialValue:
        "This placement is sponsored. The sponsor has paid AlphaBeat for visibility. It is not investment advice or an endorsement of the security.",
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      type: "date",
    }),
    defineField({
      name: "endDate",
      title: "End date",
      type: "date",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "name", sponsor: "sponsorName", ticker: "ticker", active: "active" },
    prepare({ title, sponsor, ticker, active }) {
      return {
        title: title || "Sponsorship",
        subtitle: `${sponsor || ""}${ticker ? ` · ${ticker}` : ""} · ${active ? "active" : "paused"}`,
      };
    },
  },
});
