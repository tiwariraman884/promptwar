/**
 * Quick Wins Carbon Reduction Data
 * ─────────────────────────────────
 * Structured tip data for the Quick Wins carousel component.
 *
 * To add a new tip:
 * 1. Add a new object to the QUICK_WINS_DATA array below.
 * 2. Set `category` to one of: "small-habit" | "big-impact" | "india-specific"
 * 3. All fields are required — see the QuickWinTip type for schema.
 * 4. The component auto-discovers new entries and updates filter counts.
 */

export type QuickWinCategory = "small-habit" | "big-impact" | "india-specific";

export interface QuickWinTip {
  id: string;
  category: QuickWinCategory;
  icon: string;
  iconLabel: string;
  title: string;
  shortDescription: string;
  monthlySavings: number;
  whyItMatters: string;
  howTo: string[];
  indiaContext: string;
  sourceName: string;
  sourceUrl: string;
}

export const CATEGORY_META: Record<QuickWinCategory, { label: string; color: string; bgLight: string; bgDark: string }> = {
  "small-habit": {
    label: "Small Habit",
    color: "#52B788",
    bgLight: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300",
    bgDark: "bg-emerald-700",
  },
  "big-impact": {
    label: "Big Impact",
    color: "#F59E0B",
    bgLight: "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300",
    bgDark: "bg-amber-600",
  },
  "india-specific": {
    label: "India-Specific",
    color: "#6366F1",
    bgLight: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/25 dark:text-indigo-300",
    bgDark: "bg-indigo-600",
  },
};

