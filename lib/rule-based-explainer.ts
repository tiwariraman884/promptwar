// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RULE-BASED EXPLAINER — No AI call needed (Feature 6)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type {
  CarbonHealthScore,
  EmissionBreakdown,
  CategoryEmission,
  CarbonTwinProfile,
  ForecastPoint,
  AIExplanation,
  ExplanationFactor,
} from "./types/carbon-twin-types";

export function explainHealthScore(
  score: CarbonHealthScore,
  breakdown: EmissionBreakdown
): AIExplanation {
  const sortedByScore = [...score.categoryScores].sort((a, b) => a.score - b.score);
  const worst = sortedByScore[0];
  const best = sortedByScore[sortedByScore.length - 1];

  const factors: ExplanationFactor[] = score.categoryScores.map((c) => {
    const cat = breakdown.byCategory.find((b) => b.category === c.category);
    return {
      name: c.label,
      nameHindi: c.labelHindi,
      contribution: cat?.monthlyCO2Kg ?? 0,
      percentOfTotal: cat?.percentOfTotal ?? 0,
      direction: c.score < 50 ? "positive" : "negative",
      detail: `Score: ${c.score}/100 (weight: ${(c.weight * 100).toFixed(0)}%)`,
    };
  });

  return {
    headline: `Your score is ${score.overallScore}/100 — ${score.grade}`,
    headlineHindi: `आपका स्कोर ${score.overallScore}/100 — ${score.gradeHindi}`,
    summary:
      `Your overall carbon health is ${score.grade.toLowerCase()}. ` +
      `The score weighs your travel (30%), energy (25%), diet (25%), ` +
      `shopping (10%), and waste (10%). ` +
      `${best.label} is your strongest area (${best.score}/100), while ` +
      `${worst.label} needs the most attention (${worst.score}/100).`,
    factors,
    recommendation: `Focus on ${worst.label} first — it's your weakest area at ${worst.score}/100.`,
    recommendationHindi: `${worst.labelHindi} पर पहले ध्यान दें — यह आपका कमजोर क्षेत्र है (${worst.score}/100)।`,
    sourceLabel: "Rule-based calculation — CEA India, IPCC AR6",
  };
}

export function explainCategoryEmission(
  category: CategoryEmission,
  _profile: CarbonTwinProfile
): AIExplanation {
  const tipMap: Record<string, { tip: string; tipHindi: string }> = {
    diet: {
      tip: "Try adding 2 more vegetarian days per week to cut diet emissions by ~15%.",
      tipHindi: "सप्ताह में 2 और शाकाहारी दिन जोड़ें — आहार उत्सर्जन ~15% कम होगा।",
    },
    travel: {
      tip: "Switching to metro/bus for daily commute can reduce travel emissions by 50%+.",
      tipHindi: "रोज़ मेट्रो/बस से जाएं — यात्रा उत्सर्जन 50%+ कम होगा।",
    },
    energy: {
      tip: "Set AC to 26°C and switch to LED bulbs to cut energy emissions significantly.",
      tipHindi: "AC 26°C पर रखें और LED लगाएं — ऊर्जा उत्सर्जन काफ़ी कम होगा।",
    },
    shopping: {
      tip: "Buy refurbished electronics and reduce online orders to lower shopping footprint.",
      tipHindi: "रीफर्बिश्ड इलेक्ट्रॉनिक्स खरीदें — खरीदारी का कार्बन फ़ुटप्रिंट कम होगा।",
    },
    waste: {
      tip: "Start composting kitchen waste — it reduces waste emissions by 98%.",
      tipHindi: "किचन वेस्ट की कम्पोस्टिंग शुरू करें — कचरा उत्सर्जन 98% कम होगा।",
    },
  };

  const tips = tipMap[category.category] ?? { tip: "Review this category.", tipHindi: "इस श्रेणी की समीक्षा करें।" };

  return {
    headline: `${category.label}: ${category.monthlyCO2Kg} kg CO₂/month`,
    headlineHindi: `${category.labelHindi}: ${category.monthlyCO2Kg} kg CO₂/माह`,
    summary: `${category.label} accounts for ${category.percentOfTotal}% of your total monthly emissions (${category.monthlyCO2Kg} kg CO₂).`,
    factors: [
      {
        name: category.label,
        nameHindi: category.labelHindi,
        contribution: category.monthlyCO2Kg,
        percentOfTotal: category.percentOfTotal,
        direction: "positive",
        detail: `${category.percentOfTotal}% of your total footprint`,
      },
    ],
    recommendation: tips.tip,
    recommendationHindi: tips.tipHindi,
    sourceLabel: "Rule-based calculation — CEA India, IPCC AR6",
  };
}

export function explainForecast(
  forecast: ForecastPoint,
  snapshots: { year_month: string; total_kg: number }[]
): AIExplanation {
  const trendWord =
    forecast.trend === "up" ? "increasing" : forecast.trend === "down" ? "decreasing" : "stable";
  const trendWordHindi =
    forecast.trend === "up" ? "बढ़ रहा है" : forecast.trend === "down" ? "घट रहा है" : "स्थिर है";

  const lastValue = snapshots.length > 0 ? snapshots[snapshots.length - 1].total_kg : 0;
  const diff = forecast.projectedKg - lastValue;

  return {
    headline: `${forecast.label}: ${forecast.projectedKg} kg projected`,
    headlineHindi: `${forecast.label}: ${forecast.projectedKg} kg अनुमानित`,
    summary:
      `Based on ${snapshots.length} months of data, your emissions trend is ${trendWord}. ` +
      `The forecast uses linear regression with a 90% confidence interval ` +
      `(${forecast.confidenceMin}–${forecast.confidenceMax} kg). ` +
      `${diff > 0 ? `That's ${diff.toFixed(1)} kg more than your latest month.` : `That's ${Math.abs(diff).toFixed(1)} kg less than your latest month.`}`,
    factors: [
      {
        name: "Trend direction",
        nameHindi: "प्रवृत्ति दिशा",
        contribution: diff,
        percentOfTotal: lastValue > 0 ? parseFloat(((diff / lastValue) * 100).toFixed(1)) : 0,
        direction: diff > 0 ? "positive" : "negative",
        detail: `Your footprint is ${trendWord} — ${trendWordHindi}`,
      },
    ],
    recommendation:
      forecast.trend === "up"
        ? "Your emissions are trending up. Review your highest-emission category to reverse the trend."
        : forecast.trend === "down"
          ? "Great progress! Keep your current habits to maintain the downward trend."
          : "Your emissions are stable. Small habit changes can help reduce them further.",
    recommendationHindi:
      forecast.trend === "up"
        ? "उत्सर्जन बढ़ रहा है। सबसे ज़्यादा उत्सर्जन वाली श्रेणी की समीक्षा करें।"
        : forecast.trend === "down"
          ? "बढ़िया प्रगति! मौजूदा आदतें बनाए रखें।"
          : "उत्सर्जन स्थिर है। छोटे बदलाव इसे और कम कर सकते हैं।",
    sourceLabel: "Linear regression model — based on your emission history",
  };
}
