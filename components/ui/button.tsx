import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "amber" | "danger";
type ButtonSize = "default" | "sm" | "icon";

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const styles = cn(
      buttonBase,
      variant === "default" && "bg-primary text-white shadow-soft hover:bg-primary-dark",
      variant === "secondary" &&
        "border border-line bg-white text-ink hover:border-primary/40 hover:bg-primary-light dark:border-white/10 dark:bg-white/5 dark:text-white",
      variant === "ghost" &&
        "text-ink hover:bg-primary-light dark:text-white dark:hover:bg-white/10",
      variant === "amber" && "bg-amber text-white hover:bg-amber/90",
      variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
      size === "default" && "h-11",
      size === "sm" && "h-10 px-3",
      size === "icon" && "h-11 w-11 rounded-full p-0",
      className
    );
    return (
      <Comp
        className={styles}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
