"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  id?: string;
  size?: "sm" | "md";
}

export function SettingsToggle({ checked, onChange, disabled, id, size = "md" }: ToggleProps) {
  const w = size === "sm" ? "w-9 h-5" : "w-11 h-6";
  const knob = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const translate = size === "sm" ? "translate-x-[18px]" : "translate-x-[22px]";

  return (
    <button
      id={id}
      role="switch"
      type="button"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex shrink-0 items-center rounded-full
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        focus:outline-none focus:ring-2 focus:ring-[#52B788]/50 focus:ring-offset-2
        dark:focus:ring-offset-[#0B1815]
        ${w}
        ${checked
          ? "bg-gradient-to-r from-[#2D6A4F] to-[#52B788] shadow-[0_0_8px_rgba(82,183,136,0.3)]"
          : "bg-gray-200 dark:bg-white/15"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow-md
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${knob}
          ${checked ? translate : "translate-x-1"}
          ${checked ? "scale-110" : "scale-100"}
        `}
      />
    </button>
  );
}
