import dynamic from "next/dynamic";

// CarbonTwin components require Supabase auth — load client-side only
const TwinPageClient = dynamic(
  () => import("@/components/carbon-twin/TwinPageClient").then((m) => m.TwinPageClient),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-pulse text-emerald-400 text-lg">Loading Carbon Twin...</div>
      </div>
    ),
  }
);

export default function CarbonTwinPage(): JSX.Element {
  return (
    <div className="min-h-screen pb-24">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-green-800/10" />
        <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">🧬</span>
            <h1 className="font-bold text-2xl md:text-3xl text-white">Carbon Twin</h1>
          </div>
          <p className="text-sm text-gray-400">
            Your complete digital carbon identity — कार्बन ट्विन
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6">
        <TwinPageClient />
      </main>
    </div>
  );
}
