'use client'

import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

import DailyTrendChart from './DailyTrendChart'
import WeeklyBarChart from './WeeklyBarChart'
import ForecastAreaChart from './ForecastAreaChart'
import GoalProgressRing from './GoalProgressRing'
import CategoryRadar from './CategoryRadar'
import HotspotHeatmap from './HotspotHeatmap'
import SustainabilityGauge from './SustainabilityGauge'

export {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
}

export default function AnalyticsSection({ data, lang }: { data: any, lang: 'en' | 'hi' }) {
  if (!data) return null;
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.daily && <DailyTrendChart data={data.daily} lang={lang} />}
      {data.weekly && <WeeklyBarChart data={data.weekly} lang={lang} />}
      {data.forecast && <ForecastAreaChart forecast={data.forecast} recent={data.daily || []} lang={lang} />}
      {data.goals && <GoalProgressRing goals={data.goals} lang={lang} />}
    </section>
  )
}
