import { describe, it, expect } from "vitest";
import {
  analyzeCarbon,
  calculateDietMonthly,
  calculateTravelMonthly,
  calculateElectricityMonthly,
  calculateShoppingMonthly,
  calculateWasteMonthly,
  type CarbonIntelligenceInput,
  type CarbonIntelligenceOutput,
} from "@/lib/carbon-intelligence";

/* ─── Fixtures ─── */

const LOW_IMPACT_INPUT: CarbonIntelligenceInput = {
  diet: { food_type: "vegan", frequency: "two", meat_dairy_level: "none", local_vs_imported: "mostly_local" },
  travel: { commute_mode: "walk_cycle", km_per_week: 20, flights_per_year: 0 },
  electricity: { monthly_kwh: 50, energy_source: "full_solar", appliance_usage: "minimal" },
  shopping: { monthly_purchases: 1, fashion_type: "sustainable", electronics_frequency: "rarely" },
  waste: { weekly_waste_kg: 1, recycling_percent: 80, composting: true, plastic_usage: "minimal" },
  current_month: 1,
};

const HIGH_IMPACT_INPUT: CarbonIntelligenceInput = {
  diet: { food_type: "non_veg_beef", frequency: "three", meat_dairy_level: "high", local_vs_imported: "mostly_imported" },
  travel: { commute_mode: "car", km_per_week: 300, flights_per_year: 12, vehicle_type: "diesel" },
  electricity: { monthly_kwh: 800, energy_source: "grid_only", appliance_usage: "heavy" },
  shopping: { monthly_purchases: 15, fashion_type: "fast_fashion", electronics_frequency: "frequently" },
  waste: { weekly_waste_kg: 15, recycling_percent: 5, composting: false, plastic_usage: "heavy" },
  current_month: 5,
};

const MODERATE_INPUT: CarbonIntelligenceInput = {
  diet: { food_type: "vegetarian", frequency: "three", meat_dairy_level: "moderate", local_vs_imported: "mixed" },
  travel: { commute_mode: "public_transport", km_per_week: 50, flights_per_year: 2 },
  electricity: { monthly_kwh: 200, energy_source: "grid_only", appliance_usage: "moderate" },
  shopping: { monthly_purchases: 5, fashion_type: "mixed", electronics_frequency: "occasionally" },
  waste: { weekly_waste_kg: 5, recycling_percent: 30, composting: false, plastic_usage: "moderate" },
  current_month: 7,
};

/* ─── Category Calculators ─── */

describe("calculateDietMonthly", () => {
  it("returns lower emissions for vegan vs beef diet", () => {
    const vegan = calculateDietMonthly({ food_type: "vegan", frequency: "three", meat_dairy_level: "none", local_vs_imported: "mostly_local" });
    const beef = calculateDietMonthly({ food_type: "non_veg_beef", frequency: "three", meat_dairy_level: "high", local_vs_imported: "mostly_imported" });
    expect(vegan).toBeLessThan(beef);
  });

  it("returns positive emissions for all diet types", () => {
    const types = ["vegan", "vegetarian", "non_veg_chicken", "non_veg_mixed", "non_veg_beef"] as const;
    for (const food_type of types) {
      const result = calculateDietMonthly({ food_type, frequency: "three", meat_dairy_level: "moderate", local_vs_imported: "mixed" });
      expect(result).toBeGreaterThan(0);
    }
  });

  it("lower frequency reduces emissions", () => {
    const one = calculateDietMonthly({ food_type: "vegetarian", frequency: "one", meat_dairy_level: "moderate", local_vs_imported: "mixed" });
    const three = calculateDietMonthly({ food_type: "vegetarian", frequency: "three", meat_dairy_level: "moderate", local_vs_imported: "mixed" });
    expect(one).toBeLessThan(three);
  });

  it("local produce reduces emissions", () => {
    const local = calculateDietMonthly({ food_type: "vegetarian", frequency: "three", meat_dairy_level: "moderate", local_vs_imported: "mostly_local" });
    const imported = calculateDietMonthly({ food_type: "vegetarian", frequency: "three", meat_dairy_level: "moderate", local_vs_imported: "mostly_imported" });
    expect(local).toBeLessThan(imported);
  });
});

describe("calculateTravelMonthly", () => {
  it("walk/cycle produces zero commute emissions", () => {
    const result = calculateTravelMonthly({ commute_mode: "walk_cycle", km_per_week: 50, flights_per_year: 0 });
    expect(result).toBe(0);
  });

  it("car produces higher emissions than public transport", () => {
    const car = calculateTravelMonthly({ commute_mode: "car", km_per_week: 50, flights_per_year: 0, vehicle_type: "petrol" });
    const pt = calculateTravelMonthly({ commute_mode: "public_transport", km_per_week: 50, flights_per_year: 0 });
    expect(car).toBeGreaterThan(pt);
  });

  it("flights add monthly emissions even with walk commute", () => {
    const noFlight = calculateTravelMonthly({ commute_mode: "walk_cycle", km_per_week: 0, flights_per_year: 0 });
    const withFlights = calculateTravelMonthly({ commute_mode: "walk_cycle", km_per_week: 0, flights_per_year: 6 });
    expect(withFlights).toBeGreaterThan(noFlight);
  });

  it("electric car produces less emissions than petrol", () => {
    const ev = calculateTravelMonthly({ commute_mode: "car", km_per_week: 100, flights_per_year: 0, vehicle_type: "electric" });
    const petrol = calculateTravelMonthly({ commute_mode: "car", km_per_week: 100, flights_per_year: 0, vehicle_type: "petrol" });
    expect(ev).toBeLessThan(petrol);
  });
});

