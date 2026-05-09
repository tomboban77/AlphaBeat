import { defineField, defineType } from "sanity";

/**
 * Editor's daily market note: a short, opinionated narrative that ties
 * today's macro headlines (wars, commodity moves, rate decisions, earnings,
 * etc.) to the sectors and stocks that should benefit or suffer.
 *
 * On the /pulse page this sits ABOVE the quantitative sector heat-map and
 * news stream, giving readers an editor-led "so what" interpretation of the
 * day's data. When no note has been published in the last 24 hours, the
 * page hides this section and lets the quant data speak for itself.
 */
export default defineType({
  name: "marketNote",
  title: "Market Note (daily)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Headline",
      type: "string",
      description:
        'Short, declarative. e.g. "Energy spikes on Mideast tension" or "Cooling CPI lifts long-duration tech".',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      description:
        "When this note was issued. Notes published within the last 24 hours show on /pulse and the homepage widget.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "regime",
      title: "Editor's regime call",
      type: "string",
      description:
        "Your read of the broader market mood today, used to override the auto-computed regime banner if you disagree with it.",
      options: {
        list: [
          { title: "Risk-on", value: "risk-on" },
          { title: "Mixed / choppy", value: "mixed" },
          { title: "Risk-off", value: "risk-off" },
          { title: "Auto (use computed)", value: "auto" },
        ],
        layout: "radio",
      },
      initialValue: "auto",
    }),
    defineField({
      name: "themes",
      title: "Themes driving today's move",
      type: "array",
      description:
        "What is the news actually about? Pick all that apply.",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
        list: [
          { title: "Geopolitics / war", value: "geopolitics" },
          { title: "Commodities (oil, gold, copper)", value: "commodities" },
          { title: "Inflation / CPI", value: "inflation" },
          { title: "Interest rates / Fed", value: "rates" },
          { title: "Earnings / guidance", value: "earnings" },
          { title: "Macro data (jobs, GDP)", value: "macro" },
          { title: "Tech / AI cycle", value: "ai" },
          { title: "Regulation / policy", value: "regulation" },
          { title: "Currency / FX", value: "currency" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "summary",
      title: "One-line summary",
      type: "string",
      description:
        'The single sentence shown on the homepage widget. e.g. "Tech leading on dovish Fed read; energy heavy as crude slips below $80."',
      validation: (Rule) => Rule.required().max(180),
    }),
    defineField({
      name: "body",
      title: "Body (1-3 short paragraphs)",
      type: "array",
      description:
        "The full editorial reasoning. Keep it tight — readers came for the call, not a thesis.",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                title: "URL",
                name: "link",
                type: "object",
                fields: [
                  { title: "URL", name: "href", type: "url" },
                  {
                    title: "New tab",
                    name: "blank",
                    type: "boolean",
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "sectorReads",
      title: "Sector reads",
      type: "array",
      description:
        'Which sectors should benefit or suffer if the editor\u2019s read plays out, and a one-line "why".',
      of: [
        {
          type: "object",
          name: "sectorRead",
          title: "Sector read",
          fields: [
            defineField({
              name: "sector",
              title: "Sector",
              type: "reference",
              to: [{ type: "sector" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "direction",
              title: "Direction",
              type: "string",
              options: {
                list: [
                  { title: "Tailwind (positive)", value: "tailwind" },
                  { title: "Headwind (negative)", value: "headwind" },
                  { title: "Neutral / watch", value: "neutral" },
                ],
                layout: "radio",
              },
              initialValue: "tailwind",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "rationale",
              title: "One-line rationale",
              type: "string",
              validation: (Rule) => Rule.required().max(200),
            }),
          ],
          preview: {
            select: {
              title: "sector.title",
              dir: "direction",
              sub: "rationale",
            },
            prepare({ title, dir, sub }) {
              const arrow =
                dir === "tailwind" ? "+" : dir === "headwind" ? "-" : "=";
              return {
                title: `${arrow} ${title || "Untitled sector"}`,
                subtitle: sub,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "stockMentions",
      title: "Stocks worth watching",
      type: "array",
      description:
        "Optional: specific tickers in our universe that the editor wants surfaced today.",
      of: [{ type: "reference", to: [{ type: "stock" }] }],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "pinned",
      title: "Pin to /pulse",
      type: "boolean",
      description:
        "If on, this note shows on /pulse even after 24 hours. Use sparingly \u2014 only for major events.",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Most recent",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      summary: "summary",
      published: "publishedAt",
    },
    prepare({ title, summary, published }) {
      const date = published
        ? new Date(published).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Unpublished";
      return {
        title: title || "Untitled note",
        subtitle: [date, summary].filter(Boolean).join(" \u2014 "),
      };
    },
  },
});
