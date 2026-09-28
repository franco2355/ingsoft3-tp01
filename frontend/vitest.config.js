import { defineConfig } from "vitest/config";


export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/logic.js"],
      reportsDirectory: "coverage",
      reporter: ["text", "json-summary", "html", "lcov"],
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90,
      },
    },
  },
});
