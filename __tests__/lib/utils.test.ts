import { describe, it, expect } from "vitest";
import { clamp, formatKg, formatPercent, formatDateLabel, getGreeting } from "@/lib/utils";

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to min when below", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to max when above", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("handles min === max", () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

describe("formatKg", () => {
  it("formats positive value with 1 decimal", () => {
    expect(formatKg(12.345)).toBe("12.3 kg");
  });

  it("formats zero", () => {
    expect(formatKg(0)).toBe("0.0 kg");
  });

  it("respects custom digits", () => {
    expect(formatKg(12.345, 2)).toBe("12.35 kg");
  });
});

describe("formatPercent", () => {
  it("formats 100%", () => {
    expect(formatPercent(100)).toBe("100%");
  });

  it("formats 0%", () => {
    expect(formatPercent(0)).toBe("0%");
  });

  it("formats with decimals", () => {
    expect(formatPercent(33.333, 1)).toBe("33.3%");
  });
});

describe("formatDateLabel", () => {
  it("formats date string to Indian locale", () => {
    const label = formatDateLabel("2024-03-15");
    expect(label).toMatch(/15/); // Day should be present
    expect(label).toMatch(/Mar/); // Month should be present
  });

  it("accepts Date object", () => {
    const label = formatDateLabel(new Date(2024, 0, 1));
    expect(label).toMatch(/01/);
    expect(label).toMatch(/Jan/);
  });
});

describe("getGreeting", () => {
  it("returns morning before 12", () => {
    expect(getGreeting(new Date(2024, 0, 1, 9))).toBe("Good morning");
  });

  it("returns afternoon between 12 and 17", () => {
    expect(getGreeting(new Date(2024, 0, 1, 14))).toBe("Good afternoon");
  });

  it("returns evening after 17", () => {
    expect(getGreeting(new Date(2024, 0, 1, 20))).toBe("Good evening");
  });

  it("returns morning at midnight", () => {
    expect(getGreeting(new Date(2024, 0, 1, 0))).toBe("Good morning");
  });
});
