import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "green" | "amber" | "muted" | "dark";
};

export function Badge({ className, tone = "green", ...props }: BadgeProps) {
  const tones = {
    green: "bg-emerald-100 text-emerald-700 dark:bg-accent/15 dark:text-accent",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber/15 dark:text-amber",
    muted: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-text-muted",
    dark: "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-white"
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
