import {
  EMISSION_FACTORS,
  type DietType,
  type DigitalActivity,
  type EmissionCategory,
  type EventCateringType,
  type PetType,
  type ShoppingItem,
  type TransportMode,
  type WaterSource
} from "@/lib/emission-factors";
import { clamp } from "@/lib/utils";

export type CalculationBreakdown = {
  label: string;
  kgCo2e: number;
};

export type CalculationResult = {
  kgCo2e: number;
  breakdown: CalculationBreakdown[];
  comparison: {
    drivingKm: number;
    treesNeededYear: number;
    smartphonesCharged: number;
  };
};

export type TransportInput = {
  mode: TransportMode;
  distanceKm: number;
  frequency?: number;
  returnTrip?: boolean;
  originCity?: string;
  destinationCity?: string;
};

export type EnergyInput = {
  gridKwh?: number;
  billAmountInr?: number;
  tariffInrPerKwh?: number;
  lpgCylinders?: number;
  keroseneLitres?: number;
  naturalGasScm?: number;
  hasSolar?: boolean;
  solarShare?: number;
  acHoursPerDay?: number;
  smartMeterImport?: boolean;
};

export type DietInput = {
  dietType: DietType;
  days?: number;
  mealsPerDay?: number;
  dairyLitres?: number;
  localProduce?: boolean;
  foodWastePercent?: number;
  eatingOut?: boolean;
};

export type ShoppingInput = {
  items: Partial<Record<ShoppingItem, number>>;
  refurbishedItems?: Partial<Record<ShoppingItem, boolean>>;
};

export type WasteInput = {
  totalKgPerWeek: number;
  recyclingPercent?: number;
  compostingPercent?: number;
  eWasteDevices?: number;
};

export type DigitalInput = {
  hours: Partial<Record<DigitalActivity, number>>;
  emailsWithAttachment?: number;
  cloudStorageGbMonths?: number;
  cryptoTransactions?: number;
  aiPromptQueries?: number;
};

export type FoodDeliveryInput = {
  ordersPerWeek: number;
  avgDeliveryKm?: number;
  packagingWaste?: boolean;
};

export type WaterInput = {
  litresPerDay: number;
  source: WaterSource;
  tankerDistanceKm?: number;
  hotWaterLitres?: number;
  hotWaterMode?: "boiler" | "solar";
};

export type PetInput = {
  petType: PetType;
  count?: number;
  foodKgPerMonth?: number;
};

export type EventsInput = {
  eventType: "wedding" | "festival" | "office_party" | "concert";
  attendees: number;
  cateringType: EventCateringType;
  generatorHours?: number;
  fireworks?: boolean;
  zeroWaste?: boolean;
};

export type EntryInput =
  | { category: "transport"; input: TransportInput }
  | { category: "energy"; input: EnergyInput }
  | { category: "diet"; input: DietInput }
  | { category: "shopping"; input: ShoppingInput }
  | { category: "waste"; input: WasteInput }
  | { category: "digital"; input: DigitalInput }
  | { category: "food_delivery"; input: FoodDeliveryInput }
  | { category: "water"; input: WaterInput }
  | { category: "pet"; input: PetInput }
  | { category: "events"; input: EventsInput };

const flightCityDistancesKm: Record<string, number> = {
  "delhi-mumbai": 1150,
  "delhi-bengaluru": 1740,
  "delhi-kolkata": 1300,
  "delhi-dehradun": 210,
  "mumbai-bengaluru": 840,
  "mumbai-chennai": 1030,
  "bengaluru-hyderabad": 500,
  "dehradun-mumbai": 1360
};

function rounded(value: number) {
  return Math.max(0, Number(value.toFixed(2)));
}

function resultFrom(breakdown: CalculationBreakdown[]): CalculationResult {
  const kgCo2e = rounded(
    breakdown.reduce((sum, item) => sum + item.kgCo2e, 0)
  );

  return {
    kgCo2e,
    breakdown: breakdown.map((item) => ({
      ...item,
      kgCo2e: rounded(item.kgCo2e)
    })),
    comparison: {
      drivingKm: rounded(kgCo2e / EMISSION_FACTORS.transport.petrol_car),
      treesNeededYear: rounded(kgCo2e / 21.77),
      smartphonesCharged: rounded(kgCo2e / 0.00000822)
    }
  };
}

function flightDistanceFromCities(input: TransportInput) {
  if (!input.originCity || !input.destinationCity) return input.distanceKm;
  const normalized = [input.originCity, input.destinationCity]
    .map((city) => city.trim().toLowerCase())
    .sort()
    .join("-");
  return flightCityDistancesKm[normalized] ?? input.distanceKm;
}

export function calculateTransport(input: TransportInput): CalculationResult {
  const isFlight = input.mode === "flight_domestic" || input.mode === "flight_intl";
  const distance = isFlight ? flightDistanceFromCities(input) : input.distanceKm;
  const roundTripMultiplier = input.returnTrip ? 2 : 1;
  const frequency = input.frequency ?? 1;
  const kgCo2e =
    distance *
    roundTripMultiplier *
    frequency *
    EMISSION_FACTORS.transport[input.mode];

  return resultFrom([
    {
      label: input.mode,
      kgCo2e
    }
  ]);
}

