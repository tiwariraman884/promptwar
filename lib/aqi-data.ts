/* ─── AQI Data & Helpers ─── */

export interface AQILevel {
  range: [number, number];
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
  healthMsg: string;
  exerciseAdvice: string;
}

export const AQI_LEVELS: AQILevel[] = [
  { range: [0, 50], label: "Good", color: "#22c55e", bgColor: "#f0fdf4", emoji: "😊", healthMsg: "Air quality is satisfactory. No health risk.", exerciseAdvice: "Great day for outdoor exercise!" },
  { range: [51, 100], label: "Satisfactory", color: "#84cc16", bgColor: "#fefce8", emoji: "🙂", healthMsg: "Acceptable quality. Sensitive groups may notice mild effects.", exerciseAdvice: "Good for outdoor activities." },
  { range: [101, 200], label: "Moderate", color: "#eab308", bgColor: "#fefce8", emoji: "😐", healthMsg: "May cause breathing discomfort for sensitive people.", exerciseAdvice: "Limit prolonged outdoor exertion." },
  { range: [201, 300], label: "Poor", color: "#f97316", bgColor: "#fff7ed", emoji: "😷", healthMsg: "Breathing discomfort likely for most people.", exerciseAdvice: "Avoid outdoor exercise. Use indoor alternatives." },
  { range: [301, 400], label: "Very Poor", color: "#ef4444", bgColor: "#fef2f2", emoji: "🤢", healthMsg: "Respiratory illness on prolonged exposure.", exerciseAdvice: "Stay indoors. Close windows." },
  { range: [401, 500], label: "Severe", color: "#991b1b", bgColor: "#fef2f2", emoji: "☠️", healthMsg: "Health emergency! Affects even healthy people.", exerciseAdvice: "Avoid all outdoor activity. Wear N95 if going out." },
];

export function getAQILevel(value: number): AQILevel {
  return AQI_LEVELS.find(l => value >= l.range[0] && value <= l.range[1]) ?? AQI_LEVELS[5];
}

export interface CityAQIData {
  city: string;
  state: string;
  aqi: number;
  pm25: number;
  pm10: number;
  primaryPollutant: string;
  updatedAt: string;
  weekTrend: number[]; // last 7 days AQI
}

/* ─── Demo data (simulating CPCB API response) ─── */
function generateWeekTrend(baseAqi: number): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const variance = Math.sin(i * 1.2) * 25 + (Math.random() - 0.5) * 20;
    return Math.max(15, Math.round(baseAqi + variance));
  });
}

export const DEMO_CITY_AQI: CityAQIData[] = [
  { city: "Haridwar", state: "Uttarakhand", aqi: 78, pm25: 32, pm10: 65, primaryPollutant: "PM10", updatedAt: new Date().toISOString(), weekTrend: generateWeekTrend(78) },
  { city: "Dehradun", state: "Uttarakhand", aqi: 95, pm25: 41, pm10: 78, primaryPollutant: "PM2.5", updatedAt: new Date().toISOString(), weekTrend: generateWeekTrend(95) },
  { city: "Rishikesh", state: "Uttarakhand", aqi: 62, pm25: 24, pm10: 48, primaryPollutant: "PM10", updatedAt: new Date().toISOString(), weekTrend: generateWeekTrend(62) },
  { city: "Delhi", state: "Delhi", aqi: 245, pm25: 135, pm10: 210, primaryPollutant: "PM2.5", updatedAt: new Date().toISOString(), weekTrend: generateWeekTrend(245) },
  { city: "Mumbai", state: "Maharashtra", aqi: 128, pm25: 62, pm10: 95, primaryPollutant: "PM2.5", updatedAt: new Date().toISOString(), weekTrend: generateWeekTrend(128) },
  { city: "Bengaluru", state: "Karnataka", aqi: 85, pm25: 35, pm10: 60, primaryPollutant: "PM10", updatedAt: new Date().toISOString(), weekTrend: generateWeekTrend(85) },
  { city: "Lucknow", state: "Uttar Pradesh", aqi: 198, pm25: 98, pm10: 155, primaryPollutant: "PM2.5", updatedAt: new Date().toISOString(), weekTrend: generateWeekTrend(198) },
  { city: "Jaipur", state: "Rajasthan", aqi: 165, pm25: 78, pm10: 130, primaryPollutant: "PM10", updatedAt: new Date().toISOString(), weekTrend: generateWeekTrend(165) },
];

export function getCityAQI(cityName: string): CityAQIData | undefined {
  return DEMO_CITY_AQI.find(c => c.city.toLowerCase() === cityName.toLowerCase());
}
