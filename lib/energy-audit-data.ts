/* ─── Home Energy Audit Data ─── */

export interface Appliance {
  id: string;
  name: string;
  emoji: string;
  category: "cooling" | "heating" | "lighting" | "kitchen" | "laundry" | "entertainment" | "other";
  defaultCount: number;
  defaultHoursPerDay: number;
  wattage: number; // typical watts
  starRatings?: { stars: number; wattage: number }[];
  tips: string[];
}

export const APPLIANCES: Appliance[] = [
  // ── Cooling ──
  {
    id: "ac_1_5t", name: "Air Conditioner (1.5 ton)", emoji: "❄️", category: "cooling",
    defaultCount: 1, defaultHoursPerDay: 6, wattage: 1500,
    starRatings: [
      { stars: 3, wattage: 1500 }, { stars: 4, wattage: 1250 }, { stars: 5, wattage: 1100 },
    ],
    tips: ["Set thermostat to 26°C — each degree below adds ~6% energy", "Clean filters monthly for 15% efficiency gain", "Use ceiling fan with AC to reduce load"],
  },
  {
    id: "ac_1t", name: "Air Conditioner (1 ton)", emoji: "❄️", category: "cooling",
    defaultCount: 0, defaultHoursPerDay: 6, wattage: 1100,
    starRatings: [
      { stars: 3, wattage: 1100 }, { stars: 4, wattage: 950 }, { stars: 5, wattage: 800 },
    ],
    tips: ["1T ACs are ideal for rooms under 150 sq ft", "Inverter ACs save 30-50% vs non-inverter"],
  },
  {
    id: "fan", name: "Ceiling Fan", emoji: "🌀", category: "cooling",
    defaultCount: 3, defaultHoursPerDay: 12, wattage: 75,
    starRatings: [
      { stars: 3, wattage: 75 }, { stars: 5, wattage: 35 },
    ],
    tips: ["BLDC fans use only 28-35W vs 75W for regular fans", "Upgrading 3 fans saves ~₹1,200/year"],
  },
  {
    id: "cooler", name: "Air Cooler", emoji: "💨", category: "cooling",
    defaultCount: 0, defaultHoursPerDay: 8, wattage: 200,
    tips: ["Coolers use 80% less energy than ACs", "Best for dry climates like Rajasthan, UP"],
  },

  // ── Heating / Water ──
  {
    id: "geyser_electric", name: "Electric Geyser", emoji: "🚿", category: "heating",
    defaultCount: 1, defaultHoursPerDay: 0.5, wattage: 2000,
    tips: ["Solar water heaters eliminate geyser CO₂ entirely", "Insulate hot water pipes to retain heat", "15 min → 10 min use saves ~33%"],
  },
  {
    id: "room_heater", name: "Room Heater", emoji: "🔥", category: "heating",
    defaultCount: 0, defaultHoursPerDay: 4, wattage: 1500,
    tips: ["Oil-filled radiators are safer and more efficient", "Layer clothing before switching on heater"],
  },

  // ── Lighting ──
  {
    id: "led", name: "LED Bulb (9W)", emoji: "💡", category: "lighting",
    defaultCount: 8, defaultHoursPerDay: 6, wattage: 9,
    tips: ["Already the most efficient option!", "Use warm white (2700K) for bedrooms, cool white for work areas"],
  },
  {
    id: "cfl", name: "CFL Bulb (18W)", emoji: "💡", category: "lighting",
    defaultCount: 0, defaultHoursPerDay: 6, wattage: 18,
    tips: ["Replace with LED — same brightness at half the wattage", "CFLs contain mercury — dispose responsibly"],
  },
  {
    id: "incandescent", name: "Incandescent Bulb (60W)", emoji: "💡", category: "lighting",
    defaultCount: 0, defaultHoursPerDay: 4, wattage: 60,
    tips: ["Replace immediately! Uses 7x more energy than LED", "Each replacement saves ~₹400/year"],
  },
  {
    id: "tubelight", name: "Tube Light (36W)", emoji: "💡", category: "lighting",
    defaultCount: 2, defaultHoursPerDay: 6, wattage: 36,
    tips: ["LED tube replacements use only 18W", "T5 tubes are more efficient than T8"],
  },

  // ── Kitchen ──
  {
    id: "fridge", name: "Refrigerator", emoji: "🧊", category: "kitchen",
    defaultCount: 1, defaultHoursPerDay: 24, wattage: 60,
    starRatings: [
      { stars: 2, wattage: 80 }, { stars: 3, wattage: 60 }, { stars: 4, wattage: 45 }, { stars: 5, wattage: 35 },
    ],
    tips: ["Keep fridge 75% full for optimal efficiency", "Don't put hot food directly in fridge", "Clean condenser coils every 6 months"],
  },
  {
    id: "microwave", name: "Microwave Oven", emoji: "📦", category: "kitchen",
    defaultCount: 1, defaultHoursPerDay: 0.3, wattage: 1200,
    tips: ["More energy-efficient than OTG for small portions", "Use microwave-safe glass containers"],
  },
  {
    id: "induction", name: "Induction Cooktop", emoji: "🍳", category: "kitchen",
    defaultCount: 0, defaultHoursPerDay: 1, wattage: 1800,
    tips: ["More efficient than gas stove (90% vs 40% heat transfer)", "Uses electricity but reduces LPG dependency"],
  },
  {
    id: "water_purifier", name: "RO Water Purifier", emoji: "💧", category: "kitchen",
    defaultCount: 1, defaultHoursPerDay: 2, wattage: 60,
    tips: ["RO wastes 60-80% of water — use reject water for mopping", "UV purifiers use less energy if water is already clean"],
  },

  // ── Laundry ──
  {
    id: "washing_machine", name: "Washing Machine", emoji: "🧺", category: "laundry",
    defaultCount: 1, defaultHoursPerDay: 0.5, wattage: 500,
    tips: ["Cold water wash saves 90% of heating energy", "Full loads only — half loads waste water and energy", "Front-loaders use 50% less water than top-loaders"],
  },
  {
    id: "iron", name: "Electric Iron", emoji: "👔", category: "laundry",
    defaultCount: 1, defaultHoursPerDay: 0.3, wattage: 1000,
    tips: ["Iron in bulk — preheating wastes energy for single items", "Use steam iron at lower temperature settings"],
  },

  // ── Entertainment ──
  {
    id: "tv", name: "Television (LED)", emoji: "📺", category: "entertainment",
    defaultCount: 1, defaultHoursPerDay: 4, wattage: 80,
    tips: ["Turn off when not watching — standby uses 5-15W", "Reduce brightness to save 20-30% energy"],
  },
  {
    id: "laptop", name: "Laptop", emoji: "💻", category: "entertainment",
    defaultCount: 1, defaultHoursPerDay: 6, wattage: 50,
    tips: ["Unplug when fully charged", "Use power-saving mode for 30% less consumption"],
  },
  {
    id: "desktop", name: "Desktop Computer", emoji: "🖥️", category: "entertainment",
    defaultCount: 0, defaultHoursPerDay: 6, wattage: 200,
    tips: ["Desktops use 4x more than laptops", "Use sleep mode when away for >15 minutes"],
  },
  {
    id: "wifi_router", name: "WiFi Router", emoji: "📡", category: "entertainment",
    defaultCount: 1, defaultHoursPerDay: 24, wattage: 12,
    tips: ["Switch off at night to save ~₹300/year", "Not much per router, but always-on adds up"],
  },

  // ── Other ──
  {
    id: "water_pump", name: "Water Pump/Motor", emoji: "🔧", category: "other",
    defaultCount: 1, defaultHoursPerDay: 1, wattage: 750,
    tips: ["Common in Indian homes for overhead tanks", "Timer-based pumps prevent overrun and save water"],
  },
  {
    id: "exhaust_fan", name: "Exhaust Fan", emoji: "🌬️", category: "other",
    defaultCount: 1, defaultHoursPerDay: 2, wattage: 40,
    tips: ["Clean blades monthly for better airflow", "Use only when needed — humidity sensors help"],
  },
];