export const QUICK_WINS_DATA: QuickWinTip[] = [
  // ── SMALL HABIT ──
  {
    id: "metro-3x",
    category: "small-habit",
    icon: "🚆",
    iconLabel: "Train",
    title: "Switch to Metro 3x/Week",
    shortDescription: "Haridwar–Dehradun commuters can combine rail, bus, and e-rickshaw connections instead of driving the entire route.",
    monthlySavings: 8.4,
    whyItMatters: "Metro systems and electric public transport move large numbers of passengers efficiently, significantly lowering emissions per passenger-kilometre compared to private vehicles.",
    howTo: [
      "Use metro/rail for 3 weekly commutes",
      "Combine with e-rickshaws for first/last-mile travel",
      "Use digital route planners for optimal connections",
    ],
    indiaContext: "Delhi Metro and other electric transit systems offer lower-carbon mobility. Combining Indian Railways, Roadways buses, and e-rickshaws is practical for many Uttarakhand commuters.",
    sourceName: "Delhi Metro Rail Corporation",
    sourceUrl: "https://www.delhimetrorail.com",
  },
  {
    id: "delivery-2x-less",
    category: "small-habit",
    icon: "🍽",
    iconLabel: "Plate",
    title: "Order Delivery 2x Less per Week",
    shortDescription: "Pickup or home cooking cuts delivery distance and packaging waste.",
    monthlySavings: 3.2,
    whyItMatters: "Food delivery contributes emissions through transportation and single-use packaging.",
    howTo: [
      "Batch meal orders into fewer deliveries",
      "Cook at home more often",
      "Pick up nearby orders when possible",
    ],
    indiaContext: "Reducing frequent delivery usage in dense urban areas lowers both vehicle travel and packaging waste.",
    sourceName: "FSSAI",
    sourceUrl: "https://www.fssai.gov.in",
  },
  {
    id: "cloth-bag",
    category: "small-habit",
    icon: "🛍",
    iconLabel: "Shopping bag",
    title: "Carry a Cloth Bag",
    shortDescription: "Avoiding five plastic bags per week is small but repeatable.",
    monthlySavings: 0.2,
    whyItMatters: "Reduces dependence on single-use plastic bags.",
    howTo: [
      "Keep reusable bags in vehicles",
      "Carry foldable bags in backpacks",
    ],
    indiaContext: "Supports compliance with India's plastic reduction initiatives and municipal plastic restrictions.",
    sourceName: "MoEFCC Plastic Waste Management Rules",
    sourceUrl: "https://moef.gov.in",
  },
  {
    id: "bucket-bath",
    category: "small-habit",
    icon: "💧",
    iconLabel: "Water droplet",
    title: "Use Bucket Instead of Shower",
    shortDescription: "Cuts hot water energy and water use together.",
    monthlySavings: 0.8,
    whyItMatters: "Reduces both water use and water-heating energy.",
    howTo: [
      "Use a bucket for daily bathing",
      "Reduce geyser runtime",
    ],
    indiaContext: "Many Indian households rely on electric geysers or LPG water heating.",
    sourceName: "Ministry of Jal Shakti",
    sourceUrl: "https://jalshakti-dowr.gov.in",
  },

  // ── BIG IMPACT ──
  {
    id: "non-veg-swap",
    category: "big-impact",
    icon: "🌱",
    iconLabel: "Seedling",
    title: "Replace One Non-Veg Meal Per Day",
    shortDescription: "Keep the plate familiar with dal, chana, paneer, or soy swaps.",
    monthlySavings: 2.7,
    whyItMatters: "Animal-based foods generally create higher emissions than plant-based proteins.",
    howTo: [
      "Replace one daily meal with dal",
      "Use chana, soy, paneer, rajma, or lentils",
    ],
    indiaContext: "Works naturally within traditional Indian diets without requiring major lifestyle changes.",
    sourceName: "FAO Livestock and Environment",
    sourceUrl: "https://www.fao.org/livestock-environment",
  },
  {
    id: "rooftop-solar",
    category: "big-impact",
    icon: "☀",
    iconLabel: "Sun",
    title: "Explore PM Surya Ghar Rooftop Solar",
    shortDescription: "Estimated at 120 kgCO₂e saved per year for a small home system.",
    monthlySavings: 10.0,
    whyItMatters: "Solar electricity reduces dependence on grid-generated power.",
    howTo: [
      "Check roof suitability",
      "Review subsidy eligibility",
      "Apply through official portal",
    ],
    indiaContext: "PM Surya Ghar: Muft Bijli Yojana provides rooftop solar support for residential households.",
    sourceName: "PM Surya Ghar",
    sourceUrl: "https://pmsuryaghar.gov.in",
  },
  {
    id: "ev-two-wheeler",
    category: "big-impact",
    icon: "🛵",
    iconLabel: "Scooter",
    title: "Switch to Electric Two-Wheeler",
    shortDescription: "Best when your commute is predictable and charging is easy.",
    monthlySavings: 18.0,
    whyItMatters: "EVs typically produce lower lifecycle emissions and significantly lower operating costs.",
    howTo: [
      "Evaluate charging availability",
      "Compare EV scooter models",
      "Calculate monthly fuel savings",
    ],
    indiaContext: "PM E-DRIVE and related EV incentive programs support electric mobility adoption.",
    sourceName: "PM E-DRIVE Scheme",
    sourceUrl: "https://heavyindustries.gov.in/pm-e-drive-scheme",
  },
  {
    id: "rail-over-flight",
    category: "big-impact",
    icon: "🚄",
    iconLabel: "High-speed train",
    title: "Take Rail Instead of One Flight",
    shortDescription: "Indian Railways is a strong option for many short routes.",
    monthlySavings: 23.0,
    whyItMatters: "Rail travel generally produces much lower emissions per passenger-kilometre than aviation.",
    howTo: [
      "Choose rail for domestic trips under ~800 km where practical",
      "Compare travel time vs emissions",
    ],
    indiaContext: "Indian Railways is one of the world's largest rail networks and often provides a practical alternative to short-haul domestic flights.",
    sourceName: "Indian Railways",
    sourceUrl: "https://indianrailways.gov.in",
  },

  // ── INDIA-SPECIFIC ──
  {
    id: "lpg-leak-check",
    category: "india-specific",
    icon: "🔥",
    iconLabel: "Fire",
    title: "Pressure-Check LPG Leaks",
    shortDescription: "Small cooking-efficiency fixes are high-value in Indian homes.",
    monthlySavings: 1.2,
    whyItMatters: "Leaks waste fuel, increase costs, and create safety risks.",
    howTo: [
      "Conduct periodic soap-water leak checks",
      "Inspect regulators and hoses",
      "Follow distributor safety guidelines",
    ],
    indiaContext: "A highly relevant efficiency improvement for LPG-dependent households.",
    sourceName: "MyLPG",
    sourceUrl: "https://mylpg.in",
  },
  {
    id: "compost-flowers",
    category: "india-specific",
    icon: "♻",
    iconLabel: "Recycling",
    title: "Compost Flowers and Peels",
    shortDescription: "Great fit for households near local gardens and temple areas.",
    monthlySavings: 2.4,
    whyItMatters: "Organic waste in landfills generates methane.",
    howTo: [
      "Create a simple compost bin",
      "Add kitchen scraps and garden waste",
      "Use compost for plants",
    ],
    indiaContext: "Especially useful near temples, gardens, and households generating flower waste.",
    sourceName: "Swachh Bharat Mission",
    sourceUrl: "https://swachhbharatmission.gov.in",
  },
  {
    id: "air-dry-clothes",
    category: "india-specific",
    icon: "👕",
    iconLabel: "T-shirt",
    title: "Air-Dry Clothes",
    shortDescription: "Useful through long dry spells and sunny balconies.",
    monthlySavings: 3.6,
    whyItMatters: "Eliminates electricity consumption from electric dryers.",
    howTo: [
      "Use balconies, rooftops, or drying racks",
      "Dry clothes during daylight hours",
    ],
    indiaContext: "India's climate and long sunny periods make air drying practical throughout much of the year.",
    sourceName: "Bureau of Energy Efficiency",
    sourceUrl: "https://beeindia.gov.in",
  },
];
