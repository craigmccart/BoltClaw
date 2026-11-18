import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    // API tests authenticate with the same header the dashboard sends.
    // UI tests open the authenticated URL instead (see tests/helpers.ts).
    extraHTTPHeaders: { "x-boltclaw-token": process.env.BOLTCLAW_API_TOKEN ?? "" },
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
