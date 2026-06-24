import { describe, it, expect } from "vitest";
import {
  analyzeCarbon,
  calculateDietMonthly,
  calculateTravelMonthly,
  calculateElectricityMonthly,
  calculateShoppingMonthly,
  calculateWasteMonthly,
  type CarbonIntelligenceInput,
} from "@/lib/carbon-intelligence";

/**
 * Tests for Carbon Intelligence Engine explainability layer.
 * Verifies that all roadmap actions include reason, confidence, and data source.
 */

const BASELINE_INPUT: CarbonIntelligenceInput = {
  diet: {
    food_type: "non_veg_mixed",
    frequency: "three",
    meat_dairy_level: "moderate",
    local_vs_imported: "mixed",
  },
  travel: {
    commute_mode: "car",
    km_per_week: 100,
    flights_per_year: 4,
    vehicle_type: "petrol",
  },
  electricity: {
    monthly_kwh: 250,
    energy_source: "grid_only",
    appliance_usage: "heavy",
  },
  shopping: {
    monthly_purchases: 8,
    fashion_type: "fast_fashion",
    electronics_frequency: "occasionally",
  },
  waste: {
    weekly_waste_kg: 5,
    recycling_percent: 10,
    composting: false,
    plastic_usage: "heavy",
  },
  current_month: 6,
};

describe("Carbon Intelligence Explainability", () => {
  it("returns 5 roadmap actions", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    expect(result.reduction_roadmap).toHaveLength(5);
  });

  it("every action has a non-empty reason", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    for (const action of result.reduction_roadmap) {
      expect(action.reason).toBeDefined();
      expect(action.reason.length).toBeGreaterThan(20);
    }
  });

  it("every action has a confidence_percent between 40 and 98", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    for (const action of result.reduction_roadmap) {
      expect(action.confidence_percent).toBeGreaterThanOrEqual(40);
      expect(action.confidence_percent).toBeLessThanOrEqual(98);
    }
  });

  it("every action has a non-empty data_source", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    for (const action of result.reduction_roadmap) {
      expect(action.data_source).toBeDefined();
      expect(action.data_source.length).toBeGreaterThan(5);
    }
  });

  it("reason includes the category contribution percentage", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    for (const action of result.reduction_roadmap) {
      expect(action.reason).toMatch(/\d+%/);
    }
  });

  it("reason includes category kg CO₂e value", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    for (const action of result.reduction_roadmap) {
      expect(action.reason).toMatch(/\d+(\.\d+)? kg CO₂e/);
    }
  });

  it("reason includes risk score out of 100", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    for (const action of result.reduction_roadmap) {
      expect(action.reason).toMatch(/\d+\/100/);
    }
  });
});

describe("Carbon Intelligence Explainability Summary", () => {
  it("includes explainability section in output", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    expect(result.explainability).toBeDefined();
  });

  it("total_estimated_annual_savings_kg is positive", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    expect(result.explainability.total_estimated_annual_savings_kg).toBeGreaterThan(0);
  });

  it("average_confidence_percent is between 40 and 98", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    expect(result.explainability.average_confidence_percent).toBeGreaterThanOrEqual(40);
    expect(result.explainability.average_confidence_percent).toBeLessThanOrEqual(98);
  });

  it("data_sources is a non-empty unique array", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    expect(result.explainability.data_sources.length).toBeGreaterThan(0);
    // Check uniqueness
    const unique = new Set(result.explainability.data_sources);
    expect(unique.size).toBe(result.explainability.data_sources.length);
  });

  it("methodology is a non-empty string", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    expect(result.explainability.methodology.length).toBeGreaterThan(50);
  });

  it("methodology mentions IPCC", () => {
    const result = analyzeCarbon(BASELINE_INPUT);
    expect(result.explainability.methodology).toContain("IPCC");
  });
});

describe("Category calculators (existing behavior preserved)", () => {
  it("calculateDietMonthly returns positive for non-veg", () => {
    const result = calculateDietMonthly(BASELINE_INPUT.diet);
    expect(result).toBeGreaterThan(0);
  });

  it("calculateTravelMonthly returns positive for car commuter", () => {
    const result = calculateTravelMonthly(BASELINE_INPUT.travel);
    expect(result).toBeGreaterThan(0);
  });

  it("calculateElectricityMonthly returns positive for grid", () => {
    const result = calculateElectricityMonthly(BASELINE_INPUT.electricity);
    expect(result).toBeGreaterThan(0);
  });

  it("calculateShoppingMonthly returns positive for fast fashion", () => {
    const result = calculateShoppingMonthly(BASELINE_INPUT.shopping);
    expect(result).toBeGreaterThan(0);
  });

  it("calculateWasteMonthly returns positive for low recycler", () => {
    const result = calculateWasteMonthly(BASELINE_INPUT.waste);
    expect(result).toBeGreaterThan(0);
  });

  it("vegan diet produces lower emissions than beef diet", () => {
    const vegan = calculateDietMonthly({ ...BASELINE_INPUT.diet, food_type: "vegan" });
    const beef = calculateDietMonthly({ ...BASELINE_INPUT.diet, food_type: "non_veg_beef" });
    expect(vegan).toBeLessThan(beef);
  });

  it("walking produces lower travel emissions than car", () => {
    const walk = calculateTravelMonthly({ ...BASELINE_INPUT.travel, commute_mode: "walk_cycle" });
    const car = calculateTravelMonthly(BASELINE_INPUT.travel);
    expect(walk).toBeLessThan(car);
  });

  it("full solar produces lower electricity emissions than grid", () => {
    const solar = calculateElectricityMonthly({ ...BASELINE_INPUT.electricity, energy_source: "full_solar" });
    const grid = calculateElectricityMonthly(BASELINE_INPUT.electricity);
    expect(solar).toBeLessThan(grid);
  });
});
