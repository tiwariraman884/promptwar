import dynamic from "next/dynamic";

// CarbonHealthScoreWidget requires Supabase auth — load client-side only
const CarbonHealthWidget = dynamic(
  () => import("@/components/health-score/HealthPageClient").then((m) => m.HealthPageClient),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-48 rounded-2xl bg-gray-800/50" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-gray-800/50" />
          ))}
        </div>
      </div>
    ),
  }
);

export default function HealthPage(): JSX.Element {
  return (
    <div className="min-h-screen pb-24">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-800/10" />
        <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">💚</span>
            <h1 className="font-bold text-2xl md:text-3xl text-white">Carbon Health Score</h1>
          </div>
          <p className="text-sm text-gray-400">
            Your 0–100 sustainability score, like CIBIL for carbon / कार्बन हेल्थ स्कोर
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6">
        <CarbonHealthWidget />
      </main>
    </div>
  );
}
