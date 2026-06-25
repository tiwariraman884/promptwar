import dynamic from "next/dynamic";

// CarbonSimulator requires Supabase auth + heavy slider logic — load client-side only
const SimulatorWidget = dynamic(
  () => import("@/components/simulator/SimulatorPageClient").then((m) => m.SimulatorPageClient),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse h-20 rounded-xl bg-gray-800/50" />
        ))}
      </div>
    ),
  }
);

export default function SimulatorPage(): JSX.Element {
  return (
    <div className="min-h-screen pb-24">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-emerald-800/10" />
        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">🎚️</span>
            <h1 className="font-bold text-2xl md:text-3xl text-white">Carbon Simulator</h1>
          </div>
          <p className="text-sm text-gray-400">
            What-if tool — adjust habits and see your footprint change instantly / कार्बन सिम्युलेटर
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6">
        <SimulatorWidget />
      </main>
    </div>
  );
}
