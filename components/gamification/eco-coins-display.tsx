import { Coins } from "lucide-react";

export function EcoCoinsDisplay({ coins }: { coins: number }) {
  return (
    <div className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-amber-light px-4 text-sm font-extrabold text-amber">
      <Coins aria-hidden size={18} />
      {coins.toLocaleString("en-IN")} eco-coins
    </div>
  );
}
