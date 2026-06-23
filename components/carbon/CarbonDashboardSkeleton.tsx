/**
 * Skeleton loader for the Carbon Intelligence Dashboard.
 * Extracted to its own file so importing it doesn't pull in recharts/framer-motion.
 */

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.04] ${className}`} />;
}

function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 backdrop-blur-xl p-6">
      {children}
    </div>
  );
}

export function CarbonDashboardSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Risk Score skeleton */}
      <SkeletonCard>
        <SkeletonPulse className="h-4 w-36 mb-6" />
        <div className="flex justify-center mb-6">
          <div className="w-40 h-40 rounded-full bg-white/[0.04] animate-pulse" />
        </div>
        <div className="space-y-3 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <SkeletonPulse className="h-3 w-20" />
                <SkeletonPulse className="h-3 w-6" />
              </div>
              <SkeletonPulse className="h-1.5 w-full" />
            </div>
          ))}
        </div>
        <SkeletonPulse className="h-10 w-full rounded-xl" />
      </SkeletonCard>

      {/* Forecast skeleton */}
      <SkeletonCard>
        <div className="flex justify-between mb-6">
          <SkeletonPulse className="h-4 w-40" />
          <SkeletonPulse className="h-6 w-24 rounded-full" />
        </div>
        <SkeletonPulse className="h-[200px] w-full rounded-xl mb-4" />
        <SkeletonPulse className="h-10 w-full rounded-xl" />
      </SkeletonCard>

      {/* Roadmap skeleton */}
      <SkeletonCard>
        <SkeletonPulse className="h-4 w-44 mb-5" />
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-[68px] w-full rounded-xl" />
          ))}
        </div>
        <SkeletonPulse className="mt-4 h-12 w-full rounded-xl" />
      </SkeletonCard>

      {/* Timeline skeleton */}
      <SkeletonCard>
        <SkeletonPulse className="h-4 w-44 mb-5" />
        <SkeletonPulse className="h-[220px] w-full rounded-xl mb-4" />
        <div className="flex justify-between">
          <SkeletonPulse className="h-4 w-48" />
          <SkeletonPulse className="h-8 w-36 rounded-lg" />
        </div>
      </SkeletonCard>
    </div>
  );
}
