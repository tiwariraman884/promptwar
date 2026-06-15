import { describe, it, expect } from "vitest";
import {
  entryBodySchema,
  paginationSchema,
  aiCoachSchema,
  geocodeSchema,
  formatZodError,
} from "@/lib/validations";
import { z } from "zod";

describe("entryBodySchema", () => {
  it("accepts valid transport entry", () => {
    const result = entryBodySchema.safeParse({
      category: "transport",
      input: { mode: "petrol_car", distanceKm: 10 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing category", () => {
    const result = entryBodySchema.safeParse({
      input: { mode: "petrol_car" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = entryBodySchema.safeParse({
      category: "flying_carpet",
      input: {},
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = entryBodySchema.safeParse({
      category: "diet",
      input: { dietType: "vegan" },
      notes: "Ate only salad today",
      entry_date: "2024-03-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects notes over 500 chars", () => {
    const result = entryBodySchema.safeParse({
      category: "diet",
      input: {},
      notes: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("paginationSchema", () => {
  it("provides defaults for empty input", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("coerces string numbers", () => {
    const result = paginationSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = paginationSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects page 0 or negative", () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

describe("aiCoachSchema", () => {
  it("accepts valid messages", () => {
    const result = aiCoachSchema.safeParse({
      messages: [{ role: "user", content: "How can I reduce my footprint?" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages array", () => {
    const result = aiCoachSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = aiCoachSchema.safeParse({
      messages: [{ role: "user", content: "" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("geocodeSchema", () => {
  it("accepts valid address", () => {
    const result = geocodeSchema.safeParse({ address: "Haridwar, Uttarakhand" });
    expect(result.success).toBe(true);
  });

  it("rejects empty address", () => {
    const result = geocodeSchema.safeParse({ address: "" });
    expect(result.success).toBe(false);
  });
});

describe("formatZodError", () => {
  it("formats single error", () => {
    const result = entryBodySchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain("category");
    }
  });

  it("formats multiple errors with semicolons", () => {
    const result = entryBodySchema.safeParse({ notes: "x".repeat(501) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain(";");
    }
  });
});
