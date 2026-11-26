import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testMatch: /.*\.spec\.ts/,
  use: { baseURL: "http://localhost:4175" },
  webServer: { command: "node serve.mjs", url: "http://localhost:4175", reuseExistingServer: true },
  projects: [
    { name: "iPhone", use: { ...devices["iPhone 15"], browserName: "chromium" } },   // WebKit not preinstalled here
    { name: "Pixel", use: { ...devices["Pixel 7"] } },
  ],
});
