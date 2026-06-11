"use client";

import { useState, useEffect } from "react";
import { OFFSET_PROJECTS } from "@/lib/carbonData";
import { Leaf, MapPin, CheckCircle, Star, X } from "lucide-react";

export default function OffsetsPage() {
  const [footprint, setFootprint] = useState(1900);
  const [offsetPercent, setOffsetPercent] = useState(100);
  const [showModal, setShowModal] = useState<{ project: string; tonnes: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user_footprint");
    if (stored) {
      setFootprint(parseInt(stored, 10));
    }
  }, []);

  const offsetAmountKg = (footprint * offsetPercent) / 100;
  const offsetAmountTonnes = +(offsetAmountKg / 1000).toFixed(2);
  const lowestPrice = Math.min(...OFFSET_PROJECTS.map((p) => p.pricePerTonne));
  const estimatedCost = +(offsetAmountTonnes * lowestPrice).toFixed(2);

  const handlePurchase = (projectName: string, tonnes: number) => {
    setShowModal({ project: projectName, tonnes });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] pb-12">
      
      {/* Gap Calculator Hero */}
      <div className="bg-white dark:bg-[#1A2F2A] border-b border-[#52B788]/20 p-6 md:p-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-black text-[#2D6A4F] dark:text-[#52B788]">Your Offset Gap</h1>
          
          <div className="grid md:grid-cols-2 gap-8 items-center bg-[#F8FAF5] dark:bg-black/20 rounded-3xl p-6 md:p-8 border border-[#52B788]/30">
            <div className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-bold mb-2">My annual footprint (kg CO2)</label>
                <input
                  type="number"
                  value={footprint}
                  onChange={(e) => setFootprint(Number(e.target.value))}
                  className="w-full rounded-2xl border-2 border-[#52B788]/30 bg-white dark:bg-[#1A2F2A] px-4 py-3 text-lg focus:border-[#2D6A4F] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">I want to offset {offsetPercent}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={offsetPercent}
                  onChange={(e) => setOffsetPercent(Number(e.target.value))}
                  className="w-full accent-[#2D6A4F]"
                />
              </div>
            </div>

            <div className="bg-[#2D6A4F] text-white rounded-3xl p-6 shadow-md flex flex-col justify-center min-h-[200px]">
              <p className="text-[#B7E4C7] font-semibold mb-2">You need to offset</p>
              <p className="text-5xl font-black mb-4">{offsetAmountTonnes} <span className="text-xl font-bold">tonnes</span></p>
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm font-medium opacity-90">Estimated cost at lowest rate:</p>
                <p className="text-2xl font-bold mt-1">₹{estimatedCost}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16">
        
        {/* Project Cards */}
        <div>
          <h2 className="text-2xl font-bold text-[#2D6A4F] dark:text-[#52B788] mb-8">Verified Offset Projects</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {OFFSET_PROJECTS.map((p) => (
              <div key={p.id} className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{p.image}</span>
                    <h3 className="text-xl font-bold leading-tight">{p.name}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1 rounded-full bg-[#F8FAF5] dark:bg-black/30 px-3 py-1 text-neutral-600 dark:text-neutral-300">
                      <MapPin size={12} /> {p.location}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle size={12} /> {p.verified}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#52B788]/10">
                    <div>
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Impact</p>
                      <p className="font-semibold text-[#2D6A4F] dark:text-[#52B788]">{p.co2PerYear.toLocaleString()} tCO2/yr</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Rating</p>
                      <p className="font-semibold flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor" /> {p.rating}/5.0</p>
                    </div>
                  </div>
                </div>

                <div className="md:w-48 shrink-0 flex flex-col justify-center space-y-3 bg-[#F8FAF5] dark:bg-[#0B1815] rounded-2xl p-4 border border-[#52B788]/10">
                  <div className="text-center mb-2">
                    <span className="text-3xl font-black">₹{p.pricePerTonne}</span>
                    <span className="text-sm text-neutral-500 block">/ tonne</span>
                  </div>
                  <button
                    onClick={() => handlePurchase(p.name, 1)}
                    className="w-full rounded-xl bg-white dark:bg-[#1A2F2A] border-2 border-[#2D6A4F] py-2.5 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F8FAF5] dark:hover:bg-black/20 transition"
                  >
                    Offset 1 tonne — ₹{p.pricePerTonne}
                  </button>
                  <button
                    onClick={() => handlePurchase(p.name, offsetAmountTonnes)}
                    className="w-full rounded-xl bg-[#2D6A4F] py-2.5 text-sm font-bold text-white hover:bg-[#1B4332] transition"
                  >
                    Offset my gap — ₹{(offsetAmountTonnes * p.pricePerTonne).toFixed(2)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-[#2D6A4F] text-[#F8FAF5] rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 opacity-10">
            <Leaf size={300} />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl font-black mb-6">What is a carbon offset?</h2>
            <p className="text-lg leading-relaxed mb-8 font-medium opacity-90">
              A carbon offset represents the reduction of one metric tonne of CO2-equivalent greenhouse gas emissions. Offsets are generated by projects that either prevent emissions (e.g. solar energy replacing coal) or remove CO2 from the atmosphere (e.g. reforestation, biochar). Quality offsets are verified by independent standards like Gold Standard or Verra VCS, ensuring they are real, measurable, additional, and permanent. Offsets should complement — not replace — direct emission reductions.
            </p>

            <div className="bg-white/10 rounded-2xl overflow-hidden backdrop-blur-md border border-white/20">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/20">
                    <th className="p-4 font-bold text-[#B7E4C7] w-1/3">Criteria</th>
                    <th className="p-4 font-bold text-white w-1/3">Reduce Direct Emissions</th>
                    <th className="p-4 font-bold text-white w-1/3">Purchase Offsets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm md:text-base">
                  <tr>
                    <td className="p-4 font-semibold">Speed of Action</td>
                    <td className="p-4">Takes time to change habits/infrastructure</td>
                    <td className="p-4">Immediate financial impact</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Cost</td>
                    <td className="p-4">Can save money long-term (e.g., less fuel)</td>
                    <td className="p-4">Requires ongoing investment</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Permanence</td>
                    <td className="p-4">Permanent structural shift</td>
                    <td className="p-4">Depends on project quality (e.g., trees can burn)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0B1815] p-8 text-center shadow-2xl border border-[#52B788]/20 animate-in zoom-in-95 relative">
            <button onClick={() => setShowModal(null)} className="absolute right-4 top-4 text-neutral-400 hover:text-black dark:hover:text-white">
              <X size={20} />
            </button>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#52B788]/20 text-4xl">
              🌱
            </div>
            <h2 className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] mb-4">Offset Confirmed!</h2>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-6">Simulated Purchase</p>
            <p className="text-lg font-medium leading-relaxed mb-6">
              Your contribution of <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">{showModal.tonnes} tonnes</span> supports <br/>
              <span className="font-bold">{showModal.project}</span>.
            </p>
            <div className="bg-[#F8FAF5] dark:bg-[#1A2F2A] rounded-xl p-4 font-mono text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] border border-dashed border-[#52B788]/40 mb-8">
              Certificate #ECO-{Math.floor(100000 + Math.random() * 900000)}
            </div>
            <button
              onClick={() => setShowModal(null)}
              className="w-full rounded-xl bg-[#2D6A4F] py-3.5 font-bold text-white hover:bg-[#1B4332] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
