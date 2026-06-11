"use client";

import { useState, useEffect } from "react";
import { callClaude } from "@/lib/anthropicClient";
import { REPORT_BENCHMARKS } from "@/lib/carbonData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from "recharts";
import { Download, Share2, Sparkles, TrendingDown, AlertCircle } from "lucide-react";

const AI_SYSTEM_PROMPT = `You are EcoCoach generating a personalised carbon reduction action plan.
Given a user's footprint breakdown, generate a prioritised action plan.
Respond ONLY with valid JSON (no markdown):
{
  "summary": "<2-sentence summary of their footprint profile>",
  "actions": [
    {
      "rank": 1,
      "category": "transport|food|energy|shopping|waste",
      "action": "<specific action>",
      "saving_kg_per_year": <number>,
      "difficulty": "Easy|Medium|Hard",
      "time_to_impact": "<e.g. Immediate | 1 month | 3 months>"
    }
  ],
  "total_potential_saving_kg": <number>,
  "motivational_message": "<one encouraging sentence>"
}
Generate 5 actions ranked by CO2 impact.`;

interface ActionPlan {
  summary: string;
  actions: {
    rank: number;
    category: string;
    action: string;
    saving_kg_per_year: number;
    difficulty: string;
    time_to_impact: string;
  }[];
  total_potential_saving_kg: number;
  motivational_message: string;
}

const CATEGORY_DATA = [
  { name: 'Transport', value: 820, color: '#2D6A4F', icon: '🚗' },
  { name: 'Food', value: 640, color: '#52B788', icon: '🍽️' },
  { name: 'Energy', value: 280, color: '#74C69D', icon: '🏠' },
  { name: 'Shopping', value: 120, color: '#95D5B2', icon: '🛍️' },
  { name: 'Waste', value: 40, color: '#B7E4C7', icon: '♻️' },
];

const MONTHLY_DATA = [
  { month: 'Jan', value: 140 }, { month: 'Feb', value: 145 },
  { month: 'Mar', value: 135 }, { month: 'Apr', value: 150 },
  { month: 'May', value: 160 }, { month: 'Jun', value: 175 },
  { month: 'Jul', value: 180 }, { month: 'Aug', value: 165 },
  { month: 'Sep', value: 155 }, { month: 'Oct', value: 150 },
  { month: 'Nov', value: 160 }, { month: 'Dec', value: 185 },
];

