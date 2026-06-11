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
        primary: {
          DEFAULT: "#1D9E75",
          light: "#E1F5EE",
          dark: "#085041"
        },
        amber: {
          DEFAULT: "#BA7517",
          light: "#FFF2D6"
        },
        ink: "#18342E",
        mist: "#F6FBF8",
        line: "#D9E8E2"
      },
      borderRadius: {
        card: "12px",
        pill: "20px"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(8, 80, 65, 0.08)"
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        body: ["DM Sans", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
