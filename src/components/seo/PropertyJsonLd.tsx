import { useEffect } from "react";

interface PropertyJsonLdProps {
  properties: Array<{
    id: string;
    title: string;
    price: string;
    location: string;
    type: string;
    bedrooms?: number;
    bathrooms?: number;
    area: string;
    image?: string;
    images?: string[];
    listing_type?: string;
    description?: string;
  }>;
}

export const PropertyJsonLd = ({ properties }: PropertyJsonLdProps) => {
  useEffect(() => {
    const existingScript = document.getElementById("property-jsonld");
    if (existingScript) existingScript.remove();

    if (properties.length === 0) return;

    const listings = properties.slice(0, 20).map((p) => {
      const priceNum = parseInt(p.price.replace(/[^\d]/g, ""), 10) || 0;
      const imageUrl = p.images?.[0] || p.image || "";

      return {
        "@type": "RealEstateListing",
        name: p.title,
        description: p.description || `${p.type} property in ${p.location}`,
        url: `${window.location.origin}/discover?property=${p.id}`,
        image: imageUrl,
        address: {
          "@type": "PostalAddress",
          addressLocality: p.location,
          addressCountry: "KE",
        },
        offers: {
          "@type": "Offer",
          price: priceNum,
          priceCurrency: "KES",
          availability: "https://schema.org/InStock",
        },
        ...(p.bedrooms && { numberOfRooms: p.bedrooms }),
        ...(p.area && { floorSize: { "@type": "QuantitativeValue", value: p.area } }),
      };
    });

    const script = document.createElement("script");
    script.id = "property-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: listings.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item,
      })),
    });
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("property-jsonld");
      if (el) el.remove();
    };
  }, [properties]);

  return null;
};
