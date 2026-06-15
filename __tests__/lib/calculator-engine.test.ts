import { describe, it, expect } from "vitest";
import {
  calculateTransport,
  calculateEnergy,
  calculateDiet,
  calculateShopping,
  calculateWaste,
  calculateDigital,
  calculateFoodDelivery,
  calculateWater,
  calculatePet,
  calculateEvents,
  calculateEntry,
} from "@/lib/calculator-engine";

/* ─── Helper ─── */
const expectPositive = (result: { kgCo2e: number }) =>
  expect(result.kgCo2e).toBeGreaterThan(0);

/* ═══════════════════════════════════════════════
   Transport
   ═══════════════════════════════════════════════ */
describe("calculateTransport", () => {
  it("calculates petrol car emissions for 10 km", () => {
    const result = calculateTransport({ mode: "petrol_car", distanceKm: 10 });
    // 10 * 0.18 = 1.80
    expect(result.kgCo2e).toBeCloseTo(1.8, 1);
    expect(result.breakdown).toHaveLength(1);
    expect(result.breakdown[0].label).toBe("petrol_car");
  });

  it("doubles emissions for return trip", () => {
    const oneWay = calculateTransport({ mode: "petrol_car", distanceKm: 10 });
    const returnTrip = calculateTransport({
      mode: "petrol_car",
      distanceKm: 10,
      returnTrip: true,
    });
    expect(returnTrip.kgCo2e).toBeCloseTo(oneWay.kgCo2e * 2, 1);
  });

  it("multiplies by frequency", () => {
    const result = calculateTransport({
      mode: "metro_rail",
      distanceKm: 5,
      frequency: 22,
    });
    // 5 * 22 * 0.031 = 3.41
    expect(result.kgCo2e).toBeCloseTo(3.41, 1);
  });

  it("looks up city-pair distance for flights", () => {
    const result = calculateTransport({
      mode: "flight_domestic",
      distanceKm: 0, // should be overridden
      originCity: "Delhi",
      destinationCity: "Mumbai",
    });
    // Delhi-Mumbai = 1150 km * 0.255 = 293.25
    expect(result.kgCo2e).toBeCloseTo(293.25, 0);
  });

  it("falls back to distanceKm when cities unknown", () => {
    const result = calculateTransport({
      mode: "flight_domestic",
      distanceKm: 500,
      originCity: "Haridwar",
      destinationCity: "Lucknow",
    });
    // 500 * 0.255 = 127.5
    expect(result.kgCo2e).toBeCloseTo(127.5, 0);
  });

  it("returns zero for walk/cycle", () => {
    const result = calculateTransport({ mode: "walk_cycle", distanceKm: 100 });
    expect(result.kgCo2e).toBe(0);
  });

  it("includes comparison metrics", () => {
    const result = calculateTransport({ mode: "petrol_car", distanceKm: 100 });
    expect(result.comparison.drivingKm).toBeGreaterThan(0);
    expect(result.comparison.treesNeededYear).toBeGreaterThan(0);
    expect(result.comparison.smartphonesCharged).toBeGreaterThan(0);
  });
});

/* ═══════════════════════════════════════════════
   Energy
   ═══════════════════════════════════════════════ */
describe("calculateEnergy", () => {
  it("calculates grid electricity", () => {
    const result = calculateEnergy({ gridKwh: 100 });
    // 100 * 0.82 = 82
    expect(result.kgCo2e).toBeCloseTo(82, 0);
  });

  it("converts bill INR to kWh and calculates", () => {
    const result = calculateEnergy({ billAmountInr: 800 });
    // 800 / 8 (default tariff) = 100 kWh → 100 * 0.82 = 82
    expect(result.kgCo2e).toBeCloseTo(82, 0);
  });

  it("applies solar share deduction", () => {
    const noSolar = calculateEnergy({ gridKwh: 100 });
    const withSolar = calculateEnergy({
      gridKwh: 100,
      hasSolar: true,
      solarShare: 0.5,
    });
    expect(withSolar.kgCo2e).toBeLessThan(noSolar.kgCo2e);
    // 50% solar → roughly half grid emissions
    expect(withSolar.kgCo2e).toBeCloseTo(noSolar.kgCo2e * 0.5, 0);
  });

  it("adds LPG cylinder emissions", () => {
    const result = calculateEnergy({ lpgCylinders: 2 });
    // 2 * 29.5 = 59
    expect(result.kgCo2e).toBeCloseTo(59, 0);
  });

  it("handles all-zero inputs", () => {
    const result = calculateEnergy({});
    expect(result.kgCo2e).toBe(0);
  });
});

