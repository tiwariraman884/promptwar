import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "green" | "amber" | "muted" | "dark";
};

export function Badge({ className, tone = "green", ...props }: BadgeProps) {
  const tones = {
    green: "bg-primary-light text-primary-dark",
    amber: "bg-amber-light text-amber",
    muted: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/70",
    dark: "bg-primary-dark text-white"
  };

  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-pill px-3 text-xs font-bold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
