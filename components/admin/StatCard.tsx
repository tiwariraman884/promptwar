interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  sublabel?: string;
  variant?: 'default' | 'critical';
}

export function StatCard({ icon, label, value, sublabel, variant = 'default' }: StatCardProps): JSX.Element {
  const isCritical = variant === 'critical' && typeof value === 'number' && value > 0;

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isCritical
          ? 'border-red-500/50 bg-red-950/80 shadow-lg shadow-red-500/20'
          : 'border-gray-800 bg-gray-900/80'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className={`text-2xl font-bold ${isCritical ? 'text-red-400' : 'text-white'}`}>
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {sublabel && (
            <p className="text-xs text-gray-500">{sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
