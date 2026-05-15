import { defineField, defineType } from "sanity";

export default defineType({
  name: "digestSubscriber",
  title: "Digest Subscriber",
  type: "document",
  fields: [
    defineField({ name: "email",           title: "Email",           type: "string", validation: (R) => R.required().email() }),
    defineField({ name: "watchlistTickers",title: "Watchlist tickers",type: "array", of: [{ type: "string" }] }),
    defineField({ name: "subscribedAt",    title: "Subscribed at",   type: "datetime" }),
    defineField({ name: "active",          title: "Active",          type: "boolean", initialValue: true }),
    defineField({ name: "source",          title: "Source",          type: "string", initialValue: "watchlist-page" }),
  ],
  preview: {
    select: { email: "email", active: "active" },
    prepare({ email, active }) {
      return { title: email, subtitle: active ? "Active" : "Unsubscribed" };
    },
  },
  orderings: [{ title: "Newest first", name: "subscribedAtDesc", by: [{ field: "subscribedAt", direction: "desc" }] }],
});
