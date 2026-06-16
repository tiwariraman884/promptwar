import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex min-h-11 w-full rounded-card border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm transition-all duration-300 placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-50",
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
