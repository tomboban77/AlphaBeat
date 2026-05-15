/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next-sitemap').IConfig} */
const { createClient } = require("@sanity/client");

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fny36h6v",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://alphabeat.io",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api", "/studio", "/studio/**", "/watchlist"],
      },
    ],
  },
  exclude: ["/api/*", "/studio", "/studio/**", "/watchlist"],

  additionalPaths: async () => {
    try {
      const [stockSlugs, briefSlugs, playbookSlugs, listSlugs] = await Promise.all([
        sanity.fetch(`*[_type == "stockFile" && defined(slug.current)][].slug.current`),
        sanity.fetch(`*[_type == "brief"      && defined(slug.current)][].slug.current`),
        sanity.fetch(`*[_type == "playbook"   && defined(slug.current)][].slug.current`),
        sanity.fetch(`*[_type == "rankedList" && defined(slug.current)][].slug.current`),
      ]);

      const paths = [
        ...stockSlugs.map((s)  => ({ loc: `/stocks/${s}`,    priority: 0.9, changefreq: "weekly" })),
        ...briefSlugs.map((s)  => ({ loc: `/brief/${s}`,     priority: 0.85, changefreq: "monthly" })),
        ...playbookSlugs.map((s) => ({ loc: `/playbooks/${s}`, priority: 0.8, changefreq: "monthly" })),
        ...listSlugs.map((s)   => ({ loc: `/best/${s}`,      priority: 0.8, changefreq: "monthly" })),
      ];

      return paths.map((p) => ({ ...p, lastmod: new Date().toISOString() }));
    } catch {
      return [];
    }
  },

  transform: async (config, path) => {
    let priority = config.priority;
    let changefreq = config.changefreq ?? "weekly";

    if (path === "/")                  { priority = 1.0; changefreq = "daily"; }
    else if (path === "/subscribe")    { priority = 0.97; }
    else if (path === "/brief")        { priority = 0.95; changefreq = "daily"; }
    else if (path === "/stocks")       { priority = 0.92; }
    else if (path === "/best")         { priority = 0.90; }
    else if (path === "/playbooks")    { priority = 0.88; }
    else if (path === "/methodology")  { priority = 0.80; }
    else if (path === "/about")        { priority = 0.60; changefreq = "monthly"; }
    else if (path === "/disclaimer" || path === "/privacy-policy") {
      priority = 0.40; changefreq = "monthly";
    }

    return { loc: path, changefreq, priority, lastmod: new Date().toISOString() };
  },
};
