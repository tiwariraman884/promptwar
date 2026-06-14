import type { EmissionCategory } from "@/lib/emission-factors";

/* ─── Types ─── */
export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  category: EmissionCategory | "culture" | "general";
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  co2Fact: string;
  coins: number;
}

/* ─── 50 India-specific quiz questions ─── */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ── Transport ──
  {
    id: "t1", category: "transport", difficulty: "easy",
    question: "Which produces less CO₂ per km: Indian Railways or a petrol car?",
    options: ["Petrol car", "Indian Railways", "About the same", "Depends on speed"],
    correctIndex: 1,
    explanation: "Indian Railways emits only 0.012 kg CO₂/km vs 0.15 kg for a petrol car — over 12x cleaner!",
    co2Fact: "Indian Railways: 0.012 kg/km", coins: 5,
  },
  {
    id: "t2", category: "transport", difficulty: "medium",
    question: "How much CO₂ does a Delhi–Mumbai flight emit per passenger?",
    options: ["~25 kg", "~80 kg", "~150 kg", "~300 kg"],
    correctIndex: 2,
    explanation: "A 1,400 km domestic flight emits ~150 kg CO₂ per economy passenger. The same trip by train: ~17 kg.",
    co2Fact: "Flight: 0.115 kg/passenger-km", coins: 10,
  },
  {
    id: "t3", category: "transport", difficulty: "easy",
    question: "Which has the lowest carbon footprint for a 5 km commute?",
    options: ["Auto-rickshaw", "Bicycle", "Metro rail", "Electric scooter"],
    correctIndex: 1,
    explanation: "Cycling emits zero direct CO₂. Even e-scooters emit ~0.01 kg/km from grid electricity.",
    co2Fact: "Bicycle: 0 kg CO₂/km", coins: 5,
  },
  {
    id: "t4", category: "transport", difficulty: "hard",
    question: "If all of India's two-wheelers switched to electric, how much CO₂ would be saved annually?",
    options: ["~5 million tonnes", "~25 million tonnes", "~60 million tonnes", "~120 million tonnes"],
    correctIndex: 2,
    explanation: "India has ~200 million two-wheelers. Even accounting for grid emissions, EV switch saves ~60 MT CO₂/year.",
    co2Fact: "India has 200M+ registered two-wheelers", coins: 15,
  },
  {
    id: "t5", category: "transport", difficulty: "medium",
    question: "What is the carbon footprint of a 10 km Ola/Uber ride?",
    options: ["~0.5 kg CO₂", "~1.5 kg CO₂", "~3.0 kg CO₂", "~5.0 kg CO₂"],
    correctIndex: 1,
    explanation: "A shared ride-hail emits ~0.15 kg/km. Pool rides cut this by ~40%.",
    co2Fact: "Ride-hail: ~0.15 kg/km (solo)", coins: 10,
  },

  // ── Energy ──
  {
    id: "e1", category: "energy", difficulty: "easy",
    question: "What is India's grid emission factor (CO₂ per unit of electricity)?",
    options: ["0.22 kg/kWh", "0.52 kg/kWh", "0.82 kg/kWh", "1.12 kg/kWh"],
    correctIndex: 2,
    explanation: "India's grid emits 0.82 kg CO₂ per kWh due to heavy coal dependence (~70% of generation).",
    co2Fact: "CEA 2023: 0.82 kg CO₂/kWh", coins: 5,
  },
  {
    id: "e2", category: "energy", difficulty: "medium",
    question: "How much CO₂ does a 1.5-ton AC produce running 8 hours/day for a month?",
    options: ["~20 kg", "~60 kg", "~120 kg", "~200 kg"],
    correctIndex: 2,
    explanation: "A 3-star 1.5T AC uses ~5 kWh/day. Over 30 days: 150 kWh × 0.82 = ~123 kg CO₂.",
    co2Fact: "AC: 5 kWh/day → 123 kg CO₂/month", coins: 10,
  },
  {
    id: "e3", category: "energy", difficulty: "easy",
    question: "Switching from a 3-star to a 5-star AC saves roughly how much energy?",
    options: ["10%", "25%", "40%", "60%"],
    correctIndex: 1,
    explanation: "A 5-star rated AC is about 25% more efficient than a 3-star model of the same capacity.",
    co2Fact: "BEE star rating difference: ~25%", coins: 5,
  },
  {
    id: "e4", category: "energy", difficulty: "hard",
    question: "How much CO₂ does one LPG cylinder (14.2 kg) emit when burned?",
    options: ["~10 kg", "~22 kg", "~33 kg", "~45 kg"],
    correctIndex: 2,
    explanation: "1 kg LPG emits ~2.98 kg CO₂. A full 14.2 kg cylinder: 14.2 × 2.98 ≈ 42 kg, but effective cooking emissions average ~33 kg including efficiency.",
    co2Fact: "LPG: 2.98 kg CO₂/kg burned", coins: 15,
  },
  {
    id: "e5", category: "energy", difficulty: "medium",
    question: "How many LED bulbs can run for 1 year on the energy one incandescent bulb uses?",
    options: ["2", "5", "8", "12"],
    correctIndex: 2,
    explanation: "A 60W incandescent uses 60 kWh/year. An 8W LED gives the same brightness using only 8 kWh — 7-8x more efficient!",
    co2Fact: "LED: 8W vs Incandescent: 60W for same lumens", coins: 10,
  },

  // ── Diet / Food ──
  {
    id: "d1", category: "diet", difficulty: "easy",
    question: "Which Indian diet has the lowest carbon footprint?",
    options: ["Non-vegetarian", "Vegetarian", "Vegan", "Egg-based"],
    correctIndex: 2,
    explanation: "Vegan diets have the lowest footprint (~1.5 kg CO₂/day) since they skip dairy, which has a surprisingly high carbon cost.",
    co2Fact: "Vegan: ~1.5 kg/day, Veg: ~2.5 kg/day, Non-veg: ~4.5 kg/day", coins: 5,
  },
  {
    id: "d2", category: "diet", difficulty: "medium",
    question: "Which has more CO₂: 1 kg of mutton or a 200 km car drive?",
    options: ["The car drive", "1 kg mutton", "About the same", "Neither is significant"],
    correctIndex: 1,
    explanation: "1 kg mutton emits ~39 kg CO₂ (including methane). A 200 km car drive: ~30 kg. Mutton wins by 30%!",
    co2Fact: "Mutton: 39 kg CO₂/kg, Car: 0.15 kg CO₂/km", coins: 10,
  },
  {
    id: "d3", category: "diet", difficulty: "easy",
    question: "How much CO₂ does food delivery packaging and transport add?",
    options: ["~5%", "~15%", "~30%", "~50%"],
    correctIndex: 2,
    explanation: "Food delivery adds 25-35% CO₂ from packaging, rider transport, and cold-chain. Pickup or home cooking eliminates this.",
    co2Fact: "Delivery multiplier: 1.3x vs home cooking", coins: 5,
  },
  {
    id: "d4", category: "diet", difficulty: "hard",
    question: "What percentage of India's greenhouse gas emissions comes from agriculture?",
    options: ["5%", "14%", "20%", "30%"],
    correctIndex: 1,
    explanation: "Agriculture contributes about 14% of India's total GHG emissions, mainly from rice paddies (methane) and livestock.",
    co2Fact: "India agriculture: 14% of total GHG", coins: 15,
  },
  {
    id: "d5", category: "diet", difficulty: "medium",
    question: "How much CO₂ does wasting 1 kg of cooked food produce?",
    options: ["~0.5 kg", "~1.5 kg", "~3.5 kg", "~6.0 kg"],
    correctIndex: 2,
    explanation: "Wasted food includes all the emissions from growing, transporting, cooking, plus methane from landfill decomposition.",
    co2Fact: "Food waste: 3.3 kg CO₂/kg average globally", coins: 10,
  },

  // ── Waste ──
  {
    id: "w1", category: "waste", difficulty: "easy",
    question: "How much waste does the average Indian generate per day?",
    options: ["0.1 kg", "0.3 kg", "0.6 kg", "1.2 kg"],
    correctIndex: 2,
    explanation: "Urban Indians generate ~0.5-0.7 kg/day. Rural areas: ~0.3 kg. India total: 62 million tonnes/year.",
    co2Fact: "India generates 62 MT waste/year", coins: 5,
  },
  {
    id: "w2", category: "waste", difficulty: "medium",
    question: "What percentage of India's plastic waste is actually recycled?",
    options: ["~10%", "~30%", "~50%", "~70%"],
    correctIndex: 1,
    explanation: "Only about 10-12% of India's 3.5 million tonnes of annual plastic waste gets formally recycled. The rest ends up in landfills or waterways.",
    co2Fact: "India: 3.5 MT plastic waste/year, ~10% recycled", coins: 10,
  },
  {
    id: "w3", category: "waste", difficulty: "easy",
    question: "Which produces more methane in a landfill?",
    options: ["Plastic bags", "Food scraps", "Paper", "Glass"],
    correctIndex: 1,
    explanation: "Organic waste (food scraps) decomposes anaerobically in landfills, producing methane — 80x more potent than CO₂ over 20 years.",
    co2Fact: "Methane: 80x CO₂ warming potential (20-year)", coins: 5,
  },
  {
    id: "w4", category: "waste", difficulty: "hard",
    question: "How much e-waste does India generate annually?",
    options: ["~0.5 million tonnes", "~1.5 million tonnes", "~3.2 million tonnes", "~5.0 million tonnes"],
    correctIndex: 2,
    explanation: "India is the 3rd largest e-waste generator globally at ~3.2 MT/year. Less than 20% is formally processed.",
    co2Fact: "India: 3rd largest e-waste generator globally", coins: 15,
  },

  // ── Digital ──
  {
    id: "dg1", category: "digital", difficulty: "easy",
    question: "How much CO₂ does streaming 1 hour of Netflix in India produce?",
    options: ["~5 grams", "~36 grams", "~150 grams", "~500 grams"],
    correctIndex: 1,
    explanation: "Modern streaming is surprisingly efficient at ~5-10g CO₂/hour. A year of daily streaming: ~2 kg CO₂.",
    co2Fact: "HD streaming: ~36g CO₂/hour (IEA revised)", coins: 5,
  },
  {
    id: "dg2", category: "digital", difficulty: "medium",
    question: "How much CO₂ does cryptocurrency mining use globally per year?",
    options: ["~10 MT", "~65 MT", "~150 MT", "~300 MT"],
    correctIndex: 1,
    explanation: "Bitcoin mining alone uses ~65 MT CO₂/year — more than many countries. Single Bitcoin transaction: ~700 kg CO₂.",
    co2Fact: "1 Bitcoin transaction ≈ 700 kg CO₂", coins: 10,
  },
  {
    id: "dg3", category: "digital", difficulty: "medium",
    question: "What's the carbon footprint of manufacturing one smartphone?",
    options: ["~10 kg CO₂", "~35 kg CO₂", "~70 kg CO₂", "~120 kg CO₂"],
    correctIndex: 2,
    explanation: "Manufacturing a smartphone produces ~70 kg CO₂. Using it for 3 years instead of 2 reduces its per-year footprint by 33%.",
    co2Fact: "Smartphone: ~70 kg CO₂ to manufacture", coins: 10,
  },

  // ── Water ──
  {
    id: "wa1", category: "water", difficulty: "easy",
    question: "A 10-minute shower vs a bucket bath — how much more water does the shower use?",
    options: ["2x more", "3x more", "5x more", "Same amount"],
    correctIndex: 2,
    explanation: "A shower uses ~100 liters in 10 min vs ~20 liters for a bucket bath. Heating that extra water adds significant CO₂.",
    co2Fact: "Hot shower: 100L vs Bucket bath: 20L", coins: 5,
  },
  {
    id: "wa2", category: "water", difficulty: "medium",
    question: "How much CO₂ is produced by heating water for 1 bucket bath with an electric geyser?",
    options: ["~0.05 kg", "~0.15 kg", "~0.5 kg", "~1.2 kg"],
    correctIndex: 2,
    explanation: "Heating 20L from 20°C to 55°C needs ~0.8 kWh. At India's grid factor: 0.8 × 0.82 ≈ 0.66 kg CO₂.",
    co2Fact: "Electric geyser: ~0.66 kg CO₂ per bucket", coins: 10,
  },

  // ── Shopping ──
  {
    id: "s1", category: "shopping", difficulty: "easy",
    question: "How much CO₂ does a cotton t-shirt produce to manufacture?",
    options: ["~1 kg", "~5 kg", "~8 kg", "~15 kg"],
    correctIndex: 2,
    explanation: "A single cotton t-shirt requires ~2,700 liters of water and emits ~8 kg CO₂ from raw material to retail.",
    co2Fact: "1 cotton t-shirt = 8 kg CO₂", coins: 5,
  },
  {
    id: "s2", category: "shopping", difficulty: "medium",
    question: "Fast fashion vs wearing clothes twice as long — how much CO₂ is saved?",
    options: ["~10%", "~24%", "~44%", "~60%"],
    correctIndex: 2,
    explanation: "Wearing clothes for 2 years instead of 1 reduces their carbon footprint by ~44%. Mending and repairing helps too!",
    co2Fact: "Double clothing lifespan: -44% CO₂", coins: 10,
  },

  // ── Culture / India-specific ──
  {
    id: "c1", category: "culture", difficulty: "easy",
    question: "How much CO₂ do Diwali firecrackers emit across India?",
    options: ["~1,000 tonnes", "~10,000 tonnes", "~50,000 tonnes", "~200,000 tonnes"],
    correctIndex: 2,
    explanation: "Diwali crackers contribute ~50,000 tonnes of CO₂ plus harmful particulate matter. Green Diwali campaigns promote lights over crackers.",
    co2Fact: "Diwali crackers: ~50,000 tonnes CO₂ nationally", coins: 5,
  },
  {
    id: "c2", category: "culture", difficulty: "medium",
    question: "What scheme helps Indian homeowners install rooftop solar?",
    options: ["PM-Surya Ghar", "FAME II", "Gobardhan", "Namami Gange"],
    correctIndex: 0,
    explanation: "PM-Surya Ghar Muft Bijli Yojana provides subsidies for rooftop solar panels, covering up to 60% of installation cost.",
    co2Fact: "Rooftop solar: saves ~120 kg CO₂/year for a small system", coins: 10,
  },
  {
    id: "c3", category: "culture", difficulty: "hard",
    question: "India's per-capita CO₂ emissions are what fraction of the USA's?",
    options: ["1/2", "1/4", "1/8", "1/12"],
    correctIndex: 2,
    explanation: "India: ~1.9 tonnes/person/year. USA: ~15.5 tonnes/person/year. That's about 1/8th. But India's total is rising fast.",
    co2Fact: "India: 1.9 t/person, USA: 15.5 t/person", coins: 15,
  },
  {
    id: "c4", category: "culture", difficulty: "easy",
    question: "What is Van Mahotsav?",
    options: ["A water conservation festival", "A tree plantation week (July 1-7)", "A solar energy day", "A waste management drive"],
    correctIndex: 1,
    explanation: "Van Mahotsav ('Festival of Forests') is celebrated from July 1-7 every year since 1950 to encourage tree planting across India.",
    co2Fact: "1 tree absorbs ~22 kg CO₂/year", coins: 5,
  },
  {
    id: "c5", category: "culture", difficulty: "medium",
    question: "Which Indian city has the worst air quality globally (as of 2024)?",
    options: ["Mumbai", "Delhi", "Kolkata", "Lucknow"],
    correctIndex: 1,
    explanation: "Delhi consistently ranks among the most polluted cities globally, with winter AQI often exceeding 400 (Hazardous). Stubble burning, vehicles, and industry are key contributors.",
    co2Fact: "Delhi winter AQI: often 400+ (Hazardous)", coins: 10,
  },

  // ── General / Science ──
  {
    id: "g1", category: "general", difficulty: "easy",
    question: "What is the main greenhouse gas causing global warming?",
    options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
    correctIndex: 2,
    explanation: "CO₂ is the primary greenhouse gas from human activities. Methane and nitrous oxide also contribute significantly.",
    co2Fact: "CO₂ makes up ~76% of global GHG emissions", coins: 5,
  },
  {
    id: "g2", category: "general", difficulty: "medium",
    question: "By how much must global emissions fall by 2030 to limit warming to 1.5°C?",
    options: ["10%", "25%", "45%", "70%"],
    correctIndex: 2,
    explanation: "The IPCC says global emissions must fall 45% from 2010 levels by 2030 to keep warming under 1.5°C.",
    co2Fact: "IPCC: -45% by 2030 for 1.5°C target", coins: 10,
  },
  {
    id: "g3", category: "general", difficulty: "hard",
    question: "How much CO₂ can the world's oceans absorb annually?",
    options: ["~1 billion tonnes", "~2.5 billion tonnes", "~7 billion tonnes", "~15 billion tonnes"],
    correctIndex: 2,
    explanation: "Oceans absorb ~7 billion tonnes of CO₂ annually — about 25% of human emissions. But this causes ocean acidification.",
    co2Fact: "Oceans absorb ~25% of human CO₂ emissions", coins: 15,
  },
  {
    id: "g4", category: "general", difficulty: "easy",
    question: "Which country emits the most CO₂ in total?",
    options: ["USA", "India", "China", "Russia"],
    correctIndex: 2,
    explanation: "China emits the most total CO₂ (~30% of global). USA is 2nd (~14%), India 3rd (~7%). But per-capita, India is much lower.",
    co2Fact: "China: 30%, USA: 14%, India: 7% of global CO₂", coins: 5,
  },
  {
    id: "g5", category: "general", difficulty: "medium",
    question: "How many tonnes of CO₂ does the average Indian emit per year?",
    options: ["~0.5 tonnes", "~1.9 tonnes", "~4.5 tonnes", "~8 tonnes"],
    correctIndex: 1,
    explanation: "India's per-capita emissions are ~1.9 tonnes/year — well below the global average of ~4.7 tonnes. But this is rising.",
    co2Fact: "India per-capita: 1.9 tonnes, World: 4.7 tonnes", coins: 10,
  },

  // ── Events / Festivals ──
  {
    id: "ev1", category: "events", difficulty: "easy",
    question: "Which festival practice has the highest carbon impact?",
    options: ["Holi colors", "Diwali crackers", "Durga Puja pandals", "Christmas lights"],
    correctIndex: 1,
    explanation: "Diwali crackers emit the most CO₂ and particulate matter. Pandals and lights are significant too, but crackers dominate due to combustion.",
    co2Fact: "Diwali crackers: ~50,000 tonnes CO₂/year India-wide", coins: 5,
  },
  {
    id: "ev2", category: "events", difficulty: "medium",
    question: "A wedding with 500 guests typically emits how much CO₂?",
    options: ["~2 tonnes", "~8 tonnes", "~20 tonnes", "~50 tonnes"],
    correctIndex: 2,
    explanation: "Large Indian weddings emit 15-25 tonnes CO₂ from food, transport, decorations, lighting, and fireworks. Destination weddings: 40+ tonnes.",
    co2Fact: "Average Indian wedding: ~20 tonnes CO₂", coins: 10,
  },

  // ── Pet ──
  {
    id: "p1", category: "pet", difficulty: "medium",
    question: "What's the annual carbon footprint of a medium-sized dog in India?",
    options: ["~50 kg CO₂", "~150 kg CO₂", "~350 kg CO₂", "~700 kg CO₂"],
    correctIndex: 2,
    explanation: "A medium dog's food, veterinary care, and accessories contribute ~300-400 kg CO₂/year. Meat-based diets increase this significantly.",
    co2Fact: "Medium dog: ~350 kg CO₂/year", coins: 10,
  },

  // ── Food Delivery ──
  {
    id: "fd1", category: "food_delivery", difficulty: "easy",
    question: "Ordering via Swiggy/Zomato vs cooking at home — how much more CO₂?",
    options: ["10% more", "30% more", "50% more", "100% more"],
    correctIndex: 2,
    explanation: "Delivery adds ~50% CO₂ from packaging (plastic/foil), rider fuel, and restaurant energy overhead vs home cooking.",
    co2Fact: "Delivery adds: packaging + rider transport + restaurant overhead", coins: 5,
  },
  {
    id: "fd2", category: "food_delivery", difficulty: "medium",
    question: "How many food delivery orders does India process daily?",
    options: ["~2 million", "~8 million", "~15 million", "~25 million"],
    correctIndex: 1,
    explanation: "India processes ~6-10 million food delivery orders daily. That's ~3-5 million kg of packaging waste per day.",
    co2Fact: "India: 8M+ food deliveries/day", coins: 10,
  },

  // ── Bonus Hard Questions ──
  {
    id: "h1", category: "general", difficulty: "hard",
    question: "What is the 'carbon budget' remaining to keep warming below 1.5°C?",
    options: ["~100 Gt CO₂", "~250 Gt CO₂", "~500 Gt CO₂", "~1000 Gt CO₂"],
    correctIndex: 1,
    explanation: "As of 2023, the remaining carbon budget for a 50% chance of staying under 1.5°C is about 250 Gt CO₂ — roughly 6 years at current rates.",
    co2Fact: "1.5°C budget: ~250 Gt CO₂ remaining", coins: 15,
  },
  {
    id: "h2", category: "energy", difficulty: "hard",
    question: "India aims for what percentage of renewable energy capacity by 2030?",
    options: ["25%", "40%", "50%", "65%"],
    correctIndex: 2,
    explanation: "India targets 50% of installed electricity capacity from non-fossil sources by 2030, up from ~43% in 2023.",
    co2Fact: "India 2030 target: 500 GW renewable capacity", coins: 15,
  },
  {
    id: "h3", category: "transport", difficulty: "hard",
    question: "What is India's FAME II scheme about?",
    options: ["Solar energy subsidies", "Electric vehicle subsidies", "Forest conservation", "Carbon trading"],
    correctIndex: 1,
    explanation: "FAME II (Faster Adoption and Manufacturing of EVs) provides subsidies for electric two-wheelers, three-wheelers, and buses.",
    co2Fact: "FAME II budget: ₹10,000 crore for EV adoption", coins: 15,
  },
];

/* ─── Helper functions ─── */
export function getRandomQuestions(count: number = 5, category?: string): QuizQuestion[] {
  let pool = [...QUIZ_QUESTIONS];
  if (category && category !== "all") {
    pool = pool.filter(q => q.category === category);
  }
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export const QUIZ_CATEGORIES = [
  { value: "all", label: "All Topics", emoji: "🌍" },
  { value: "transport", label: "Transport", emoji: "🚗" },
  { value: "energy", label: "Energy", emoji: "⚡" },
  { value: "diet", label: "Diet & Food", emoji: "🍛" },
  { value: "waste", label: "Waste", emoji: "♻️" },
  { value: "digital", label: "Digital", emoji: "📱" },
  { value: "water", label: "Water", emoji: "💧" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "culture", label: "India & Culture", emoji: "🇮🇳" },
  { value: "general", label: "General Science", emoji: "🔬" },
] as const;