export function calculateEnergy(input: EnergyInput): CalculationResult {
  const tariff = input.tariffInrPerKwh ?? 8;
  const billKwh =
    input.billAmountInr && input.billAmountInr > 0
      ? input.billAmountInr / tariff
      : 0;
  const gridKwh = input.gridKwh ?? billKwh;
  const solarShare = input.hasSolar ? clamp(input.solarShare ?? 0.3, 0, 1) : 0;
  const effectiveGridKwh = gridKwh * (1 - solarShare);

  return resultFrom([
    {
      label: "grid_electricity",
      kgCo2e: effectiveGridKwh * EMISSION_FACTORS.energy.grid_electricity_kwh
    },
    {
      label: "lpg_cylinder_14kg",
      kgCo2e:
        (input.lpgCylinders ?? 0) *
        EMISSION_FACTORS.energy.lpg_cylinder_14kg
    },
    {
      label: "kerosene_litre",
      kgCo2e:
        (input.keroseneLitres ?? 0) * EMISSION_FACTORS.energy.kerosene_litre
    },
    {
      label: "natural_gas_scm",
      kgCo2e:
        (input.naturalGasScm ?? 0) * EMISSION_FACTORS.energy.natural_gas_scm
    },
    {
      label: "ac_hours",
      kgCo2e: (input.acHoursPerDay ?? 0) * EMISSION_FACTORS.energy.ac_hour
    }
  ]);
}

export function calculateDiet(input: DietInput): CalculationResult {
  const days = input.days ?? 1;
  const mealsScale = clamp(input.mealsPerDay ?? 3, 1, 6) / 3;
  const localBonus = input.localProduce
    ? EMISSION_FACTORS.dietDaily.local_produce * days
    : 0;
  const foodWasteMultiplier =
    1 + clamp(input.foodWastePercent ?? 0, 0, 100) * EMISSION_FACTORS.dietDaily.food_waste_multiplier;
  const restaurantMultiplier = input.eatingOut
    ? EMISSION_FACTORS.dietDaily.restaurant_multiplier
    : 1;

  return resultFrom([
    {
      label: input.dietType,
      kgCo2e:
        EMISSION_FACTORS.dietDaily[input.dietType] *
        days *
        mealsScale *
        foodWasteMultiplier *
        restaurantMultiplier
    },
    {
      label: "dairy_litre",
      kgCo2e:
        (input.dairyLitres ?? 0) * EMISSION_FACTORS.dietDaily.dairy_litre
    },
    {
      label: "local_produce_bonus",
      kgCo2e: localBonus
    }
  ]);
}

export function calculateShopping(input: ShoppingInput): CalculationResult {
  const breakdown = Object.entries(input.items).map(([item, quantity]) => {
    const shoppingItem = item as ShoppingItem;
    const refurbished = input.refurbishedItems?.[shoppingItem] ?? false;
    const multiplier = refurbished
      ? EMISSION_FACTORS.shopping.refurbished_multiplier
      : 1;

    return {
      label: refurbished ? `${item}_refurbished` : item,
      kgCo2e:
        (quantity ?? 0) *
        EMISSION_FACTORS.shopping[shoppingItem] *
        multiplier
    };
  });

  return resultFrom(breakdown);
}

export function calculateWaste(input: WasteInput): CalculationResult {
  const recyclingPercent = clamp(input.recyclingPercent ?? 0, 0, 100);
  const compostingPercent = clamp(input.compostingPercent ?? 0, 0, 100);
  const landfillPercent = clamp(100 - recyclingPercent - compostingPercent, 0, 100);
  const total = input.totalKgPerWeek;

  return resultFrom([
    {
      label: "landfill_waste",
      kgCo2e:
        total *
        (landfillPercent / 100) *
        EMISSION_FACTORS.wastePerKg.landfill_waste
    },
    {
      label: "recycled_waste",
      kgCo2e:
        total *
        (recyclingPercent / 100) *
        EMISSION_FACTORS.wastePerKg.recycled_waste
    },
    {
      label: "composted_waste",
      kgCo2e:
        total *
        (compostingPercent / 100) *
        EMISSION_FACTORS.wastePerKg.composted_waste
    },
    {
      label: "e_waste_kg",
      kgCo2e:
        (input.eWasteDevices ?? 0) * EMISSION_FACTORS.wastePerKg.e_waste_kg
    }
  ]);
}

