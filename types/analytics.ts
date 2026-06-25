export interface DailyDataPoint {
  date: string;
  co2: number;
}

export interface WeeklyDataPoint {
  week: string;
  co2: number;
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  forecast?: number;
}

export interface GoalProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface AnalyticsData {
  daily: DailyDataPoint[];
  weekly: WeeklyDataPoint[];
  forecast: ForecastPoint[];
  goal: GoalProgress;
}
