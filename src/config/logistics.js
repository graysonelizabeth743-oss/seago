/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SEA GO · LOGISTICS DATA
 *  Ports, package sizes, containers, cargo types and pricing used by the quote
 *  calculator, the booking form and the route map. All prices are PLACEHOLDERS:
 *  replace them with your own rates.
 *
 *  To add a port you also need to say how ships reach it, in
 *  src/features/map/seaGraph.js → PORT_LINKS (then run `npm run validate:routes`).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Ports available for quoting and booking (UN/LOCODE). lat/lng place them on the map. */
export const ports = [
  // Africa
  { code: "NGLOS", name: "Lagos (Apapa)", country: "Nigeria", lat: 6.45, lng: 3.38 },
  { code: "NGPHC", name: "Port Harcourt (Onne)", country: "Nigeria", lat: 4.7, lng: 7.15 },
  { code: "GHTEM", name: "Tema", country: "Ghana", lat: 5.62, lng: 0.02 },
  { code: "SNDKR", name: "Dakar", country: "Senegal", lat: 14.68, lng: -17.43 },
  { code: "MAPTM", name: "Tangier Med", country: "Morocco", lat: 35.89, lng: -5.5 },
  { code: "AOLAD", name: "Luanda", country: "Angola", lat: -8.8, lng: 13.2 },
  { code: "ZACPT", name: "Cape Town", country: "South Africa", lat: -33.92, lng: 18.43 },
  { code: "ZADUR", name: "Durban", country: "South Africa", lat: -29.87, lng: 31.03 },
  { code: "TZDAR", name: "Dar es Salaam", country: "Tanzania", lat: -6.82, lng: 39.29 },
  { code: "KEMBA", name: "Mombasa", country: "Kenya", lat: -4.06, lng: 39.67 },
  { code: "DJJIB", name: "Djibouti", country: "Djibouti", lat: 11.6, lng: 43.15 },
  { code: "EGPSD", name: "Port Said", country: "Egypt", lat: 31.26, lng: 32.3 },
  // Europe
  { code: "NLRTM", name: "Rotterdam", country: "Netherlands", lat: 51.95, lng: 4.14 },
  { code: "BEANR", name: "Antwerp", country: "Belgium", lat: 51.26, lng: 4.4 },
  { code: "DEHAM", name: "Hamburg", country: "Germany", lat: 53.54, lng: 9.98 },
  { code: "GBFXT", name: "Felixstowe", country: "United Kingdom", lat: 51.96, lng: 1.35 },
  { code: "ESVLC", name: "Valencia", country: "Spain", lat: 39.45, lng: -0.32 },
  { code: "GRPIR", name: "Piraeus", country: "Greece", lat: 37.94, lng: 23.63 },
  // The Americas
  { code: "USNYC", name: "New York", country: "United States", lat: 40.67, lng: -74.04 },
  { code: "USLAX", name: "Los Angeles", country: "United States", lat: 33.74, lng: -118.27 },
  { code: "PAONX", name: "Colón", country: "Panama", lat: 9.36, lng: -79.9 },
  { code: "BRSSZ", name: "Santos", country: "Brazil", lat: -23.96, lng: -46.3 },
  { code: "ARBUE", name: "Buenos Aires", country: "Argentina", lat: -34.6, lng: -58.37 },
  // Middle East & Asia
  { code: "SAJED", name: "Jeddah", country: "Saudi Arabia", lat: 21.48, lng: 39.17 },
  { code: "AEJEA", name: "Jebel Ali", country: "United Arab Emirates", lat: 25.01, lng: 55.06 },
  { code: "PKKHI", name: "Karachi", country: "Pakistan", lat: 24.84, lng: 66.98 },
  { code: "INNSA", name: "Nhava Sheva", country: "India", lat: 18.95, lng: 72.95 },
  { code: "LKCMB", name: "Colombo", country: "Sri Lanka", lat: 6.94, lng: 79.85 },
  { code: "SGSIN", name: "Singapore", country: "Singapore", lat: 1.26, lng: 103.84 },
  { code: "MYPKG", name: "Port Klang", country: "Malaysia", lat: 3.0, lng: 101.39 },
  { code: "HKHKG", name: "Hong Kong", country: "Hong Kong", lat: 22.3, lng: 114.17 },
  { code: "CNSHA", name: "Shanghai", country: "China", lat: 31.23, lng: 121.47 },
  { code: "CNNGB", name: "Ningbo", country: "China", lat: 29.87, lng: 121.55 },
  { code: "KRPUS", name: "Busan", country: "South Korea", lat: 35.1, lng: 129.04 },
];

/* ── Shipment kinds ───────────────────────────────────────────────────────── */

