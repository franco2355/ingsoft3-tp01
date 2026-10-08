import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: ["src/logic.js"],
      reporter: ["text", "html", ["text-summary", { file: "summary.txt" }]],
      thresholds: { lines: 90, branches: 85 },
    },
  },
});
