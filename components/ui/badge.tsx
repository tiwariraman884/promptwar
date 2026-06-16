import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "green" | "amber" | "muted" | "dark";
};

export function Badge({ className, tone = "green", ...props }: BadgeProps) {
  const tones = {
    green: "bg-accent/15 text-accent",
    amber: "bg-amber/15 text-amber",
    muted: "bg-white/10 text-text-muted",
    dark: "bg-white/10 text-white"
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
