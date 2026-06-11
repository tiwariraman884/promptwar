// Emission factors (kg CO2e per unit) — source: IPCC AR6 / GHG Protocol
export const EMISSION_FACTORS = {
  // Transport (per km)
  car_petrol: 0.192,
  car_diesel: 0.171,
  car_electric: 0.053,
  bus: 0.089,
  train: 0.041,
  flight_short: 0.255,   // <3hr
  flight_long: 0.195,    // >6hr
  motorbike: 0.114,

  // Energy (per kWh)
  electricity_grid: 0.233,
  natural_gas: 0.202,
  coal: 0.820,
  solar: 0.041,
  wind: 0.011,

  // Food (per kg)
  beef: 27.0,
  lamb: 39.2,
  pork: 12.1,
  chicken: 6.9,
  fish: 6.1,
  dairy: 3.2,
  eggs: 4.8,
  vegetables: 2.0,
  fruits: 1.1,
  legumes: 0.9,
  rice: 2.7,

  // Shopping (per item approx)
  clothing_item: 15.0,
  electronics_phone: 70.0,
  electronics_laptop: 300.0,
  furniture_item: 45.0,
};

export const GLOBAL_AVERAGE_FOOTPRINT_KG = 4000; // 4 tonnes CO2e/year per person
export const INDIA_AVERAGE_FOOTPRINT_KG = 1900;
export const PARIS_TARGET_KG = 2300; // 2.3 tonnes/year by 2030

export const CO2_EQUIVALENTS = {
  // What 1 kg CO2e equals:
  tree_days: 0.06,        // days for 1 tree to absorb
  driving_km: 5.2,        // km in petrol car
  smartphone_charges: 122, // full phone charges
  led_bulb_hours: 200,    // hours of LED light
};

export const OFFSET_PROJECTS = [
  {
    id: "reforestation-india",
    name: "Reforestation — Western Ghats",
    location: "Karnataka, India",
    pricePerTonne: 8.5,
    type: "forestry",
    verified: "Gold Standard",
    description: "Restores native forest on degraded land across 2,400 hectares in the Western Ghats biodiversity hotspot.",
    co2PerYear: 12400,
    rating: 4.8,
    image: "🌳",
  },
  {
    id: "solar-rajasthan",
    name: "Solar Energy — Rural Rajasthan",
    location: "Rajasthan, India",
    pricePerTonne: 6.0,
    type: "renewable_energy",
    verified: "Verra VCS",
    description: "Installs solar microgrids replacing diesel generators in 120 off-grid villages, providing clean energy to 40,000 people.",
    co2PerYear: 8900,
    rating: 4.6,
    image: "☀️",
  },
  {
    id: "mangrove-gujarat",
    name: "Mangrove Restoration — Gulf of Kutch",
    location: "Gujarat, India",
    pricePerTonne: 11.0,
    type: "blue_carbon",
    verified: "Gold Standard",
    description: "Restores mangrove ecosystems that sequester carbon at 5× the rate of tropical forests while protecting coastlines.",
    co2PerYear: 5600,
    rating: 4.9,
    image: "🌊",
  },
  {
    id: "biochar-mp",
    name: "Biochar — Agricultural Waste",
    location: "Madhya Pradesh, India",
    pricePerTonne: 14.0,
    type: "soil_carbon",
    verified: "Puro Earth",
    description: "Converts crop residue into biochar, locking carbon in soil for 1,000+ years while improving soil fertility for farmers.",
    co2PerYear: 3200,
    rating: 4.7,
    image: "🪵",
  },
];

export const ECO_PRODUCTS = [
  {
    id: "bamboo-toothbrush",
    name: "Bamboo Toothbrush Pack (4)",
    category: "Personal Care",
    co2Saved: 0.18,
    price: 249,
    currency: "₹",
    rating: 4.5,
    badge: "Plastic-free",
    description: "Biodegradable bamboo handle, BPA-free bristles. Replaces 4 plastic toothbrushes.",
  },
  {
    id: "beeswax-wraps",
    name: "Beeswax Food Wraps (3 pack)",
    category: "Kitchen",
    co2Saved: 1.2,
    price: 599,
    currency: "₹",
    rating: 4.7,
    badge: "Zero waste",
    description: "Replaces up to 200m of cling film per wrap. Washable, reusable, compostable.",
  },
  {
    id: "solar-lantern",
    name: "Solar Lantern",
    category: "Energy",
    co2Saved: 18.4,
    price: 1299,
    currency: "₹",
    rating: 4.8,
    badge: "Off-grid",
    description: "Replaces kerosene/candle use. 8hr light per charge. Saves ~18 kg CO2/year.",
  },
  {
    id: "cloth-tote-bag",
    name: "Organic Cotton Tote (3 pack)",
    category: "Lifestyle",
    co2Saved: 2.1,
    price: 349,
    currency: "₹",
    rating: 4.6,
    badge: "Reusable",
    description: "Replaces ~500 plastic bags per bag per year. GOTS certified organic cotton.",
  },
  {
    id: "reusable-bottle",
    name: "Stainless Steel Water Bottle 1L",
    category: "Lifestyle",
    co2Saved: 4.8,
    price: 899,
    currency: "₹",
    rating: 4.9,
    badge: "BPA-free",
    description: "Eliminates ~150 plastic bottles/year per person. Keeps drinks hot/cold 24hr.",
  },
  {
    id: "led-strip",
    name: "LED Bulb Set (4 pack, 9W)",
    category: "Energy",
    co2Saved: 42.0,
    price: 699,
    currency: "₹",
    rating: 4.7,
    badge: "Energy star",
    description: "Replaces 4 incandescent 60W bulbs. Saves up to 42 kg CO2/year across all 4 bulbs.",
  },
];

