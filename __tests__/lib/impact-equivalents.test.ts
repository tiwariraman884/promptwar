import { describe, it, expect } from "vitest";
import {
  toEquivalents,
  generateStoryText,
  generateMonthlyStories,
} from "@/lib/impact-equivalents";

describe("toEquivalents", () => {
  it("returns LED and chai for small values (0.1 kg)", () => {
    const result = toEquivalents(0.1);
    expect(result.length).toBeGreaterThanOrEqual(1);
    const emojis = result.map((r) => r.emoji);
    expect(emojis).toContain("💡");
    expect(emojis).toContain("☕");
  });

  it("includes driving equivalent for medium values (5 kg)", () => {
    const result = toEquivalents(5);
    const emojis = result.map((r) => r.emoji);
    expect(emojis).toContain("🚗");
    expect(emojis).toContain("🌳");
  });

  it("returns empty for near-zero values", () => {
    const result = toEquivalents(0.001);
    expect(result).toHaveLength(0);
  });

  it("counts are positive integers", () => {
    const result = toEquivalents(10);
    result.forEach((eq) => {
      expect(eq.count).toBeGreaterThan(0);
      expect(Number.isInteger(eq.count)).toBe(true);
    });
  });
});

describe("generateStoryText", () => {
  it("generates meaningful story for positive savings", () => {
    const story = generateStoryText(10, "This month", "Raman");
    expect(story).toContain("Raman");
    expect(story).toContain("10.0 kg CO₂");
    expect(story).toContain("GreenStep");
  });

  it("returns fallback for zero savings", () => {
    const story = generateStoryText(0, "This month", "Raman");
    expect(story).toContain("tracking");
  });
});

describe("generateMonthlyStories", () => {
  it("returns stories for significant savings", () => {
    const stories = generateMonthlyStories(15, "transport", "Priya");
    expect(stories.length).toBeGreaterThanOrEqual(3);
    stories.forEach((s) => {
      expect(s.emoji).toBeTruthy();
      expect(s.headline).toBeTruthy();
    });
  });

  it("returns empty for zero savings", () => {
    const stories = generateMonthlyStories(0, "transport", "Priya");
    expect(stories).toHaveLength(0);
  });
});
