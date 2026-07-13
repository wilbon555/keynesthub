import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { BASE_URL, sitemapGroups } from "./seo-routes.mjs";

const PUBLIC_DIR = resolve("public");
const LASTMOD = new Date().toISOString().slice(0, 10);
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://tyhcmtdppcxslyzfuqvk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InR5aGNtdGRwcGN4c2x5emZ1cXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3Mjk0MDEsImV4cCI6MjA3MDMwNTQwMX0.xP7K2FYmTaTqb7INL-dBag6yP6ey6s8xv2w4aSLQJdU";

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const renderUrlset = (entries) => [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map((entry) => [
    `  <url>`,
    `    <loc>${escapeXml(`${BASE_URL}${entry.path}`)}</loc>`,
    entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
    entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
    entry.priority ? `    <priority>${entry.priority}</priority>` : null,
    `  </url>`,
  ].filter(Boolean).join("\n")),
  `</urlset>`,
  "",
].join("\n");

const fetchVerifiedProperties = async () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  const endpoint = new URL("/rest/v1/properties", SUPABASE_URL);
  endpoint.searchParams.set("select", "id,updated_at,created_at");
  endpoint.searchParams.set("status", "eq.available");
  endpoint.searchParams.set("verification_status", "eq.verified");
  endpoint.searchParams.set("order", "updated_at.desc");
  endpoint.searchParams.set("limit", "5000");

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      console.warn(`Skipping property sitemap: Supabase returned ${response.status}`);
      return [];
    }

    const rows = await response.json();
    return Array.isArray(rows)
      ? rows.map((row) => ({
          path: `/property/${row.id}`,
          lastmod: (row.updated_at || row.created_at || LASTMOD).slice(0, 10),
          changefreq: "weekly",
          priority: "0.8",
        }))
      : [];
  } catch (error) {
    console.warn(`Skipping property sitemap: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
};

mkdirSync(PUBLIC_DIR, { recursive: true });

const groups = { ...sitemapGroups };
const propertyEntries = await fetchVerifiedProperties();
if (propertyEntries.length > 0) {
  groups.properties = propertyEntries;
}

for (const [groupName, entries] of Object.entries(groups)) {
  writeFileSync(resolve(PUBLIC_DIR, `sitemap-${groupName}.xml`), renderUrlset(entries));
}

const sitemapIndex = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...Object.keys(groups).map(
    (groupName) => `  <sitemap><loc>${BASE_URL}/sitemap-${groupName}.xml</loc><lastmod>${LASTMOD}</lastmod></sitemap>`,
  ),
  `</sitemapindex>`,
  "",
].join("\n");

writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), sitemapIndex);

writeFileSync(resolve(PUBLIC_DIR, "robots.txt"), [
  "# Search engines",
  "User-agent: Googlebot",
  "Allow: /",
  "",
  "User-agent: Googlebot-Image",
  "Allow: /",
  "",
  "User-agent: Bingbot",
  "Allow: /",
  "",
  "User-agent: DuckDuckBot",
  "Allow: /",
  "",
  "# Social media crawlers",
  "User-agent: Twitterbot",
  "Allow: /",
  "",
  "User-agent: facebookexternalhit",
  "Allow: /",
  "",
  "User-agent: LinkedInBot",
  "Allow: /",
  "",
  "# AI crawlers",
  "User-agent: GPTBot",
  "Allow: /",
  "",
  "User-agent: ChatGPT-User",
  "Allow: /",
  "",
  "User-agent: OAI-SearchBot",
  "Allow: /",
  "",
  "User-agent: ClaudeBot",
  "Allow: /",
  "",
  "User-agent: PerplexityBot",
  "Allow: /",
  "",
  "# Default: allow all other bots",
  "User-agent: *",
  "Allow: /",
  "",
  `Sitemap: ${BASE_URL}/sitemap.xml`,
  "",
].join("\n"));

writeFileSync(resolve(PUBLIC_DIR, ".nojekyll"), "");
console.log(`SEO files generated (${Object.keys(groups).length} sitemap files, ${propertyEntries.length} properties)`);