export const shipmentKinds = [
  {
    code: "parcel",
    label: "Package",
    blurb: "Gifts, things you bought online, personal belongings and documents.",
    examples: "A birthday gift, a phone you ordered, a box of clothes",
  },
  {
    code: "cargo",
    label: "Cargo",
    blurb: "Full containers and commercial freight.",
    examples: "Pallets of goods, machinery, a 40ft container",
  },
];

/* ── Packages ─────────────────────────────────────────────────────────────── */

/** What is inside. `gift` unlocks the gift-message field. */
export const parcelContents = [
  { code: "gift", label: "A gift" },
  { code: "purchase", label: "Something I bought online" },
  { code: "personal", label: "Personal belongings" },
  { code: "clothing", label: "Clothing and shoes" },
  { code: "electronics", label: "Electronics" },
  { code: "food", label: "Non-perishable food" },
  { code: "documents", label: "Documents" },
  { code: "other", label: "Something else" },
];

/** Standard sizes (cm, length × width × height). `custom` lets the sender enter their own. */
export const parcelSizes = [
  { code: "envelope", label: "Envelope or documents", dims: [35, 25, 3], maxKg: 1, hint: "Up to 1 kg" },
  { code: "small", label: "Small box", dims: [30, 20, 15], maxKg: 5, hint: "Shoes, a phone, a couple of books" },
  { code: "medium", label: "Medium box", dims: [45, 35, 30], maxKg: 15, hint: "Clothes, a small appliance" },
  { code: "large", label: "Large box", dims: [60, 45, 40], maxKg: 30, hint: "A gift hamper, several items" },
  { code: "xlarge", label: "Extra large box", dims: [80, 60, 50], maxKg: 50, hint: "Bulky items" },
  { code: "custom", label: "My own size", dims: null, maxKg: 70, hint: "Enter length, width and height" },
];

export const parcelLimits = {
  maxKg: 70, // above this, book as cargo
  maxSideCm: 150,
  volumetricDivisor: 5000, // (L × W × H in cm) ÷ 5000 = volumetric kg; the larger of actual / volumetric is charged
};

/** Package pricing (USD). PLACEHOLDER VALUES. */
export const parcelPricing = {
  currency: "USD",
  baseFee: 22, // handling and documentation per package
  perKgPer1000Km: 1.6, // per chargeable kg for each 1,000 km of sea route
  minimum: 32,
  fragileSurcharge: 8,
  rangePercent: 0.12, // estimate is shown as ± this range
  cruiseKmPerDay: 560,
  handlingDays: 9, // consolidation, port handling and local delivery
  disclaimer:
    "Indicative estimate only. Your confirmed price is issued with your booking and can change if the weight or size differs from what you entered.",
};

/** What can't go in a package. Shown on the booking form. */
export const prohibitedItems =
  "Cash, weapons, batteries shipped loose, aerosols, flammable or perishable items, and anything illegal in the destination country.";

/* ── Cargo ────────────────────────────────────────────────────────────────── */

/** Equipment. `factor` multiplies the per-km rate relative to a 20ft standard box. */
export const containerTypes = [
  { code: "20GP", label: "20ft standard", factor: 1, capacityKg: 28000 },
  { code: "40GP", label: "40ft standard", factor: 1.6, capacityKg: 26500 },
  { code: "40HC", label: "40ft high-cube", factor: 1.75, capacityKg: 26500 },
  { code: "20RF", label: "20ft refrigerated", factor: 2.3, capacityKg: 27000 },
  { code: "40RF", label: "40ft refrigerated", factor: 3.1, capacityKg: 27000 },
];

export const cargoTypes = [
  { code: "general", label: "General cargo" },
  { code: "reefer", label: "Temperature-controlled" },
  { code: "dangerous", label: "Dangerous goods (contact us first)", contactFirst: true },
  { code: "oversized", label: "Oversized / heavy (contact us first)", contactFirst: true },
];

export const incoterms = ["EXW", "FCA", "FOB", "CFR", "CIF", "DAP", "DDP"];

/** Container pricing model (USD). PLACEHOLDER VALUES. */
export const pricing = {
  currency: "USD",
  baseFee: 450, // fixed handling and documentation per container
  perKm: 0.28, // per km of sea route for a 20ft standard container
  minimum: 900, // lowest estimate shown per container
  rangePercent: 0.12, // estimate is shown as ± this range
  cruiseKmPerDay: 560, // average sea speed used for transit time
  portDays: 7, // fixed days for loading, discharge and handling
  disclaimer:
    "Indicative estimate only. Your confirmed price is issued with your booking and may vary with cargo weight, surcharges and sailing dates.",
};
