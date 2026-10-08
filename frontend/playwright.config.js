import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.QA_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
