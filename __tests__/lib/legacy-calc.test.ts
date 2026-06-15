import { describe, it, expect } from "vitest";
import {
  calculateLifetimeCO2,
  calculateSavings,
  getComparisonToAverage,
  getLifetimeMilestones,
} from "@/lib/legacy-calc";

describe("calculateLifetimeCO2", () => {
  it("calculates lifetime emissions for a 25-year-old at 5 kg/day", () => {
    const result = calculateLifetimeCO2(25, 75, 5);
    // 50 years remaining * 365 * 5 = 91,250 kg
    expect(result.lifetimeKg).toBe(91250);
    expect(result.lifetimeTonnes).toBe(91.25);
    expect(result.yearsRemaining).toBe(50);
  });

  it("returns zero when age equals lifespan", () => {
    const result = calculateLifetimeCO2(80, 80, 10);
    expect(result.lifetimeKg).toBe(0);
    expect(result.yearsRemaining).toBe(0);
  });

  it("returns zero when age exceeds lifespan", () => {
    const result = calculateLifetimeCO2(90, 80, 10);
    expect(result.lifetimeKg).toBe(0);
  });

  it("calculates temperature contribution in micro-degrees", () => {
    const result = calculateLifetimeCO2(25, 75, 5);
    expect(result.temperatureContribution).toBeGreaterThan(0);
  });
});

describe("calculateSavings", () => {
  it("calculates savings between two trajectories", () => {
    const current = calculateLifetimeCO2(25, 75, 10);
    const goal = calculateLifetimeCO2(25, 75, 5);
    const savings = calculateSavings(current, goal);

    expect(savings.kgSaved).toBe(current.lifetimeKg - goal.lifetimeKg);
    expect(savings.percentReduction).toBeCloseTo(50, 0);
  });
});

describe("getComparisonToAverage", () => {
  it("returns green for below average", () => {
    const result = getComparisonToAverage(3);
    expect(result.tone).toBe("green");
    expect(result.vsAverage).toBeLessThan(0);
  });

  it("returns amber for near average", () => {
    const result = getComparisonToAverage(5.2);
    expect(result.tone).toBe("amber");
  });

  it("returns red for above average", () => {
    const result = getComparisonToAverage(10);
    expect(result.tone).toBe("red");
    expect(result.vsAverage).toBeGreaterThan(0);
  });
});

describe("getLifetimeMilestones", () => {
  it("generates deduplicated milestones", () => {
    const milestones = getLifetimeMilestones(30, 80, 5);
    const ages = milestones.map((m) => m.age);
    // Should include 30, 40, 50, 60, 70, 80
    expect(ages).toContain(30);
    expect(ages).toContain(80);
    // No duplicates
    expect(new Set(ages).size).toBe(ages.length);
  });

  it("labels current age as 'Now'", () => {
    const milestones = getLifetimeMilestones(25, 80, 5);
    expect(milestones[0].label).toBe("Now");
    expect(milestones[0].cumulativeKg).toBe(0);
  });
});
