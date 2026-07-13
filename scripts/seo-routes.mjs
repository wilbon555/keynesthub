export const BASE_URL = "https://www.keynesthub.com";

export const sitemapGroups = {
  pages: [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/discover", changefreq: "daily", priority: "0.9" },
    { path: "/about", changefreq: "monthly", priority: "0.6" },
    { path: "/install", changefreq: "monthly", priority: "0.4" },
  ],
  buy: [
    { path: "/buy/residential", changefreq: "daily", priority: "0.9" },
    { path: "/buy/commercial", changefreq: "daily", priority: "0.8" },
    { path: "/buy/land", changefreq: "daily", priority: "0.8" },
    { path: "/buy/new-developments", changefreq: "weekly", priority: "0.8" },
  ],
  rent: [
    { path: "/rent/apartments", changefreq: "daily", priority: "0.9" },
    { path: "/rent/houses", changefreq: "daily", priority: "0.8" },
    { path: "/rent/office-spaces", changefreq: "weekly", priority: "0.7" },
    { path: "/rent/short-term", changefreq: "weekly", priority: "0.7" },
  ],
  sell: [
    { path: "/sell/list-property", changefreq: "monthly", priority: "0.7" },
    { path: "/sell/pricing-plans", changefreq: "monthly", priority: "0.7" },
    { path: "/sell/agent-assistance", changefreq: "monthly", priority: "0.6" },
  ],
  agents: [
    { path: "/agents/find-agent", changefreq: "weekly", priority: "0.7" },
    { path: "/agents/directory", changefreq: "weekly", priority: "0.7" },
    { path: "/become-agent", changefreq: "monthly", priority: "0.6" },
  ],
  market: [
    { path: "/market/property-trends", changefreq: "weekly", priority: "0.7" },
    { path: "/investment-tips", changefreq: "monthly", priority: "0.6" },
    { path: "/mortgage-calculator", changefreq: "monthly", priority: "0.6" },
  ],
  neighborhoods: [
    { path: "/neighborhoods", changefreq: "weekly", priority: "0.7" },
  ],
};
