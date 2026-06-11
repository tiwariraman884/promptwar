"use client";

interface PasswordStrengthProps {
  password: string;
}

const REQUIREMENTS = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const passed = REQUIREMENTS.filter((r) => r.test(password)).length;
  const strength = passed <= 2 ? "Weak" : passed <= 4 ? "Medium" : "Strong";
  const color =
    strength === "Weak"
      ? "#EF4444"
      : strength === "Medium"
      ? "#F59E0B"
      : "#00E676";
  const pct = (passed / REQUIREMENTS.length) * 100;

  return (
    <div className="mt-3 space-y-2">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="text-[11px] font-bold" style={{ color }}>
          {strength}
        </span>
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {REQUIREMENTS.map((r) => {
          const ok = r.test(password);
          return (
            <div
              key={r.label}
              className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                ok ? "text-[#00E676]" : "text-white/30"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {ok ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <circle cx="12" cy="12" r="8" />
                )}
              </svg>
              {r.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
