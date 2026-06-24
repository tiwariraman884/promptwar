"use client";

interface HealthScoreGaugeProps {
  score: number;
  grade: string;
  gradeHindi: string;
}

export function HealthScoreGauge({ score, grade, gradeHindi }: HealthScoreGaugeProps): JSX.Element {
  // Arc from 225° to -45° = 270° sweep
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = 225;
  const sweepAngle = 270;
  const endAngle = startAngle - sweepAngle;

  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const startX = cx + radius * Math.cos(toRad(startAngle));
  const startY = cy - radius * Math.sin(toRad(startAngle));
  const endX = cx + radius * Math.cos(toRad(endAngle));
  const endY = cy - radius * Math.sin(toRad(endAngle));

  // Fill arc proportional to score
  const fillAngle = startAngle - (sweepAngle * (score / 100));
  const fillX = cx + radius * Math.cos(toRad(fillAngle));
  const fillY = cy - radius * Math.sin(toRad(fillAngle));
  const fillSweep = sweepAngle * (score / 100);
  const largeArcFlag = fillSweep > 180 ? 1 : 0;

  // Color based on score
  const fillColor =
    score >= 80 ? "#22c55e" : // green-500
    score >= 60 ? "#84cc16" : // lime-500
    score >= 40 ? "#eab308" : // yellow-500
    score >= 20 ? "#f97316" : // orange-500
    "#ef4444"; // red-500

  // Background arc path
  const bgLargeArc = sweepAngle > 180 ? 1 : 0;
  const bgPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${bgLargeArc} 0 ${endX} ${endY}`;
  const fillPath = score > 0
    ? `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${fillX} ${fillY}`
    : "";

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="160" viewBox="0 0 200 180" className="w-48 h-auto">
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="#374151" strokeWidth="12" strokeLinecap="round" />
        {/* Fill arc */}
        {score > 0 && (
          <path d={fillPath} fill="none" stroke={fillColor} strokeWidth="12" strokeLinecap="round" />
        )}
        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-white text-4xl font-black"
          fontSize="40" fontWeight="900">{score}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-gray-500 text-sm"
          fontSize="14">/ 100</text>
      </svg>

      <div className="text-center -mt-2">
        <span className="block text-lg font-bold text-gray-200">{grade}</span>
        <span className="block text-sm text-gray-500">{gradeHindi}</span>
      </div>
    </div>
  );
}
