/**
 * AnalyticsSection — lazy-load barrel
 *
 * Dynamic-import THIS file to pull in all recharts chart components
 * in a single split point, keeping recharts out of the main bundle.
 *
 * Usage:
 *   const { DailyTrendChart } = await import('@/components/analytics/AnalyticsSection')
 *
 *   OR with next/dynamic:
 *   const DailyTrendChart = dynamic(
 *     () => import('@/components/analytics/AnalyticsSection').then(m => m.DailyTrendChart)
 *   )
 */

export { DailyTrendChart } from './DailyTrendChart'
export { WeeklyBarChart } from './WeeklyBarChart'
export { ForecastAreaChart } from './ForecastAreaChart'
export { GoalProgressRing } from './GoalProgressRing'
export { CategoryRadar } from './CategoryRadar'
export { HotspotHeatmap } from './HotspotHeatmap'
export { SustainabilityGauge } from './SustainabilityGauge'
export { InsightCard } from './InsightCard'
export { ExportButton } from './ExportButton'
export { DateRangePicker } from './DateRangePicker'
