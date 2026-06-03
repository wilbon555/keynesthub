import { useEffect } from "react";

interface PageHeadProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const setMeta = (attr: string, key: string, content: string) => {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export const PageHead = ({
  title,
  description = "Discover premium properties, land, and real estate opportunities in Kenya with KeyNestHub.",
  canonical,
  ogImage = "https://www.keynesthub.com/pwa-512x512.png",
  ogType = "website",
  noIndex = false,
}: PageHeadProps) => {
  const fullTitle = title.includes("KeyNestHub") ? title : `${title} | KeyNestHub`;
  const url = canonical || window.location.href;

  useEffect(() => {
    document.title = fullTitle;
    setMeta("name", "description", description);

    if (noIndex) setMeta("name", "robots", "noindex,nofollow");

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", "KeyNestHub");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    } else if (link) {
      link.remove();
    }
  }, [fullTitle, description, canonical, ogImage, ogType, noIndex, url]);

  return null;
};
