"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CarbonAnalysisResult, EffortLevel } from "@/types/carbon";

const EFFORT_STYLES: Record<EffortLevel, string> = {
  Easy:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Hard:   "bg-red-500/10 text-red-400 border-red-500/20",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function RoadmapCard({ data }: { data: CarbonAnalysisResult["reduction_roadmap"] }) {
  const totalSavings = data.reduce((sum, a) => sum + a.estimated_monthly_reduction_kg, 0);

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-heading text-lg font-bold text-white">Reduction Roadmap</h3>

      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.map((action) => (
          <ActionCard key={action.rank} action={action} />
        ))}
      </motion.div>

      {/* Total savings */}
      <div className="flex items-center justify-between rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 p-4">
        <span className="text-sm font-semibold text-emerald-400">Total Potential Monthly Savings</span>
        <span className="text-lg font-heading font-extrabold text-emerald-400">
          {totalSavings} kg CO₂e
        </span>
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: CarbonAnalysisResult["reduction_roadmap"][number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden transition-colors hover:border-white/[0.12]"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start gap-3"
        id={`roadmap-action-${action.rank}`}
      >
        {/* Rank badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <span className="text-sm font-bold text-emerald-400">{action.rank}</span>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-white leading-snug">{action.action_title}</h4>
            <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${EFFORT_STYLES[action.effort_level]}`}>
              {action.effort_level}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-emerald-400 font-bold">−{action.estimated_monthly_reduction_kg} kg/mo</span>
            <span>•</span>
            <span className="text-gray-500">{expanded ? "Hide tip" : "Show India tip"} {expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {/* Collapsible India tip */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pt-0 pl-[60px]">
          <div className="rounded-lg bg-amber-500/[0.06] border border-amber-500/10 p-3">
            <p className="text-xs text-amber-200/80 leading-relaxed">
              <span className="text-amber-400 font-semibold">🇮🇳 India Tip: </span>
              {action.india_tip}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Loading skeleton ── */

export function RoadmapCardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4 animate-pulse">
      <div className="h-5 w-44 rounded bg-white/[0.06]" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white/[0.03]" />
        ))}
      </div>
      <div className="h-14 rounded-xl bg-emerald-500/[0.04]" />
    </div>
  );
}
