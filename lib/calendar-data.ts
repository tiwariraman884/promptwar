/* ─── Green Calendar Events Data ─── */

export interface GreenEvent {
  id: string;
  name: string;
  emoji: string;
  date: string;          // "MM-DD" format
  endDate?: string;      // "MM-DD" for multi-day events
  description: string;
  tips: string[];
  coinsBonus: number;
  category: "international" | "india" | "local" | "seasonal";
  challengeTitle?: string;
}

export const GREEN_EVENTS: GreenEvent[] = [
  // ── January ──
  { id: "national-pollution-day", name: "National Pollution Control Day", emoji: "🏭", date: "01-12", description: "Honors Bhopal gas tragedy victims and raises awareness about pollution prevention.", tips: ["Check your home for indoor air quality", "Switch to natural cleaners"], coinsBonus: 10, category: "india" },

  // ── February ──
  { id: "world-wetlands-day", name: "World Wetlands Day", emoji: "🌊", date: "02-02", description: "Wetlands are key carbon sinks and biodiversity hubs.", tips: ["Visit a local wetland", "Support wetland conservation NGOs"], coinsBonus: 10, category: "international" },

  // ── March ──
  { id: "holi", name: "Eco Holi Challenge", emoji: "🎨", date: "03-14", description: "Celebrate with natural colors and less water to reduce chemical and water waste.", tips: ["Use dry natural colors", "Play with flower petals", "Minimize water usage"], coinsBonus: 25, category: "india", challengeTitle: "Eco Holi: Natural Colors Only" },
  { id: "world-water-day", name: "World Water Day", emoji: "💧", date: "03-22", description: "Water conservation reduces energy used for pumping, treatment, and heating.", tips: ["Fix leaky taps today", "Switch to bucket bath for a week", "Track your water usage"], coinsBonus: 15, category: "international" },
  { id: "earth-hour", name: "Earth Hour", emoji: "🕯️", date: "03-29", description: "Switch off non-essential lights for 1 hour at 8:30 PM to show climate solidarity.", tips: ["Turn off all lights for 1 hour", "Host a candlelight dinner", "Share on social media"], coinsBonus: 20, category: "international", challengeTitle: "Earth Hour: Lights Off 8:30 PM" },

  // ── April ──
  { id: "earth-day", name: "Earth Day", emoji: "🌍", date: "04-22", description: "The biggest environmental event globally. 2x coins on all actions this week!", tips: ["Plant something today", "Do a neighbourhood cleanup", "Calculate your annual footprint"], coinsBonus: 50, category: "international", challengeTitle: "Earth Day Week: Double Coins" },

  // ── May ──
  { id: "world-bee-day", name: "World Bee Day", emoji: "🐝", date: "05-20", description: "Bees pollinate 75% of food crops. Protect them by avoiding pesticides.", tips: ["Plant bee-friendly flowers", "Buy local honey", "Avoid chemical pesticides"], coinsBonus: 10, category: "international" },
  { id: "biodiversity-day", name: "International Day for Biological Diversity", emoji: "🦋", date: "05-22", description: "Biodiversity loss accelerates climate change. Protect local ecosystems.", tips: ["Visit a national park", "Learn about local species", "Reduce single-use plastic"], coinsBonus: 15, category: "international" },

  // ── June ──
  { id: "world-env-day", name: "World Environment Day", emoji: "🌱", date: "06-05", description: "India hosted the first WED in 1974. Join city cleanup drives and earn bonus badges!", tips: ["Join a cleanup drive", "Plant a sapling", "Pledge one green habit for the month"], coinsBonus: 40, category: "international", challengeTitle: "WED Week: One Green Pledge" },
  { id: "world-ocean-day", name: "World Ocean Day", emoji: "🌊", date: "06-08", description: "Oceans absorb 25% of CO₂. Reduce plastic to protect marine carbon sinks.", tips: ["Avoid single-use plastic today", "Choose sustainable seafood", "Share ocean facts"], coinsBonus: 10, category: "international" },

  // ── July ──
  { id: "van-mahotsav", name: "Van Mahotsav", emoji: "🌳", date: "07-01", endDate: "07-07", description: "India's 'Festival of Forests' since 1950. Plant trees all week for bonus coins and discounted offsets!", tips: ["Plant at least one tree", "Organize a community plantation drive", "Share your tree photo on the app"], coinsBonus: 75, category: "india", challengeTitle: "Van Mahotsav: Plant-a-Tree Week" },

  // ── August ──
  { id: "independence-day", name: "Green Independence Day", emoji: "🇮🇳", date: "08-15", description: "Celebrate freedom with a clean drive. Pick up litter in your area.", tips: ["Organize a neighborhood clean drive", "Use cloth flags instead of plastic", "Plant a freedom sapling"], coinsBonus: 25, category: "india", challengeTitle: "Swachh Azadi: Clean Your Area" },

  // ── September ──
  { id: "ozone-day", name: "International Day for the Preservation of the Ozone Layer", emoji: "☀️", date: "09-16", description: "The ozone layer protects us from UV. AC refrigerants still damage it.", tips: ["Get AC serviced to prevent refrigerant leaks", "Check for old CFC appliances"], coinsBonus: 10, category: "international" },
  { id: "zero-emissions-day", name: "Zero Emissions Day", emoji: "0️⃣", date: "09-21", description: "Try to go an entire day with zero fossil fuel use!", tips: ["Walk or cycle everywhere today", "Eat only home-cooked food", "Skip all deliveries"], coinsBonus: 50, category: "international", challengeTitle: "Zero Emissions Day Challenge" },

  // ── October ──
  { id: "gandhi-jayanti", name: "Gandhi Jayanti — Swachh Bharat", emoji: "🧹", date: "10-02", description: "Clean India mission. Organize or join a community cleanliness drive.", tips: ["Participate in a Swachh Bharat activity", "Sort your household waste", "Compost kitchen scraps"], coinsBonus: 20, category: "india" },
  { id: "green-diwali", name: "Green Diwali Challenge", emoji: "🪔", date: "10-20", endDate: "10-25", description: "Diwali crackers emit ~50,000 tonnes CO₂. Choose lights over crackers and earn big rewards!", tips: ["Skip crackers entirely", "Use LED diyas and fairy lights", "Gift plants instead of sweets", "Log your avoided emissions"], coinsBonus: 100, category: "india", challengeTitle: "Green Diwali: Crackers → Diyas" },

  // ── November ──
  { id: "air-quality-awareness", name: "National Clean Air Programme Day", emoji: "💨", date: "11-01", description: "Post-Diwali air quality focus. Check your local AQI and take action.", tips: ["Check AQI before outdoor exercise", "Use public transport this week", "Avoid burning waste"], coinsBonus: 15, category: "india" },
  { id: "world-vegan-day", name: "World Vegan Day", emoji: "🥗", date: "11-01", description: "Try one fully vegan day. Vegan diets have 50-75% lower carbon footprint than non-veg.", tips: ["Eat fully vegan today", "Try a new vegan recipe", "Calculate your food carbon savings"], coinsBonus: 20, category: "international", challengeTitle: "Vegan for a Day" },

  // ── December ──
  { id: "energy-conservation-day", name: "National Energy Conservation Day", emoji: "🔋", date: "12-14", description: "India observes Energy Conservation Day. Audit your home energy use!", tips: ["Complete the Home Energy Audit", "Switch off standby appliances", "Set AC to 26°C"], coinsBonus: 30, category: "india", challengeTitle: "Energy Audit Week" },
  { id: "green-christmas", name: "Green Christmas", emoji: "🎄", date: "12-25", description: "Celebrate sustainably with recycled decorations and plant-based feasts.", tips: ["Use recycled or natural decorations", "Gift experiences, not things", "Cook a low-carbon feast"], coinsBonus: 15, category: "international" },

  // ── Local Haridwar Events ──
  { id: "ganga-cleanup-q1", name: "Ganga Cleanup Drive (Q1)", emoji: "🏞️", date: "03-01", description: "Quarterly Namami Gange volunteer cleanup at Har Ki Pauri and nearby ghats.", tips: ["Join the cleanup at Har Ki Pauri", "Bring reusable gloves", "Log your Green Map check-in"], coinsBonus: 30, category: "local", challengeTitle: "Ganga Cleanup Q1" },
  { id: "ganga-cleanup-q2", name: "Ganga Cleanup Drive (Q2)", emoji: "🏞️", date: "06-01", description: "Summer cleanup drive along Ganga ghats.", tips: ["Bring friends — group challenge!", "Pick up at least 2 kg of litter", "Share photos"], coinsBonus: 30, category: "local", challengeTitle: "Ganga Cleanup Q2" },
  { id: "ganga-cleanup-q3", name: "Ganga Cleanup Drive (Q3)", emoji: "🏞️", date: "09-01", description: "Post-monsoon Ganga cleanup drive.", tips: ["Focus on flood debris", "Sort collected waste for recycling", "Log volunteer hours"], coinsBonus: 30, category: "local", challengeTitle: "Ganga Cleanup Q3" },
  { id: "ganga-cleanup-q4", name: "Ganga Cleanup Drive (Q4)", emoji: "🏞️", date: "12-01", description: "Year-end Ganga cleanup and reflection drive.", tips: ["Final push for the year!", "Set green goals for next year", "Celebrate your 2026 impact"], coinsBonus: 30, category: "local", challengeTitle: "Ganga Cleanup Q4" },
  { id: "haridwar-tree-drive", name: "Haridwar Community Tree Drive", emoji: "🌿", date: "07-05", description: "Annual tree plantation drive at BHEL township green belt and surrounding areas.", tips: ["Plant native species", "Water young saplings", "Take a before/after photo"], coinsBonus: 40, category: "local" },
];

/* ─── Helpers ─── */
export function getUpcomingEvents(count: number = 5): (GreenEvent & { daysUntil: number; dateObj: Date })[] {
  const today = new Date();
  const currentYear = today.getFullYear();

  return GREEN_EVENTS
    .map(event => {
      const [month, day] = event.date.split("-").map(Number);
      let dateObj = new Date(currentYear, month - 1, day);
      // If the event has passed this year, look at next year
      if (dateObj < today) {
        dateObj = new Date(currentYear + 1, month - 1, day);
      }
      const daysUntil = Math.ceil((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...event, daysUntil, dateObj };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, count);
}

export function getEventsForMonth(month: number): GreenEvent[] {
  const monthStr = String(month).padStart(2, "0");
  return GREEN_EVENTS.filter(e => e.date.startsWith(monthStr));
}

export const EVENT_CATEGORIES = [
  { value: "all", label: "All Events", emoji: "📅" },
  { value: "international", label: "International", emoji: "🌍" },
  { value: "india", label: "India", emoji: "🇮🇳" },
  { value: "local", label: "Local / Haridwar", emoji: "🏞️" },
  { value: "seasonal", label: "Seasonal", emoji: "🎉" },
] as const;