describe("calculateElectricityMonthly", () => {
  it("full solar drastically reduces emissions", () => {
    const grid = calculateElectricityMonthly({ monthly_kwh: 200, energy_source: "grid_only", appliance_usage: "moderate" });
    const solar = calculateElectricityMonthly({ monthly_kwh: 200, energy_source: "full_solar", appliance_usage: "moderate" });
    expect(solar).toBeLessThan(grid * 0.3);
  });

  it("heavy appliance usage increases emissions", () => {
    const minimal = calculateElectricityMonthly({ monthly_kwh: 200, energy_source: "grid_only", appliance_usage: "minimal" });
    const heavy = calculateElectricityMonthly({ monthly_kwh: 200, energy_source: "grid_only", appliance_usage: "heavy" });
    expect(heavy).toBeGreaterThan(minimal);
  });

  it("zero kWh produces zero emissions", () => {
    const result = calculateElectricityMonthly({ monthly_kwh: 0, energy_source: "grid_only", appliance_usage: "heavy" });
    expect(result).toBe(0);
  });
});

describe("calculateShoppingMonthly", () => {
  it("sustainable fashion produces less than fast fashion", () => {
    const sustainable = calculateShoppingMonthly({ monthly_purchases: 5, fashion_type: "sustainable", electronics_frequency: "rarely" });
    const fast = calculateShoppingMonthly({ monthly_purchases: 5, fashion_type: "fast_fashion", electronics_frequency: "rarely" });
    expect(sustainable).toBeLessThan(fast);
  });

  it("frequent electronics increases emissions", () => {
    const rarely = calculateShoppingMonthly({ monthly_purchases: 0, fashion_type: "sustainable", electronics_frequency: "rarely" });
    const frequently = calculateShoppingMonthly({ monthly_purchases: 0, fashion_type: "sustainable", electronics_frequency: "frequently" });
    expect(frequently).toBeGreaterThan(rarely);
  });
});

describe("calculateWasteMonthly", () => {
  it("high recycling reduces emissions vs landfill-only", () => {
    const lowRecycle = calculateWasteMonthly({ weekly_waste_kg: 5, recycling_percent: 0, composting: false, plastic_usage: "moderate" });
    const highRecycle = calculateWasteMonthly({ weekly_waste_kg: 5, recycling_percent: 80, composting: true, plastic_usage: "minimal" });
    expect(highRecycle).toBeLessThan(lowRecycle);
  });

  it("zero waste produces zero emissions", () => {
    const result = calculateWasteMonthly({ weekly_waste_kg: 0, recycling_percent: 50, composting: true, plastic_usage: "minimal" });
    expect(result).toBe(0);
  });
});

/* ─── Main Engine: analyzeCarbon ─── */

