import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://keynesthub.com";

function escapeXml(unsafe: string): string {
  return (unsafe ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, title, description, price, location, type, listing_type, image, images, created_at")
      .eq("status", "available")
      .eq("verification_status", "verified")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const now = new Date().toUTCString();
    const items = (properties ?? [])
      .map((p) => {
        const link = `${SITE_URL}/property/${p.id}`;
        const pubDate = p.created_at ? new Date(p.created_at).toUTCString() : now;
        const img = p.images?.[0] || p.image || "";
        const desc = `${p.description ?? ""}\n\nPrice: ${p.price}\nLocation: ${p.location}\nType: ${p.type}${p.listing_type ? ` (${p.listing_type})` : ""}`;
        return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(desc)}</description>
      ${img ? `<enclosure url="${escapeXml(img)}" type="image/jpeg" />` : ""}
      <category>${escapeXml(p.type ?? "property")}</category>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KeyNestHub - New Property Listings</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Latest verified properties for sale and rent in Kenya from KeyNestHub.</description>
    <language>en-ke</language>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=900",
      },
    });
  } catch (e) {
    return new Response(`<?xml version="1.0"?><error>${escapeXml(String(e))}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});