/* ═══════════════════════════════════════════════
   Diet
   ═══════════════════════════════════════════════ */
describe("calculateDiet", () => {
  it("calculates vegan daily footprint", () => {
    const result = calculateDiet({ dietType: "vegan" });
    // 1.5 * 1 day * (3/3) meals * 1.0 waste * 1.0 restaurant
    expect(result.kgCo2e).toBeCloseTo(1.5, 1);
  });

  it("non-veg is higher than vegan", () => {
    const vegan = calculateDiet({ dietType: "vegan" });
    const nonVeg = calculateDiet({ dietType: "non_veg_mixed" });
    expect(nonVeg.kgCo2e).toBeGreaterThan(vegan.kgCo2e);
  });

  it("scales by number of days", () => {
    const oneDay = calculateDiet({ dietType: "vegetarian", days: 1 });
    const sevenDays = calculateDiet({ dietType: "vegetarian", days: 7 });
    expect(sevenDays.kgCo2e).toBeCloseTo(oneDay.kgCo2e * 7, 0);
  });

  it("applies food waste multiplier", () => {
    const noWaste = calculateDiet({ dietType: "vegan", foodWastePercent: 0 });
    const highWaste = calculateDiet({ dietType: "vegan", foodWastePercent: 50 });
    expect(highWaste.kgCo2e).toBeGreaterThan(noWaste.kgCo2e);
  });
});

/* ═══════════════════════════════════════════════
   Shopping
   ═══════════════════════════════════════════════ */
describe("calculateShopping", () => {
  it("calculates single smartphone", () => {
    const result = calculateShopping({ items: { smartphone: 1 } });
    expect(result.kgCo2e).toBe(70);
  });

  it("applies refurbished discount", () => {
    const newItem = calculateShopping({ items: { laptop: 1 } });
    const refurb = calculateShopping({
      items: { laptop: 1 },
      refurbishedItems: { laptop: true },
    });
    // Refurbished = 0.3x → 350 * 0.3 = 105
    expect(refurb.kgCo2e).toBeCloseTo(newItem.kgCo2e * 0.3, 0);
  });

  it("sums multiple items", () => {
    const result = calculateShopping({
      items: { smartphone: 1, clothing_item: 3 },
    });
    // 70 + 3*10 = 100
    expect(result.kgCo2e).toBe(100);
  });
});

/* ═══════════════════════════════════════════════
   Waste
   ═══════════════════════════════════════════════ */
describe("calculateWaste", () => {
  it("calculates 100% landfill waste", () => {
    const result = calculateWaste({ totalKgPerWeek: 10 });
    // 10 * 1.0 (100% landfill) * 0.58 = 5.80
    expect(result.kgCo2e).toBeCloseTo(5.8, 1);
  });

  it("recycling reduces emissions vs landfill", () => {
    const landfill = calculateWaste({ totalKgPerWeek: 10 });
    const recycled = calculateWaste({
      totalKgPerWeek: 10,
      recyclingPercent: 100,
    });
    expect(recycled.kgCo2e).toBeLessThan(landfill.kgCo2e);
  });

  it("adds e-waste device emissions", () => {
    const result = calculateWaste({
      totalKgPerWeek: 0,
      eWasteDevices: 2,
    });
    // 2 * 2.1 = 4.2
    expect(result.kgCo2e).toBeCloseTo(4.2, 1);
  });
});

/* ═══════════════════════════════════════════════
   Digital
   ═══════════════════════════════════════════════ */
describe("calculateDigital", () => {
  it("calculates HD streaming hours", () => {
    const result = calculateDigital({
      hours: { video_streaming_hd: 10 },
    });
    // 10 * 0.036 = 0.36
    expect(result.kgCo2e).toBeCloseTo(0.36, 2);
  });

  it("adds email and cloud storage", () => {
    const result = calculateDigital({
      hours: {},
      emailsWithAttachment: 100,
      cloudStorageGbMonths: 50,
    });
    // 100 * 0.0001 + 50 * 0.002 = 0.01 + 0.1 = 0.11
    expect(result.kgCo2e).toBeCloseTo(0.11, 2);
  });
});

/* ═══════════════════════════════════════════════
   Food Delivery
   ═══════════════════════════════════════════════ */