export function calculateDigital(input: DigitalInput): CalculationResult {
  const activityBreakdown = Object.entries(input.hours)
    .filter(
      ([activity]) =>
        activity !== "email_with_attachment" &&
        activity !== "cloud_storage_gb" &&
        activity !== "crypto_tx" &&
        activity !== "ai_prompt_query"
    )
    .map(([activity, hours]) => ({
      label: activity,
      kgCo2e:
        (hours ?? 0) *
        EMISSION_FACTORS.digitalPerHour[
          activity as keyof typeof EMISSION_FACTORS.digitalPerHour
        ]
    }));

  return resultFrom([
    ...activityBreakdown,
    {
      label: "email_with_attachment",
      kgCo2e:
        (input.emailsWithAttachment ?? 0) *
        EMISSION_FACTORS.digitalPerHour.email_with_attachment
    },
    {
      label: "cloud_storage_gb",
      kgCo2e:
        (input.cloudStorageGbMonths ?? 0) *
        EMISSION_FACTORS.digitalPerHour.cloud_storage_gb
    },
    {
      label: "crypto_tx",
      kgCo2e:
        (input.cryptoTransactions ?? 0) *
        EMISSION_FACTORS.digitalPerHour.crypto_tx
    },
    {
      label: "ai_prompt_query",
      kgCo2e:
        (input.aiPromptQueries ?? 0) *
        EMISSION_FACTORS.digitalPerHour.ai_prompt_query
    }
  ]);
}

export function calculateFoodDelivery(input: FoodDeliveryInput): CalculationResult {
  const orders = input.ordersPerWeek;
  const deliveryKm = input.avgDeliveryKm ?? 3.5;
  const packaging = input.packagingWaste === false
    ? 0
    : EMISSION_FACTORS.foodDelivery.packaging_per_order;

  return resultFrom([
    {
      label: "delivery_distance",
      kgCo2e: orders * deliveryKm * EMISSION_FACTORS.foodDelivery.delivery_km
    },
    {
      label: "packaging",
      kgCo2e: orders * packaging
    }
  ]);
}

export function calculateWater(input: WaterInput): CalculationResult {
  const sourceFactors: Record<WaterSource, number> = {
    tap: EMISSION_FACTORS.water.tap_water_litre,
    borewell: EMISSION_FACTORS.water.borewell_litre,
    tanker: EMISSION_FACTORS.water.tanker_water_litre,
    rainwater: EMISSION_FACTORS.water.rainwater_litre
  };
  const hotWaterFactor =
    input.hotWaterMode === "solar"
      ? EMISSION_FACTORS.water.hot_water_litre_solar
      : EMISSION_FACTORS.water.hot_water_litre_boiler;

  return resultFrom([
    {
      label: `${input.source}_water`,
      kgCo2e: input.litresPerDay * sourceFactors[input.source]
    },
    {
      label: "tanker_delivery_distance",
      kgCo2e:
        input.source === "tanker"
          ? (input.tankerDistanceKm ?? 0) * 0.09
          : 0
    },
    {
      label: "hot_water",
      kgCo2e: (input.hotWaterLitres ?? 0) * hotWaterFactor
    }
  ]);
}

export function calculatePet(input: PetInput): CalculationResult {
  const count = input.count ?? 1;
  const yearlyBase = EMISSION_FACTORS.petYearly[input.petType] * count;
  const foodMonthly = input.foodKgPerMonth
    ? input.foodKgPerMonth * 2.1
    : 0;

  return resultFrom([
    {
      label: input.petType,
      kgCo2e: yearlyBase / 12
    },
    {
      label: "pet_food_monthly",
      kgCo2e: foodMonthly
    }
  ]);
}

export function calculateEvents(input: EventsInput): CalculationResult {
  const attendees = Math.max(1, input.attendees);
  const cateringFactor =
    input.cateringType === "veg"
      ? EMISSION_FACTORS.events.veg_catering_per_attendee
      : EMISSION_FACTORS.events.non_veg_catering_per_attendee;
  const multiplier = input.zeroWaste
    ? EMISSION_FACTORS.events.zero_waste_multiplier
    : 1;
  const total = resultFrom([
    {
      label: `${input.cateringType}_catering`,
      kgCo2e: attendees * cateringFactor * multiplier
    },
    {
      label: "generator_hours",
      kgCo2e:
        (input.generatorHours ?? 0) * EMISSION_FACTORS.events.generator_hour
    },
    {
      label: "fireworks",
      kgCo2e: input.fireworks ? EMISSION_FACTORS.events.fireworks_event : 0
    }
  ]);

  return {
    ...total,
    breakdown: [
      ...total.breakdown,
      {
        label: "per_person",
        kgCo2e: rounded(total.kgCo2e / attendees)
      }
    ]
  };
}

export function calculateEntry(entry: EntryInput): CalculationResult {
  switch (entry.category) {
    case "transport":
      return calculateTransport(entry.input);
    case "energy":
      return calculateEnergy(entry.input);
    case "diet":
      return calculateDiet(entry.input);
    case "shopping":
      return calculateShopping(entry.input);
    case "waste":
      return calculateWaste(entry.input);
    case "digital":
      return calculateDigital(entry.input);
    case "food_delivery":
      return calculateFoodDelivery(entry.input);
    case "water":
      return calculateWater(entry.input);
    case "pet":
      return calculatePet(entry.input);
    case "events":
      return calculateEvents(entry.input);
    default: {
      const exhaustiveCheck: never = entry;
      return exhaustiveCheck;
    }
  }
}

export function getCategoryTotal(
  category: EmissionCategory,
  input: EntryInput["input"]
) {
  return calculateEntry({ category, input } as EntryInput).kgCo2e;
}
