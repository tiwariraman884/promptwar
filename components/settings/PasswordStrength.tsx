"use client";

interface PasswordStrengthProps {
  password: string;
}

const CRITERIA = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const passed = CRITERIA.filter((c) => c.test(password)).length;
  const score = Math.min(passed, 5);
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = ["", "bg-red-500", "bg-orange-400", "bg-amber-400", "bg-emerald-500", "bg-[#2D6A4F]"];
  const textColors = ["", "text-red-600", "text-orange-500", "text-amber-600", "text-emerald-600", "text-[#2D6A4F] dark:text-[#52B788]"];

  return (
    <div className="mt-3 space-y-2.5">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : "bg-gray-100 dark:bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-bold ${textColors[score]}`}>{labels[score]}</p>

      {/* Criteria checklist */}
      <div className="grid grid-cols-1 gap-1">
        {CRITERIA.map((c) => {
          const met = c.test(password);
          return (
            <div key={c.label} className="flex items-center gap-2">
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] transition-all duration-200 ${
                  met
                    ? "bg-[#2D6A4F] text-white scale-100"
                    : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/50 scale-90"
                }`}
              >
                {met ? "✓" : "·"}
              </span>
              <span className={`text-xs transition-colors ${met ? "text-[#2D6A4F] dark:text-[#52B788] font-medium" : "text-gray-400 dark:text-white/60"}`}>
                {c.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