describe("analyzeCarbon", () => {
  describe("carbon_risk_score", () => {
    it("returns overall score between 0 and 100", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      expect(result.carbon_risk_score.overall).toBeGreaterThanOrEqual(0);
      expect(result.carbon_risk_score.overall).toBeLessThanOrEqual(100);
    });

    it("low-impact lifestyle produces Low risk tier", () => {
      const result = analyzeCarbon(LOW_IMPACT_INPUT);
      expect(result.carbon_risk_score.risk_tier).toBe("Low");
    });

    it("high-impact lifestyle produces High or Critical risk tier", () => {
      const result = analyzeCarbon(HIGH_IMPACT_INPUT);
      expect(["High", "Critical"]).toContain(result.carbon_risk_score.risk_tier);
    });

    it("all category breakdowns are 0–100", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      const { diet, travel, electricity, shopping, waste } = result.carbon_risk_score.category_breakdown;
      for (const score of [diet, travel, electricity, shopping, waste]) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });

    it("has all 5 category keys in breakdown", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      const keys = Object.keys(result.carbon_risk_score.category_breakdown);
      expect(keys).toEqual(expect.arrayContaining(["diet", "travel", "electricity", "shopping", "waste"]));
      expect(keys).toHaveLength(5);
    });

    it("india_comparison is a non-empty string", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      expect(result.carbon_risk_score.india_comparison).toBeTruthy();
      expect(typeof result.carbon_risk_score.india_comparison).toBe("string");
    });
  });

  describe("monthly_forecast", () => {
    it("returns positive monthly values", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      expect(result.monthly_forecast.month_1_kg).toBeGreaterThan(0);
      expect(result.monthly_forecast.month_2_kg).toBeGreaterThan(0);
      expect(result.monthly_forecast.month_3_kg).toBeGreaterThan(0);
    });

    it("trend is one of the valid values", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      expect(["Improving", "Stable", "Worsening"]).toContain(result.monthly_forecast.trend);
    });

    it("seasonal_note is a non-empty string", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      expect(result.monthly_forecast.seasonal_note).toBeTruthy();
    });
  });

  describe("reduction_roadmap", () => {
    it("contains exactly 5 actions", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      expect(result.reduction_roadmap).toHaveLength(5);
    });

    it("actions are ranked 1 through 5", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      const ranks = result.reduction_roadmap.map((a) => a.rank);
      expect(ranks).toEqual([1, 2, 3, 4, 5]);
    });

    it("each action has required fields", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      for (const action of result.reduction_roadmap) {
        expect(action.action_title).toBeTruthy();
        expect(action.estimated_monthly_reduction_kg).toBeGreaterThan(0);
        expect(["Easy", "Medium", "Hard"]).toContain(action.effort_level);
        expect(action.india_tip).toBeTruthy();
      }
    });

    it("actions are sorted by reduction impact (descending)", () => {
      const result = analyzeCarbon(HIGH_IMPACT_INPUT);
      for (let i = 0; i < result.reduction_roadmap.length - 1; i++) {
        expect(result.reduction_roadmap[i].estimated_monthly_reduction_kg)
          .toBeGreaterThanOrEqual(result.reduction_roadmap[i + 1].estimated_monthly_reduction_kg);
      }
    });

    it("still returns 5 actions even for low-impact input", () => {
      const result = analyzeCarbon(LOW_IMPACT_INPUT);
      expect(result.reduction_roadmap).toHaveLength(5);
    });
  });

  describe("predicted_emissions_timeline", () => {
    it("business_as_usual has exactly 6 values", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      expect(result.predicted_emissions_timeline.business_as_usual).toHaveLength(6);
    });

    it("optimized_path has exactly 6 values", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      expect(result.predicted_emissions_timeline.optimized_path).toHaveLength(6);
    });

    it("optimized path values are always <= BAU values", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      const { business_as_usual, optimized_path } = result.predicted_emissions_timeline;
      for (let i = 0; i < 6; i++) {
        expect(optimized_path[i]).toBeLessThanOrEqual(business_as_usual[i]);
      }
    });

    it("optimized path values are non-negative", () => {
      const result = analyzeCarbon(HIGH_IMPACT_INPUT);
      for (const val of result.predicted_emissions_timeline.optimized_path) {
        expect(val).toBeGreaterThanOrEqual(0);
      }
    });

    it("total_annual_savings_kg is positive when roadmap has reductions", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      expect(result.predicted_emissions_timeline.total_annual_savings_kg).toBeGreaterThan(0);
    });

    it("annual savings is consistent with BAU minus optimized", () => {
      const result = analyzeCarbon(MODERATE_INPUT);
      const { business_as_usual, optimized_path, total_annual_savings_kg } = result.predicted_emissions_timeline;
      const sixMonthSavings = business_as_usual.reduce((s, v) => s + v, 0) - optimized_path.reduce((s, v) => s + v, 0);
      // annual = 6-month * 2 (as implemented)
      expect(total_annual_savings_kg).toBeCloseTo(sixMonthSavings * 2, 0);
    });
  });

  describe("output JSON schema compliance", () => {
    it("matches the exact required schema structure", () => {
      const result: CarbonIntelligenceOutput = analyzeCarbon(MODERATE_INPUT);

      // Top-level keys
      expect(result).toHaveProperty("carbon_risk_score");
      expect(result).toHaveProperty("monthly_forecast");
      expect(result).toHaveProperty("reduction_roadmap");
      expect(result).toHaveProperty("predicted_emissions_timeline");

      // carbon_risk_score
      expect(typeof result.carbon_risk_score.overall).toBe("number");
      expect(typeof result.carbon_risk_score.risk_tier).toBe("string");
      expect(typeof result.carbon_risk_score.india_comparison).toBe("string");

      // monthly_forecast
      expect(typeof result.monthly_forecast.month_1_kg).toBe("number");
      expect(typeof result.monthly_forecast.month_2_kg).toBe("number");
      expect(typeof result.monthly_forecast.month_3_kg).toBe("number");
      expect(typeof result.monthly_forecast.trend).toBe("string");
      expect(typeof result.monthly_forecast.seasonal_note).toBe("string");

      // reduction_roadmap
      expect(Array.isArray(result.reduction_roadmap)).toBe(true);

      // predicted_emissions_timeline
      expect(Array.isArray(result.predicted_emissions_timeline.business_as_usual)).toBe(true);
      expect(Array.isArray(result.predicted_emissions_timeline.optimized_path)).toBe(true);
      expect(typeof result.predicted_emissions_timeline.total_annual_savings_kg).toBe("number");
    });
  });
});
