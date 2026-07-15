// Curated Kenyan neighborhood hubs used by the property map data layer.
// Coordinates are approximate centroids sourced from OpenStreetMap.
export interface NeighborhoodPoint {
  slug: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  avgPrice: string;
  safety: "Excellent" | "Very Good" | "Good" | "Fair";
  highlights: string[];
  schools: string[];
  transport: string[];
}

export const NEIGHBORHOODS: NeighborhoodPoint[] = [
  {
    slug: "nairobi-westlands",
    name: "Westlands",
    region: "Nairobi",
    lat: -1.2676,
    lng: 36.8108,
    avgPrice: "Ksh 8M – 45M",
    safety: "Excellent",
    highlights: ["Business district", "Malls & dining", "Serviced apartments"],
    schools: ["Aga Khan High", "Brookhouse", "Westlands Primary"],
    transport: ["Westlands BRT", "Matatu 23/46", "15 min to CBD"],
  },
  {
    slug: "nairobi-kilimani",
    name: "Kilimani",
    region: "Nairobi",
    lat: -1.2921,
    lng: 36.7856,
    avgPrice: "Ksh 6M – 30M",
    safety: "Very Good",
    highlights: ["Apartments", "Yaya Centre", "Embassies"],
    schools: ["Kilimani Primary", "State House Girls"],
    transport: ["Ngong Rd matatus", "Bus stops on Argwings Kodhek"],
  },
  {
    slug: "nairobi-karen",
    name: "Karen",
    region: "Nairobi",
    lat: -1.3197,
    lng: 36.7076,
    avgPrice: "Ksh 25M – 200M",
    safety: "Excellent",
    highlights: ["Leafy suburb", "Large plots", "Equestrian"],
    schools: ["Brookhouse Karen", "Hillcrest", "Banda School"],
    transport: ["Southern Bypass", "Karen matatu terminus"],
  },
  {
    slug: "nairobi-lavington",
    name: "Lavington",
    region: "Nairobi",
    lat: -1.2794,
    lng: 36.7686,
    avgPrice: "Ksh 15M – 70M",
    safety: "Excellent",
    highlights: ["Family homes", "Malls", "Quiet streets"],
    schools: ["Braeburn", "St Mary's School"],
    transport: ["James Gichuru matatus"],
  },
  {
    slug: "nairobi-kileleshwa",
    name: "Kileleshwa",
    region: "Nairobi",
    lat: -1.2833,
    lng: 36.7833,
    avgPrice: "Ksh 10M – 40M",
    safety: "Very Good",
    highlights: ["Apartments", "Central", "Diplomatic"],
    schools: ["Kileleshwa Primary"],
    transport: ["Matatu 111", "Easy Ring Rd access"],
  },
  {
    slug: "nairobi-runda",
    name: "Runda",
    region: "Nairobi",
    lat: -1.2144,
    lng: 36.8419,
    avgPrice: "Ksh 40M – 300M",
    safety: "Excellent",
    highlights: ["Gated", "Ambassadorial", "Large villas"],
    schools: ["ISK", "Rosslyn Academy"],
    transport: ["Northern Bypass", "Thika Rd access"],
  },
  {
    slug: "nairobi-kasarani",
    name: "Kasarani",
    region: "Nairobi",
    lat: -1.2231,
    lng: 36.8975,
    avgPrice: "Ksh 3M – 12M",
    safety: "Good",
    highlights: ["Affordable", "Stadium", "Fast growth"],
    schools: ["Kasarani Primary", "Ruaraka Academy"],
    transport: ["Thika Superhighway", "Matatu 17B/45"],
  },
  {
    slug: "nairobi-ruiru",
    name: "Ruiru",
    region: "Kiambu",
    lat: -1.1454,
    lng: 36.9631,
    avgPrice: "Ksh 4M – 18M",
    safety: "Good",
    highlights: ["Gated estates", "Rapid growth", "Commuter town"],
    schools: ["Kenyatta University", "Ruiru Primary"],
    transport: ["Thika Superhighway", "Ruiru SGR station"],
  },
  {
    slug: "nairobi-syokimau",
    name: "Syokimau",
    region: "Machakos",
    lat: -1.3667,
    lng: 36.9500,
    avgPrice: "Ksh 5M – 20M",
    safety: "Good",
    highlights: ["Airport access", "SGR", "New estates"],
    schools: ["Syokimau Academy"],
    transport: ["SGR Nairobi Terminus", "Mombasa Rd matatus"],
  },
  {
    slug: "nairobi-cbd",
    name: "Nairobi CBD",
    region: "Nairobi",
    lat: -1.2864,
    lng: 36.8172,
    avgPrice: "Ksh 5M – 25M",
    safety: "Fair",
    highlights: ["Commercial", "Transit hub", "Offices"],
    schools: ["Nairobi Primary"],
    transport: ["All matatu termini", "Nairobi Rail"],
  },
  {
    slug: "mombasa-nyali",
    name: "Nyali",
    region: "Mombasa",
    lat: -4.0186,
    lng: 39.7076,
    avgPrice: "Ksh 10M – 60M",
    safety: "Excellent",
    highlights: ["Beachfront", "Luxury villas", "Tourism"],
    schools: ["Nyali International Academy", "Aga Khan Mombasa"],
    transport: ["Nyali Bridge", "Matatu to CBD"],
  },
  {
    slug: "kisumu-cbd",
    name: "Kisumu CBD",
    region: "Kisumu",
    lat: -0.0917,
    lng: 34.7680,
    avgPrice: "Ksh 3.5M – 15M",
    safety: "Good",
    highlights: ["Lakefront", "Commercial", "Airport nearby"],
    schools: ["Kisumu Boys", "Aga Khan Academy"],
    transport: ["Main bus terminus", "Kisumu Airport 20 min"],
  },
  {
    slug: "nakuru-milimani",
    name: "Nakuru Milimani",
    region: "Nakuru",
    lat: -0.3031,
    lng: 36.0800,
    avgPrice: "Ksh 5M – 25M",
    safety: "Very Good",
    highlights: ["Serene", "Near Lake Nakuru", "New city"],
    schools: ["Nakuru High", "Greensteds International"],
    transport: ["A104 Highway", "SGR to Nairobi"],
  },
];

// Average travel speed in km/h in Kenyan urban traffic. Used with a 1.3x
// detour factor to convert straight-line distance into an honest commute
// estimate without external routing APIs.
export const COMMUTE_MODES = {
  drive: { label: "Driving", speedKmh: 25, icon: "🚗" },
  matatu: { label: "Matatu", speedKmh: 18, icon: "🚐" },
  walk: { label: "Walking", speedKmh: 5, icon: "🚶" },
} as const;

export type CommuteMode = keyof typeof COMMUTE_MODES;

export const DETOUR_FACTOR = 1.3;

export function estimateCommuteMinutes(
  distanceKm: number,
  mode: CommuteMode
): number {
  const speed = COMMUTE_MODES[mode].speedKmh;
  return Math.round(((distanceKm * DETOUR_FACTOR) / speed) * 60);
}