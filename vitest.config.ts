import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "__tests__/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: [
        "lib/**/*.ts",
        "hooks/**/*.ts",
      ],
      exclude: [
        "lib/**/*-data.ts",     // static data files
        "lib/**/translations.ts",
        "lib/**/supabase/**",
        "lib/**/i18n-context.tsx",
        "lib/**/settings-context.tsx",
        "lib/**/green-map-store.ts",
        "lib/**/v2-data.ts",
        "lib/**/quick-wins-data.ts",
        "lib/**/quiz-data.ts",
        "lib/**/aqi-data.ts",
        "lib/**/demo-data.ts",
        "lib/**/energy-audit-data.ts",
        "lib/**/carbonData.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      reporter: ["text", "text-summary", "json-summary", "html"],
      reportsDirectory: "./coverage",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
