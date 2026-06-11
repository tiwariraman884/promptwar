import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuantityStepper({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 rounded-card border border-line bg-white px-3 dark:border-white/10 dark:bg-white/5">
      <span className="text-sm font-bold">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          size="icon"
          type="button"
          variant="secondary"
        >
          <Minus aria-hidden size={16} />
        </Button>
        <span className="w-8 text-center font-heading text-lg font-extrabold">
          {value}
        </span>
        <Button
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          size="icon"
          type="button"
          variant="secondary"
        >
          <Plus aria-hidden size={16} />
        </Button>
      </div>
    </div>
  );
}
