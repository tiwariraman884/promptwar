import factors from "./emission-factors.json";

export const INDIA_DAILY_AVERAGE_KG = factors.india_daily_avg_kg;
export const INDIA_ANNUAL_AVERAGE_KG = factors.india_annual_avg_kg;
export const INDIA_ANNUAL_TARGET_KG = factors.india_annual_target_kg;
export const INDIA_PARIS_TARGET_KG_DAY = factors.india_paris_target_kg_day;
export const WORLD_DAILY_AVERAGE_KG = factors.world_avg_daily_kg;

export const EMISSION_FACTORS = {
  transport: factors.transport,
  energy: factors.energy,
  dietDaily: factors.diet_daily,
  foodDelivery: factors.food_delivery,
  shopping: factors.shopping,
  wastePerKg: factors.waste_per_kg,
  digitalPerHour: factors.digital_per_hour,
  water: factors.water,
  petYearly: factors.pet_yearly,
  events: factors.events,
  sources: factors.sources
} as const;

export const CATEGORY_LABELS = {
  transport: "Transport",
  energy: "Energy",
  diet: "Diet",
  shopping: "Shopping",
  waste: "Waste",
  digital: "Digital",
  food_delivery: "Food Delivery",
  water: "Water",
  pet: "Pet",
  events: "Events"
} as const;

export const CATEGORY_ORDER = [
  "transport",
  "energy",
  "diet",
  "shopping",
  "waste",
  "digital",
  "food_delivery",
  "water",
  "pet",
  "events"
] as const;

export type EmissionCategory = (typeof CATEGORY_ORDER)[number];
export type TransportMode = keyof typeof EMISSION_FACTORS.transport;
export type DietType = Exclude<
  keyof typeof EMISSION_FACTORS.dietDaily,
  "dairy_litre" | "local_produce" | "restaurant_multiplier" | "food_waste_multiplier"
>;
export type ShoppingItem = Exclude<
  keyof typeof EMISSION_FACTORS.shopping,
  "refurbished_multiplier"
>;
export type WasteType = keyof typeof EMISSION_FACTORS.wastePerKg;
export type DigitalActivity = keyof typeof EMISSION_FACTORS.digitalPerHour;
export type WaterSource = "tap" | "borewell" | "tanker" | "rainwater";
export type PetType = keyof typeof EMISSION_FACTORS.petYearly;
export type EventCateringType = "veg" | "non_veg";