export default function ReportPage() {
  const [footprint, setFootprint] = useState(1900);
  const [activeCategory, setActiveCategory] = useState(CATEGORY_DATA[0]);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user_footprint");
    if (stored) {
      setFootprint(parseInt(stored, 10));
    }
  }, []);

  const diffParis = ((footprint - REPORT_BENCHMARKS.paris_2030) / REPORT_BENCHMARKS.paris_2030) * 100;
  const isBelowParis = diffParis <= 0;
  
  let scoreColor = "text-emerald-500";
  if (footprint > 2300 && footprint <= 4000) scoreColor = "text-amber-500";
  if (footprint > 4000) scoreColor = "text-rose-500";

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setError("");
    try {
      const userMessage = `My annual footprint: Transport 820kg, Food 640kg, Energy 280kg, Shopping 120kg, Waste 40kg. Total: ${footprint}kg CO2e. India average: 1900kg. Paris target: 2300kg.`;
      const responseText = await callClaude(AI_SYSTEM_PROMPT, userMessage);
      const cleanJson = responseText.replace(/^[`\s]*json|[`\s]*$/gi, '').trim();
      setActionPlan(JSON.parse(cleanJson));
    } catch (err) {
      console.error(err);
      setError("Failed to generate plan. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleShare = () => {
    const text = `My carbon footprint is ${footprint} kg CO2/year — ${Math.abs(Math.round(((footprint - REPORT_BENCHMARKS.global_avg)/REPORT_BENCHMARKS.global_avg)*100))}% ${footprint < REPORT_BENCHMARKS.global_avg ? "below" : "above"} the global average. Tracking with EcoTrack 🌱`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleDownload = () => {
    alert("PDF export coming soon. Use browser print for now.");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] pb-24 md:pb-12">
      
      {/* Top Header Actions */}
      <div className="sticky top-0 md:top-16 z-20 bg-white/80 dark:bg-[#0B1815]/80 backdrop-blur-md border-b border-[#52B788]/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788]">Your Footprint Report</h1>
          <div className="flex gap-2">
            <button onClick={handleShare} className="rounded-full bg-white dark:bg-[#1A2F2A] border border-[#52B788]/30 p-2.5 text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F8FAF5] transition" title="Share my progress">
              <Share2 size={18} />
            </button>
            <button onClick={handleDownload} className="rounded-full bg-[#2D6A4F] text-white p-2.5 hover:bg-[#1B4332] transition" title="Download PDF Report">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Section 1: Score Card & Benchmarks */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-[#1A2F2A] p-8 shadow-sm border border-[#52B788]/20 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center mb-6">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" className="stroke-neutral-100 dark:stroke-neutral-800" strokeWidth="16" fill="none" />
                <circle cx="96" cy="96" r="88" className={`${scoreColor} transition-all duration-1000`} strokeWidth="16" fill="none" strokeDasharray="552.92" strokeDashoffset={552.92 - (552.92 * Math.min(footprint, 6000) / 6000)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">{footprint}</span>
                <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider mt-1">kg CO2e</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Annual Footprint</h2>
            <div className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${isBelowParis ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              {isBelowParis ? <TrendingDown size={16} /> : <AlertCircle size={16} />}
              {Math.abs(Math.round(diffParis))}% {isBelowParis ? 'below' : 'above'} Paris target
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#1A2F2A] p-8 shadow-sm border border-[#52B788]/20">
            <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-6">Global Benchmarks</h3>
            <div className="space-y-6">
              {[
                { label: 'Your Footprint', val: footprint, color: 'bg-[#2D6A4F]' },
                { label: 'Paris Target (2030)', val: REPORT_BENCHMARKS.paris_2030, color: 'bg-[#52B788]' },
                { label: 'India Average', val: REPORT_BENCHMARKS.india_avg, color: 'bg-neutral-300 dark:bg-neutral-600' },
                { label: 'Global Average', val: REPORT_BENCHMARKS.global_avg, color: 'bg-neutral-200 dark:bg-neutral-700' },
              ].map((b, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span>{b.label}</span>
                    <span>{b.val.toLocaleString()} kg</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className={`h-full rounded-full ${b.color}`} style={{ width: `${Math.min((b.val / 5000) * 100, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2 & 3: Breakdown & Trend */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Breakdown Donut */}
          <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
            <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">Emissions by Category</h3>
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      onClick={(_, index) => setActiveCategory(CATEGORY_DATA[index])}
                      className="cursor-pointer"
                    >
                      {CATEGORY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val: number) => `${val} kg`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 mt-4 sm:mt-0">
                <div className="rounded-2xl bg-[#F8FAF5] dark:bg-black/20 p-5 border border-[#52B788]/20">
                  <div className="text-4xl mb-3">{activeCategory.icon}</div>
                  <h4 className="text-xl font-bold mb-1">{activeCategory.name}</h4>
                  <p className="text-3xl font-black text-[#2D6A4F] dark:text-[#52B788]">
                    {activeCategory.value} <span className="text-sm font-bold uppercase">kg CO2</span>
                  </p>
                  <p className="text-sm font-semibold text-neutral-500 mt-2">
                    {Math.round((activeCategory.value / footprint) * 100)}% of your total footprint
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
            <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">Monthly Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52B78820" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => [`${val} kg`, 'Footprint']}
                  />
                  <Line type="monotone" dataKey="value" stroke="#2D6A4F" strokeWidth={3} dot={{ r: 4, fill: '#2D6A4F' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Section 4: AI Action Plan */}
        <div className="rounded-3xl bg-[#2D6A4F] p-8 md:p-12 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Sparkles size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/20 pb-8">
              <div>
                <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                  <Sparkles className="text-[#52B788]" /> AI Action Plan
                </h2>
                <p className="text-[#B7E4C7] text-lg font-medium">Personalized strategies to reduce your footprint.</p>
              </div>
              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="rounded-full bg-white text-[#2D6A4F] px-8 py-4 font-bold hover:bg-[#F8FAF5] transition disabled:opacity-50 whitespace-nowrap shadow-lg"
              >
                {isGeneratingPlan ? "Generating..." : "Generate My Plan"}
              </button>
            </div>

            {error && <div className="bg-red-500/20 text-red-100 p-4 rounded-xl mb-8 font-medium">{error}</div>}

            {actionPlan && (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
                  <p className="text-xl font-medium leading-relaxed">{actionPlan.summary}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {actionPlan.actions.map((act) => (
                    <div key={act.rank} className="bg-white dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] rounded-2xl p-6 relative">
                      <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-[#52B788] text-[#1B4332] flex items-center justify-center font-black shadow-sm">
                        {act.rank}
                      </div>
                      <div className="flex justify-between items-start mb-3 ml-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{act.category}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                          act.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : 
                          act.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {act.difficulty}
                        </span>
                      </div>
                      <p className="font-bold text-lg mb-4 ml-2">{act.action}</p>
                      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4 ml-2">
                        <span className="text-sm font-semibold text-neutral-500 flex items-center gap-1">⏱️ {act.time_to_impact}</span>
                        <span className="font-black text-[#2D6A4F] dark:text-[#52B788] bg-[#52B788]/10 px-3 py-1 rounded-full">
                          -{act.saving_kg_per_year} kg CO2
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-12 bg-black/20 p-8 rounded-3xl backdrop-blur-sm">
                  <p className="text-2xl font-black mb-2 text-[#52B788]">
                    Potential Savings: {actionPlan.total_potential_saving_kg} kg CO2/year
                  </p>
                  <p className="text-lg font-medium italic opacity-90">&ldquo;{actionPlan.motivational_message}&rdquo;</p>
                </div>
              </div>
            )}
            
            {!actionPlan && !isGeneratingPlan && !error && (
              <div className="text-center py-12 opacity-60">
                <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Click generate to receive your personalized, AI-driven action plan.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
