/* ─── Impact Equivalents for Shareable Stories ─── */

interface Equivalent {
  emoji: string;
  text: string;
  detail: string;
  threshold: number; // minimum kg CO₂ saved to show this
}

const EQUIVALENTS: Equivalent[] = [
  { emoji: "💡", threshold: 0.1, text: "LED bulbs powered for a day", detail: "1 LED bulb uses ~0.07 kg CO₂/day" },
  { emoji: "☕", threshold: 0.05, text: "cups of chai boiled", detail: "1 cup of chai ≈ 0.05 kg CO₂" },
  { emoji: "📱", threshold: 0.01, text: "smartphone charges", detail: "1 full charge ≈ 0.007 kg CO₂" },
  { emoji: "🌳", threshold: 5, text: "days of tree absorption", detail: "1 tree absorbs ~0.06 kg CO₂/day" },
  { emoji: "🚗", threshold: 1, text: "km of car driving avoided", detail: "1 km driving ≈ 0.15 kg CO₂" },
  { emoji: "✈️", threshold: 100, text: "domestic flight hours avoided", detail: "1 hour of domestic flight ≈ 150 kg CO₂" },
  { emoji: "🥟", threshold: 0.3, text: "samosas guilt-free", detail: "Cooking 1 samosa ≈ 0.03 kg CO₂" },
  { emoji: "🚿", threshold: 0.5, text: "hot bucket baths saved", detail: "1 electric geyser bath ≈ 0.66 kg CO₂" },
  { emoji: "📦", threshold: 2, text: "delivery orders avoided", detail: "1 food delivery ≈ 0.8 kg CO₂ extra" },
  { emoji: "🧊", threshold: 3, text: "hours of AC runtime offset", detail: "1 hour AC ≈ 1.2 kg CO₂" },
];

/**
 * Convert a CO₂ saving (kg) into relatable equivalents
 */
export function toEquivalents(kgCO2Saved: number): Array<{ emoji: string; count: number; text: string; detail: string }> {
  const results: Array<{ emoji: string; count: number; text: string; detail: string }> = [];

  if (kgCO2Saved >= 0.01) {
    results.push({ emoji: "💡", count: Math.round(kgCO2Saved / 0.07), text: "LED bulbs powered for a day", detail: "1 LED bulb uses ~0.07 kg CO₂/day" });
  }
  if (kgCO2Saved >= 0.05) {
    results.push({ emoji: "☕", count: Math.round(kgCO2Saved / 0.05), text: "cups of chai", detail: "1 cup ≈ 0.05 kg CO₂" });
  }
  if (kgCO2Saved >= 1) {
    results.push({ emoji: "🚗", count: Math.round(kgCO2Saved / 0.15), text: "km of driving avoided", detail: "1 km ≈ 0.15 kg CO₂" });
  }
  if (kgCO2Saved >= 5) {
    results.push({ emoji: "🌳", count: Math.round(kgCO2Saved / 0.06), text: "tree-days of absorption", detail: "1 tree absorbs ~0.06 kg CO₂/day" });
  }
  if (kgCO2Saved >= 0.3) {
    results.push({ emoji: "🥟", count: Math.round(kgCO2Saved / 0.03), text: "samosas' worth of guilt-free eating", detail: "1 samosa ≈ 0.03 kg CO₂" });
  }

  return results;
}

/**
 * Generate a shareable impact story string
 */
export function generateStoryText(kgSaved: number, period: string, userName: string): string {
  const equivalents = toEquivalents(kgSaved);
  if (equivalents.length === 0) return `${userName} is tracking their carbon footprint on GreenStep! 🌱`;

  const best = equivalents[0];
  return `${period}, ${userName} saved ${kgSaved.toFixed(1)} kg CO₂ — that's ${best.count} ${best.text}! ${best.emoji}\n\nTrack yours → GreenStep 🌱`;
}

/**
 * Generate multiple story cards for a user's monthly data
 */
export function generateMonthlyStories(
  kgSaved: number,
  topCategory: string,
  userName: string,
): Array<{ emoji: string; headline: string; detail: string }> {
  const stories: Array<{ emoji: string; headline: string; detail: string }> = [];

  if (kgSaved > 0) {
    const ledCount = Math.round(kgSaved / 0.07);
    stories.push({
      emoji: "💡",
      headline: `Saved enough CO₂ to power ${ledCount} LED bulbs for a day`,
      detail: `${kgSaved.toFixed(1)} kg CO₂ saved this month`,
    });
  }

  if (kgSaved >= 5) {
    const treeDays = Math.round(kgSaved / 0.06);
    stories.push({
      emoji: "🌳",
      headline: `Equal to ${treeDays} days of a tree absorbing CO₂`,
      detail: `That's like planting ${(kgSaved / 21.77).toFixed(1)} trees for a year`,
    });
  }

  if (kgSaved >= 1) {
    const km = Math.round(kgSaved / 0.15);
    stories.push({
      emoji: "🚶",
      headline: `Walked the equivalent of ${km} km instead of driving`,
      detail: `Your ${topCategory} choices made the biggest difference`,
    });
  }

  if (kgSaved >= 0.5) {
    const samosas = Math.round(kgSaved / 0.03);
    stories.push({
      emoji: "🥟",
      headline: `That's ${samosas} samosas' worth of guilt-free eating`,
      detail: `Small wins add up to big impact!`,
    });
  }

  return stories;
}
