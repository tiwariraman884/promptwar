import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  label?: string;
};

export function Progress({
  value,
  max = 100,
  className,
  indicatorClassName,
  label
}: ProgressProps) {
  const width = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      className={cn("h-3 overflow-hidden rounded-pill bg-white/[0.08]", className)}
      role="progressbar"
    >
      <div
        className={cn(
          "h-full rounded-pill bg-gradient-to-r from-accent to-accent-hover transition-all duration-500",
          indicatorClassName
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
