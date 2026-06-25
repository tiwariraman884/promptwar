import dynamic from "next/dynamic";

// AIRoadmapWidget is a heavy client component — load it dynamically
const AIRoadmapWidget = dynamic(
  () => import("@/components/roadmap/AIRoadmap").then((m) => m.AIRoadmapWidget),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-24 rounded-2xl bg-gray-800/50" />
        ))}
      </div>
    ),
  }
);

export default function RoadmapPage(): JSX.Element {
  return (
    <div className="min-h-screen pb-24">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-emerald-800/10" />
        <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">🗺️</span>
            <h1 className="font-bold text-2xl md:text-3xl text-white">AI Reduction Roadmap</h1>
          </div>
          <p className="text-sm text-gray-400">
            Personalized 8-week action plan powered by AI / AI रिडक्शन रोडमैप
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6">
        <AIRoadmapWidget />
      </main>
    </div>
  );
}
