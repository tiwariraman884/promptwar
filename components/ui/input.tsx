import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex min-h-11 w-full rounded-card border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-300 placeholder:text-gray-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-text-muted dark:focus:border-accent/50 dark:focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        type={type}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