export const GREEN_MAP_LOCATIONS = [
  { id: 1, name: "EV Charging Station — Connaught Place", type: "ev_charging", lat: 28.6315, lng: 77.2167, city: "Delhi" },
  { id: 2, name: "Metro Station — Rajiv Chowk", type: "public_transit", lat: 28.6328, lng: 77.2197, city: "Delhi" },
  { id: 3, name: "Community Composting Hub — Lajpat Nagar", type: "composting", lat: 28.5677, lng: 77.2433, city: "Delhi" },
  { id: 4, name: "Eco Store — Hauz Khas Village", type: "eco_store", lat: 28.5494, lng: 77.2001, city: "Delhi" },
  { id: 5, name: "Urban Rooftop Garden — Vasant Vihar", type: "urban_garden", lat: 28.5571, lng: 77.1588, city: "Delhi" },
  { id: 6, name: "Solar Rooftop Facility — BKC", type: "solar_facility", lat: 19.0596, lng: 72.8656, city: "Mumbai" },
  { id: 7, name: "EV Charging — Juhu", type: "ev_charging", lat: 19.1075, lng: 72.8263, city: "Mumbai" },
  { id: 8, name: "Recycling Center — Dharavi", type: "recycling", lat: 19.0420, lng: 72.8570, city: "Mumbai" },
];

export const AI_COACH_TIPS = [
  { category: "transport", tip: "Switching from a petrol car to public transport for a 10 km daily commute saves ~430 kg CO2/year — equivalent to planting 20 trees.", saving_kg: 430 },
  { category: "food", tip: "Reducing beef consumption by 1 meal per week saves ~100 kg CO2/year. Try lentils or chickpeas as a protein swap.", saving_kg: 100 },
  { category: "energy", tip: "Setting your AC to 24°C instead of 18°C cuts electricity use by ~24% and saves roughly 80 kg CO2/year.", saving_kg: 80 },
  { category: "shopping", tip: "Buying one fewer fast-fashion item per month saves ~180 kg CO2/year. Choose second-hand or brands with verified sustainability claims.", saving_kg: 180 },
  { category: "food", tip: "Wasted food accounts for ~8% of global emissions. Meal planning and using leftovers could cut ~60 kg CO2/year from your footprint.", saving_kg: 60 },
  { category: "energy", tip: "Unplugging devices on standby can save 65–100 kWh/year — equivalent to ~15 kg CO2 at India's average grid intensity.", saving_kg: 15 },
  { category: "transport", tip: "One transatlantic flight adds ~1,600 kg CO2 to your footprint. Consider train or bus for domestic journeys under 600 km.", saving_kg: 1600 },
  { category: "water", tip: "Reducing shower time from 15 to 7 minutes saves ~150 litres/day and ~20 kg CO2/year (water heating energy).", saving_kg: 20 },
];

export const REPORT_BENCHMARKS = {
  global_avg: 4000,
  india_avg: 1900,
  paris_2030: 2300,
  low_carbon_lifestyle: 1000,
};

export const GROUP_CHALLENGES = [
  { id: "meatless-monday", name: "Meatless Monday — 4 weeks", target_kg: 8, duration_days: 28, participants: 1842, badge: "🥦 Plant Pioneer" },
  { id: "zero-car-week", name: "Car-Free Commute Week", target_kg: 9, duration_days: 7, participants: 723, badge: "🚲 Urban Rider" },
  { id: "energy-diet", name: "Energy Diet — Cut 20% in 30 days", target_kg: 20, duration_days: 30, participants: 3204, badge: "⚡ Grid Guardian" },
  { id: "no-new-clothing", name: "No New Clothes — 60 days", target_kg: 30, duration_days: 60, participants: 521, badge: "♻️ Circular Dresser" },
];
