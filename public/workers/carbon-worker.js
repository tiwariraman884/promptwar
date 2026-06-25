// India emission factors (CEA 2023 + MoEFCC)
const FACTORS = {
  electricity: 0.82,
  lpg: 2.983,
  cng: 2.75,
  petrol: 2.31,
  diesel: 2.68,
  food_meat: 6.61,
  food_veg: 1.84,
}

const INDIA_ANNUAL_AVG_KG = 1600

function calculate(input) {
  const breakdown = {}
  let total = 0
  for (const [key, factor] of Object.entries(FACTORS)) {
    const value = input[key] || 0
    if (value < 0) throw new Error(`Negative value: ${key}`)
    breakdown[key] = parseFloat((value * factor).toFixed(2))
    total += breakdown[key]
  }
  return {
    total_kg_co2: parseFloat(total.toFixed(2)),
    breakdown,
    india_avg_comparison: parseFloat((total / (INDIA_ANNUAL_AVG_KG / 12)).toFixed(2)),
  }
}

function linearForecast(dailyData, days = 7) {
  const n = dailyData.length
  if (n < 3) return []
  const xs = dailyData.map((_, i) => i)
  const ys = dailyData.map(d => d.total_co2)
  const xMean = xs.reduce((s, x) => s + x, 0) / n
  const yMean = ys.reduce((s, y) => s + y, 0) / n
  
  const sumSqX = xs.reduce((s, x) => s + Math.pow(x - xMean, 2), 0)
  const slope = sumSqX === 0 ? 0 : xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0) / sumSqX
  
  const intercept = yMean - slope * xMean
  const residuals = ys.map((y, i) => y - (slope * i + intercept))
  const stdDev = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / n)
  const lastDate = new Date(dailyData[n - 1].date)
  return Array.from({ length: days }, (_, i) => {
    const x = n + i
    const predicted = Math.max(0, slope * x + intercept)
    const d = new Date(lastDate)
    d.setDate(lastDate.getDate() + i + 1)
    return {
      date: d.toISOString().split('T')[0],
      predicted_co2: parseFloat(predicted.toFixed(2)),
      confidence_lower: parseFloat(Math.max(0, predicted - 1.96 * stdDev).toFixed(2)),
      confidence_upper: parseFloat((predicted + 1.96 * stdDev).toFixed(2)),
    }
  })
}

// Worker message handler
self.addEventListener('message', (e) => {
  const { type, payload, id } = e.data
  try {
    let result
    if (type === 'CALCULATE') result = calculate(payload)
    if (type === 'FORECAST')  result = linearForecast(payload.daily, payload.days)
    self.postMessage({ id, result, error: null })
  } catch (err) {
    self.postMessage({ id, result: null, error: err.message })
  }
})
