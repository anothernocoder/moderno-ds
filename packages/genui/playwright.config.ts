/**
 * The playground's QA script (playground/e2e): it chats, types, selects and
 * submits in every theme, at desktop and at 375px. Fixture mode by default;
 * `GENUI_REAL=1` keeps the keys in `.env.local`, for a human QA run.
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 5180);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./playground/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  // A real-mode turn takes 10–30 s.
  timeout: process.env.GENUI_REAL ? 300_000 : 30_000,
  expect: { timeout: process.env.GENUI_REAL ? 120_000 : 5_000 },
  workers: process.env.GENUI_REAL ? 3 : undefined,
  // Every control is on the page once its answer has arrived.
  use: { baseURL: BASE_URL, reducedMotion: "reduce", trace: "off", actionTimeout: 15_000 },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    {
      name: "375px",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: {
    command: `vite playground --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: process.env.GENUI_REAL ? {} : { GENUI_FIXTURES: "1" },
  },
});
