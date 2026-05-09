/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://alphabeat.io",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "daily",
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api", "/studio", "/watchlist"],
      },
    ],
  },
  exclude: ["/api/*", "/studio", "/studio/**", "/watchlist"],
  transform: async (config, path) => {
    // Boost priority of money pages
    let priority = config.priority;
    if (path === "/") priority = 1.0;
    else if (path === "/hidden-gems" || path.startsWith("/weekly-picks")) priority = 0.95;
    else if (path.startsWith("/top")) priority = 0.9;
    else if (path.startsWith("/stocks/") || path.startsWith("/etfs/")) priority = 0.9;
    else if (
      path === "/stocks" ||
      path === "/etfs" ||
      path === "/sectors" ||
      path === "/insights"
    )
      priority = 0.85;
    return {
      loc: path,
      changefreq: config.changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
