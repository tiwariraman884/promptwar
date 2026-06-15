import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: [
        "lib/**/*-data.ts",     // static data files
        "lib/**/translations.ts",
        "lib/**/supabase/**",
        "lib/**/i18n-context.tsx",
        "lib/**/settings-context.tsx",
        "lib/**/green-map-store.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
