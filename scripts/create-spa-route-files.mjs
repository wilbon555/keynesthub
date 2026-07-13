import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_URL } from "./seo-routes.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(rootDir, "public");
const distDir = resolve(rootDir, "dist");
const distIndexPath = resolve(distDir, "index.html");
const dist404Path = resolve(distDir, "404.html");

if (!existsSync(distIndexPath)) {
  throw new Error("dist/index.html does not exist. Run this script after vite build.");
}

const baseHtml = readFileSync(distIndexPath, "utf8");
const sitemapFiles = readdirSync(publicDir).filter((file) => /^sitemap-.+\.xml$/.test(file));
const routes = new Set();

for (const file of sitemapFiles) {
  const xml = readFileSync(resolve(publicDir, file), "utf8");
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const loc = match[1].trim();
    if (!loc.startsWith(BASE_URL)) continue;
    const path = new URL(loc).pathname;
    if (path === "/" || /\.[a-z0-9]+$/i.test(path)) continue;
    routes.add(path);
  }
}

const pageHtml = (routePath) => {
  const canonicalUrl = `${BASE_URL}${routePath}`;
  return baseHtml
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonicalUrl}" />`);
};

for (const routePath of routes) {
  const routeIndexPath = resolve(distDir, routePath.slice(1), "index.html");
  mkdirSync(dirname(routeIndexPath), { recursive: true });
  writeFileSync(routeIndexPath, pageHtml(routePath));
}

writeFileSync(dist404Path, baseHtml);
console.log(`SPA route files generated (${routes.size} routes) and 404.html refreshed`);
