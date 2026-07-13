import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to ensure static SEO files are NOT processed by build system
const copySeoFiles = () => ({
  name: "copy-seo-files",
  apply: "build",
  enforce: "post",
  writeBundle() {
    const publicDir = path.resolve(__dirname, "public");
    const distDir = path.resolve(__dirname, "dist");

    // Ensure dist exists
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Critical SEO files that MUST be in dist root
    const seoFiles = [
      "sitemap.xml",
      "sitemap-pages.xml",
      "sitemap-buy.xml",
      "sitemap-sell.xml",
      "sitemap-rent.xml",
      "sitemap-agents.xml",
      "sitemap-market.xml",
      "sitemap-neighborhoods.xml",
      "sitemap-properties.xml",
      "robots.txt",
      "CNAME",
      ".nojekyll", // Prevent GitHub Pages processing
    ];

    seoFiles.forEach((file) => {
      const src = path.join(publicDir, file);
      if (fs.existsSync(src)) {
        const dest = path.join(distDir, file);
        fs.copyFileSync(src, dest);
        console.log(`✓ Copied ${file} to dist/`);
      }
    });

    // Also copy _redirects if it exists
    const redirectsSrc = path.join(__dirname, "_redirects");
    if (fs.existsSync(redirectsSrc)) {
      const redirectsDest = path.join(distDir, "_redirects");
      fs.copyFileSync(redirectsSrc, redirectsDest);
      console.log("✓ Copied _redirects to dist/");
    }
  },
});

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    // Ensure local dev can access SEO files
    fs: {
      allow: [".", "public"],
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pwa-512x512.png", "pwa-192x192.png"],
      manifest: {
        name: "KeyNestHub - Premium Real Estate Platform",
        short_name: "KeyNestHub",
        description:
          "Find your perfect property with KeyNestHub - Buy, sell, and rent residential and commercial properties with ease.",
        theme_color: "#1a365d",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}",
        ],
        // Explicitly exclude SEO files from service worker cache
        globIgnores: [
          "**/sitemap*.xml",
          "**/robots.txt",
          "**/CNAME",
          "**/.nojekyll",
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
    copySeoFiles(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    // CRITICAL: Ensure public directory is copied as-is
    copyPublicDir: true,
    // Ensure proper output structure
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Preserve asset file names exactly
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.match(/\.(xml|txt|map)$/)) {
            return "[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
}));