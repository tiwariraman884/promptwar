import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        /* ── Premium Dark Eco Palette ── */
        forest: {
          DEFAULT: "#1C2F2D",
          deep: "#0A1414",
          moss: "#314B33",
          teal: "#354947",
          olive: "#4D5A36",
        },
        accent: {
          DEFAULT: "#B8F34A",
          hover: "#A7E23D",
          muted: "#B8F34A",
          success: "#4CAF50",
          glow: "rgba(184, 243, 74, 0.3)",
        },
        /* ── Legacy aliases (keep for backward compat) ── */
        primary: {
          DEFAULT: "#B8F34A",
          light: "rgba(184, 243, 74, 0.12)",
          dark: "#1C2F2D",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "rgba(245, 158, 11, 0.12)",
        },
        ink: "#FFFFFF",
        mist: "#0A1414",
        line: "#55615A",
        /* ── Text palette ── */
        "text-primary": "#FFFFFF",
        "text-secondary": "#D1D5DB",
        "text-muted": "#9CA3AF",
      },
      borderRadius: {
        card: "16px",
        pill: "24px",
      },
      boxShadow: {
        soft: "0 8px 32px rgba(0, 0, 0, 0.25)",
        glow: "0 0 20px rgba(184, 243, 74, 0.15)",
        "glow-lg": "0 0 40px rgba(184, 243, 74, 0.2)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "DM Sans", "Inter", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        glass: "16px",
        "glass-lg": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