/* ── Indian Electricity Rates (₹/kWh by state, 2024 average domestic) ── */
export const STATE_ELECTRICITY_RATES: Record<string, number> = {
  "Andhra Pradesh": 7.5, "Arunachal Pradesh": 4.5, "Assam": 6.8,
  "Bihar": 7.0, "Chhattisgarh": 5.5, "Delhi": 8.0,
  "Goa": 4.5, "Gujarat": 5.8, "Haryana": 7.5,
  "Himachal Pradesh": 5.0, "Jharkhand": 6.0, "Karnataka": 7.8,
  "Kerala": 6.5, "Madhya Pradesh": 7.0, "Maharashtra": 9.5,
  "Manipur": 5.5, "Meghalaya": 5.5, "Mizoram": 5.0,
  "Nagaland": 6.0, "Odisha": 6.0, "Punjab": 7.0,
  "Rajasthan": 8.0, "Sikkim": 3.5, "Tamil Nadu": 6.5,
  "Telangana": 7.5, "Tripura": 6.0, "Uttar Pradesh": 7.0,
  "Uttarakhand": 5.5, "West Bengal": 8.0,
};

/** India CEA grid emission factor (kg CO₂ per kWh) */
export const GRID_EMISSION_FACTOR = 0.82;

/** Audit result for a single appliance */
export interface ApplianceAuditEntry {
  applianceId: string;
  count: number;
  hoursPerDay: number;
  starRating?: number;
}

/** Calculate monthly energy for one appliance entry */
export function calcApplianceMonthly(entry: ApplianceAuditEntry): {
  kwhPerMonth: number;
  costPerMonth: number;
  co2PerMonth: number;
} {
  const appliance = APPLIANCES.find(a => a.id === entry.applianceId);
  if (!appliance) return { kwhPerMonth: 0, costPerMonth: 0, co2PerMonth: 0 };

  let wattage = appliance.wattage;
  if (entry.starRating && appliance.starRatings) {
    const starEntry = appliance.starRatings.find(s => s.stars === entry.starRating);
    if (starEntry) wattage = starEntry.wattage;
  }

  const kwhPerMonth = (wattage * entry.hoursPerDay * entry.count * 30) / 1000;
  const costPerMonth = kwhPerMonth * 5.5; // Default rate, will be overridden
  const co2PerMonth = kwhPerMonth * GRID_EMISSION_FACTOR;

  return { kwhPerMonth, costPerMonth, co2PerMonth };
}
