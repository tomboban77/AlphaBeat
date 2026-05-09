import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      initialValue: "AlphaBeat",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      initialValue: "The investing platform for stocks worth watching.",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
    }),
    defineField({
      name: "defaultOgImage",
      title: "Default OG image",
      type: "image",
    }),
    defineField({
      name: "googleAnalyticsId",
      title: "Google Analytics ID",
      type: "string",
      description: "G-XXXXXXXXXX",
    }),
    defineField({
      name: "adsensePublisherId",
      title: "AdSense publisher ID",
      type: "string",
      description: "ca-pub-XXXXXXXXXXXXXXXX",
    }),
    defineField({
      name: "marketTickerSymbols",
      title: "Market ticker symbols (top bar)",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        'Tickers to show in the top scrolling ticker. Use Finnhub format — e.g. "AAPL", "MSFT", "^GSPC", "^IXIC", "TSE:RY" or "RY.TO" (we will normalize).',
      initialValue: [
        "^GSPC",
        "^IXIC",
        "^DJI",
        "^GSPTSE",
        "AAPL",
        "MSFT",
        "NVDA",
        "GOOGL",
        "AMZN",
        "TSLA",
        "SHOP.TO",
        "RY.TO",
      ],
    }),
    defineField({
      name: "footerText",
      title: "Footer text",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "disclaimerText",
      title: "Site-wide disclaimer text",
      type: "text",
      rows: 4,
      initialValue:
        "AlphaBeat content is for educational purposes only. Nothing on this site is investment advice or a recommendation to buy, sell, or hold any security. Always do your own research and consult a qualified advisor.",
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
