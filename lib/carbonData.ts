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

/* City center coordinates for the Green Map */
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Delhi:          { lat: 28.6139, lng: 77.2090 },
  Mumbai:         { lat: 19.0760, lng: 72.8777 },
  Bengaluru:      { lat: 12.9716, lng: 77.5946 },
  Hyderabad:      { lat: 17.3850, lng: 78.4867 },
  Chennai:        { lat: 13.0827, lng: 80.2707 },
  Kolkata:        { lat: 22.5726, lng: 88.3639 },
  Pune:           { lat: 18.5204, lng: 73.8567 },
  Ahmedabad:      { lat: 23.0225, lng: 72.5714 },
  Jaipur:         { lat: 26.9124, lng: 75.7873 },
  Lucknow:        { lat: 26.8467, lng: 80.9462 },
  Chandigarh:     { lat: 30.7333, lng: 76.7794 },
  Kochi:          { lat: 9.9312,  lng: 76.2673 },
  Surat:          { lat: 21.1702, lng: 72.8311 },
  Nagpur:         { lat: 21.1458, lng: 79.0882 },
  Bhopal:         { lat: 23.2599, lng: 77.4126 },
  Visakhapatnam:  { lat: 17.6868, lng: 83.2185 },
};

export const GREEN_MAP_LOCATIONS = [
  // Delhi (5)
  { id: 1,  name: "EV Charging Station — Connaught Place",    type: "ev_charging",    lat: 28.6315, lng: 77.2167, city: "Delhi" },
  { id: 2,  name: "Metro Station — Rajiv Chowk",              type: "public_transit",  lat: 28.6328, lng: 77.2197, city: "Delhi" },
  { id: 3,  name: "Community Composting Hub — Lajpat Nagar",   type: "composting",      lat: 28.5677, lng: 77.2433, city: "Delhi" },
  { id: 4,  name: "Eco Store — Hauz Khas Village",            type: "eco_store",       lat: 28.5494, lng: 77.2001, city: "Delhi" },
  { id: 5,  name: "Urban Rooftop Garden — Vasant Vihar",      type: "urban_garden",    lat: 28.5571, lng: 77.1588, city: "Delhi" },

  // Mumbai (3)
  { id: 6,  name: "Solar Rooftop Facility — BKC",             type: "solar_facility",  lat: 19.0596, lng: 72.8656, city: "Mumbai" },
  { id: 7,  name: "EV Charging — Juhu",                       type: "ev_charging",     lat: 19.1075, lng: 72.8263, city: "Mumbai" },
  { id: 8,  name: "Recycling Center — Dharavi",               type: "recycling",       lat: 19.0420, lng: 72.8570, city: "Mumbai" },

  // Bengaluru (3)
  { id: 9,  name: "EV Charging Hub — Koramangala",            type: "ev_charging",     lat: 12.9352, lng: 77.6245, city: "Bengaluru" },
  { id: 10, name: "Organic Eco Store — Indiranagar",          type: "eco_store",       lat: 12.9784, lng: 77.6408, city: "Bengaluru" },
  { id: 11, name: "Cubbon Park Community Garden",             type: "urban_garden",    lat: 12.9763, lng: 77.5929, city: "Bengaluru" },

  // Hyderabad (3)
  { id: 12, name: "Metro Station — Ameerpet",                 type: "public_transit",  lat: 17.4375, lng: 78.4483, city: "Hyderabad" },
  { id: 13, name: "Solar Facility — HITEC City",              type: "solar_facility",  lat: 17.4435, lng: 78.3772, city: "Hyderabad" },
  { id: 14, name: "Composting Hub — Jubilee Hills",           type: "composting",      lat: 17.4326, lng: 78.4071, city: "Hyderabad" },

  // Chennai (3)
  { id: 15, name: "Recycling Center — T. Nagar",              type: "recycling",       lat: 13.0418, lng: 80.2341, city: "Chennai" },
  { id: 16, name: "EV Charging — Adyar",                      type: "ev_charging",     lat: 13.0067, lng: 80.2567, city: "Chennai" },
  { id: 17, name: "Eco Store — Besant Nagar",                 type: "eco_store",       lat: 13.0002, lng: 80.2668, city: "Chennai" },

  // Kolkata (3)
  { id: 18, name: "Metro Station — Park Street",              type: "public_transit",  lat: 22.5512, lng: 88.3592, city: "Kolkata" },
  { id: 19, name: "Urban Garden — Salt Lake",                 type: "urban_garden",    lat: 22.5804, lng: 88.4127, city: "Kolkata" },
  { id: 20, name: "Recycling Hub — Howrah",                   type: "recycling",       lat: 22.5958, lng: 88.2636, city: "Kolkata" },

  // Pune (3)
  { id: 21, name: "EV Charging — Hinjewadi IT Park",          type: "ev_charging",     lat: 18.5912, lng: 73.7390, city: "Pune" },
  { id: 22, name: "Composting Hub — Koregaon Park",           type: "composting",      lat: 18.5362, lng: 73.8930, city: "Pune" },
  { id: 23, name: "Solar Rooftop — Kothrud",                  type: "solar_facility",  lat: 18.5074, lng: 73.8077, city: "Pune" },

  // Ahmedabad (2)
  { id: 24, name: "Eco Store — SG Highway",                   type: "eco_store",       lat: 23.0302, lng: 72.5271, city: "Ahmedabad" },
  { id: 25, name: "Recycling Center — Navrangpura",           type: "recycling",       lat: 23.0369, lng: 72.5601, city: "Ahmedabad" },

  // Jaipur (2)
  { id: 26, name: "Solar Facility — Sanganer",                type: "solar_facility",  lat: 26.8288, lng: 75.7897, city: "Jaipur" },
  { id: 27, name: "Community Garden — C-Scheme",              type: "urban_garden",    lat: 26.9056, lng: 75.7906, city: "Jaipur" },

  // Lucknow (2)
  { id: 28, name: "Metro Station — Hazratganj",               type: "public_transit",  lat: 26.8530, lng: 80.9455, city: "Lucknow" },
  { id: 29, name: "EV Charging — Gomti Nagar",                type: "ev_charging",     lat: 26.8563, lng: 80.9925, city: "Lucknow" },

  // Chandigarh (2)
  { id: 30, name: "Eco Store — Sector 17",                    type: "eco_store",       lat: 30.7415, lng: 76.7843, city: "Chandigarh" },
  { id: 31, name: "Urban Garden — Rock Garden",               type: "urban_garden",    lat: 30.7525, lng: 76.8108, city: "Chandigarh" },

  // Kochi (2)
  { id: 32, name: "Solar Facility — Kakkanad",                type: "solar_facility",  lat: 10.0158, lng: 76.3419, city: "Kochi" },
  { id: 33, name: "Metro Station — Aluva",                    type: "public_transit",  lat: 10.1100, lng: 76.3514, city: "Kochi" },

  // Surat (2)
  { id: 34, name: "Recycling Hub — Varachha",                 type: "recycling",       lat: 21.2063, lng: 72.8470, city: "Surat" },
  { id: 35, name: "EV Charging — Athwa",                      type: "ev_charging",     lat: 21.1653, lng: 72.7981, city: "Surat" },

  // Nagpur (2)
  { id: 36, name: "Metro Station — Sitabuldi",                type: "public_transit",  lat: 21.1440, lng: 79.0831, city: "Nagpur" },
  { id: 37, name: "Composting Hub — Dharampeth",              type: "composting",      lat: 21.1502, lng: 79.0704, city: "Nagpur" },

  // Bhopal (2)
  { id: 38, name: "Eco Store — New Market",                   type: "eco_store",       lat: 23.2332, lng: 77.4126, city: "Bhopal" },
  { id: 39, name: "Solar Rooftop — Arera Colony",             type: "solar_facility",  lat: 23.2200, lng: 77.4340, city: "Bhopal" },

  // Visakhapatnam (2)
  { id: 40, name: "Recycling Center — MVP Colony",            type: "recycling",       lat: 17.7365, lng: 83.3236, city: "Visakhapatnam" },
  { id: 41, name: "Community Garden — Beach Road",            type: "urban_garden",    lat: 17.7220, lng: 83.3253, city: "Visakhapatnam" },
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
