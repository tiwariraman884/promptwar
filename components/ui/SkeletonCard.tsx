/**
 * Generic skeleton loader for cards and sections.
 * Use rows={1} for stat cards, rows={4} for tables, rows={2} for charts.
 */
export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800/60 p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
      ))}
    </div>
  );
}