describe("calculateFoodDelivery", () => {
  it("calculates weekly orders", () => {
    const result = calculateFoodDelivery({ ordersPerWeek: 5 });
    // 5 * 3.5 (default km) * 0.09 + 5 * 0.12 = 1.575 + 0.6 = 2.175
    expectPositive(result);
    expect(result.kgCo2e).toBeCloseTo(2.18, 1);
  });

  it("no packaging when opted out", () => {
    const withPkg = calculateFoodDelivery({ ordersPerWeek: 5 });
    const noPkg = calculateFoodDelivery({
      ordersPerWeek: 5,
      packagingWaste: false,
    });
    expect(noPkg.kgCo2e).toBeLessThan(withPkg.kgCo2e);
  });
});

/* ═══════════════════════════════════════════════
   Water
   ═══════════════════════════════════════════════ */
describe("calculateWater", () => {
  it("calculates tap water", () => {
    const result = calculateWater({
      litresPerDay: 200,
      source: "tap",
    });
    // 200 * 0.00034 = 0.068
    expectPositive(result);
  });

  it("tanker water costs more than tap", () => {
    const tap = calculateWater({ litresPerDay: 200, source: "tap" });
    const tanker = calculateWater({ litresPerDay: 200, source: "tanker" });
    expect(tanker.kgCo2e).toBeGreaterThan(tap.kgCo2e);
  });

  it("adds hot water emissions", () => {
    const cold = calculateWater({ litresPerDay: 100, source: "tap" });
    const hot = calculateWater({
      litresPerDay: 100,
      source: "tap",
      hotWaterLitres: 50,
    });
    expect(hot.kgCo2e).toBeGreaterThan(cold.kgCo2e);
  });
});

/* ═══════════════════════════════════════════════
   Pet
   ═══════════════════════════════════════════════ */
describe("calculatePet", () => {
  it("calculates monthly dog footprint", () => {
    const result = calculatePet({ petType: "dog_large" });
    // 164 / 12 = 13.67 per month
    expect(result.kgCo2e).toBeCloseTo(13.67, 0);
  });

  it("bird is much lower than dog", () => {
    const dog = calculatePet({ petType: "dog_large" });
    const bird = calculatePet({ petType: "bird" });
    expect(bird.kgCo2e).toBeLessThan(dog.kgCo2e);
  });
});

/* ═══════════════════════════════════════════════
   Events
   ═══════════════════════════════════════════════ */
describe("calculateEvents", () => {
  it("calculates veg wedding", () => {
    const result = calculateEvents({
      eventType: "wedding",
      attendees: 200,
      cateringType: "veg",
    });
    // 200 * 1.5 = 300
    expectPositive(result);
    expect(result.kgCo2e).toBeGreaterThanOrEqual(300);
  });

  it("non-veg is more than veg", () => {
    const veg = calculateEvents({
      eventType: "wedding",
      attendees: 100,
      cateringType: "veg",
    });
    const nonVeg = calculateEvents({
      eventType: "wedding",
      attendees: 100,
      cateringType: "non_veg",
    });
    expect(nonVeg.kgCo2e).toBeGreaterThan(veg.kgCo2e);
  });

  it("zero-waste reduces emissions", () => {
    const normal = calculateEvents({
      eventType: "festival",
      attendees: 50,
      cateringType: "veg",
    });
    const zeroWaste = calculateEvents({
      eventType: "festival",
      attendees: 50,
      cateringType: "veg",
      zeroWaste: true,
    });
    expect(zeroWaste.kgCo2e).toBeLessThan(normal.kgCo2e);
  });

  it("includes per-person breakdown", () => {
    const result = calculateEvents({
      eventType: "concert",
      attendees: 100,
      cateringType: "veg",
    });
    const perPerson = result.breakdown.find((b) => b.label === "per_person");
    expect(perPerson).toBeDefined();
    expect(perPerson!.kgCo2e).toBeLessThan(result.kgCo2e);
  });
});

/* ═══════════════════════════════════════════════
   calculateEntry — dispatch
   ═══════════════════════════════════════════════ */
describe("calculateEntry", () => {
  it("dispatches transport correctly", () => {
    const result = calculateEntry({
      category: "transport",
      input: { mode: "petrol_car", distanceKm: 10 },
    });
    expect(result.kgCo2e).toBeCloseTo(1.8, 1);
  });

  it("dispatches energy correctly", () => {
    const result = calculateEntry({
      category: "energy",
      input: { gridKwh: 50 },
    });
    expect(result.kgCo2e).toBeCloseTo(41, 0);
  });
});
