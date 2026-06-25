import { DailyDataPoint, WeeklyDataPoint, ForecastPoint } from '../types/analytics';

export const CATEGORY_LABELS: Record<string, { en: string; hi: string }> = {
  transport: { en: 'Transport', hi: 'परिवहन' },
  electricity: { en: 'Electricity', hi: 'बिजली' },
  food: { en: 'Food', hi: 'भोजन' },
  waste: { en: 'Waste', hi: 'कचरा' },
};

export function groupByWeek(data: DailyDataPoint[]): WeeklyDataPoint[] {
  const weeks: Record<string, number> = {};
  data.forEach((point) => {
    const date = new Date(point.date);
    // Simple week grouping: year-week number
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    const week = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
    weeks[week] = (weeks[week] || 0) + point.co2;
  });
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, co2]) => ({ week, co2 }));
}

export function linearForecast(data: DailyDataPoint[], daysToForecast = 7): ForecastPoint[] {
  if (data.length === 0) return [];
  
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  data.forEach((point, i) => {
    sumX += i;
    sumY += point.co2;
    sumXY += i * point.co2;
    sumXX += i * i;
  });
  
  const denominator = (n * sumXX - sumX * sumX);
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  
  const forecast: ForecastPoint[] = data.map((point) => ({
    date: point.date,
    actual: point.co2,
  }));
  
  const lastDateStr = data[data.length - 1].date;
  for (let i = 1; i <= daysToForecast; i++) {
    const nextDate = new Date(lastDateStr);
    nextDate.setDate(nextDate.getDate() + i);
    const x = n - 1 + i;
    forecast.push({
      date: nextDate.toISOString().split('T')[0],
      forecast: Math.max(0, intercept + slope * x),
    });
  }
  
  return forecast;
}

export function valueToBarHeight(value: number, max: number, maxHeight = 100): number {
  if (max === 0) return 0;
  return Math.min(maxHeight, Math.max(0, (value / max) * maxHeight));
}

export function formatCO2(value: number): string {
  return `${value.toFixed(2)} kg CO₂`;
}
