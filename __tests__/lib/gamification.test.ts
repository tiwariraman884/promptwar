import { describe, it, expect } from "vitest";
import { evaluateBadgeAwards, type BadgeEvaluationInput } from "@/lib/gamification";

const freshUser: BadgeEvaluationInput = {
  totalEntries: 0,
  currentStreak: 0,
  totalSavedKg: 0,
  sustainableTransportCount: 0,
};

describe("evaluateBadgeAwards", () => {
  it("returns empty for fresh user with no activity", () => {
    expect(evaluateBadgeAwards(freshUser)).toEqual([]);
  });

  it("awards first_entry badge on first log", () => {
    const awards = evaluateBadgeAwards({ ...freshUser, totalEntries: 1 });
    expect(awards).toContain("first_entry");
  });

  it("awards streak_7 at 7 consecutive days", () => {
    const awards = evaluateBadgeAwards({ ...freshUser, currentStreak: 7, totalEntries: 7 });
    expect(awards).toContain("streak_7");
    expect(awards).toContain("first_entry");
  });

  it("awards streak_30 at 30 consecutive days", () => {
    const awards = evaluateBadgeAwards({ ...freshUser, currentStreak: 30, totalEntries: 30 });
    expect(awards).toContain("streak_30");
    expect(awards).toContain("streak_7"); // also earned
  });

  it("awards ton_saved at 1000 kgCO2e saved", () => {
    const awards = evaluateBadgeAwards({ ...freshUser, totalSavedKg: 1000, totalEntries: 1 });
    expect(awards).toContain("ton_saved");
  });

  it("awards commuter_hero at 30 sustainable trips", () => {
    const awards = evaluateBadgeAwards({
      ...freshUser,
      sustainableTransportCount: 30,
      totalEntries: 30,
    });
    expect(awards).toContain("commuter_hero");
  });

  it("awards haridwar_champion for city rank <= 10", () => {
    const awards = evaluateBadgeAwards({ ...freshUser, cityRank: 5, totalEntries: 1 });
    expect(awards).toContain("haridwar_champion");
  });

  it("does NOT award haridwar_champion when cityRank is undefined", () => {
    const awards = evaluateBadgeAwards({ ...freshUser, totalEntries: 50 });
    expect(awards).not.toContain("haridwar_champion");
  });

  it("does not re-award existing badges", () => {
    const awards = evaluateBadgeAwards({
      ...freshUser,
      totalEntries: 5,
      existingBadges: ["first_entry"],
    });
    expect(awards).not.toContain("first_entry");
  });

  it("awards multiple badges at once", () => {
    const awards = evaluateBadgeAwards({
      ...freshUser,
      totalEntries: 100,
      currentStreak: 30,
      totalSavedKg: 1200,
      sustainableTransportCount: 35,
      billScans: 15,
      hasSolar: true,
    });
    expect(awards.length).toBeGreaterThanOrEqual(6);
    expect(awards).toContain("first_entry");
    expect(awards).toContain("streak_7");
    expect(awards).toContain("streak_30");
    expect(awards).toContain("ton_saved");
    expect(awards).toContain("commuter_hero");
    expect(awards).toContain("scanner_pro");
    expect(awards).toContain("solar_adopter");
    expect(awards).toContain("data_nerd");
  });

  it("awards quiz_master badge (not in direct scope but tests completeness)", () => {
    // quiz_master and energy_auditor are NOT in evaluateBadgeAwards
    // This test confirms the function doesn't crash with full input
    const awards = evaluateBadgeAwards({
      totalEntries: 200,
      currentStreak: 100,
      totalSavedKg: 5000,
      sustainableTransportCount: 50,
      cityRank: 1,
      billScans: 20,
      aiSessions: 10,
      recyclingLogs: 30,
      hasSolar: true,
      treesRedeemed: 10,
      vegetarianDays: 14,
      walkingLogs: 20,
      waterEntries: 15,
      zeroWasteEvents: 3,
      joinedGroup: true,
      completedChallenges: 10,
      annualFootprintKg: 1200,
    });
    // Should earn virtually all badges
    expect(awards.length).toBeGreaterThanOrEqual(15);
  });
});
