/**
 * Playwright config for the docs end-to-end seam.
 *
 * The suite asserts *facts about the built docs* — the sidebar's contents, that
 * every island hydrates on a page the seam knows about, and which CSS rule wins
 * inside a live `<Preview>` panel. All of them are text and computed styles, so
 * none of them commits an artifact, none conflicts between parallel branches,
 * and none depends on the host that ran it. (The pixel baselines this file used
 * to configure were dropped: every PR that touched a token or a stylesheet had
 * to regenerate 204 screenshots through a CI round-trip, which cost far more
 * than the diffs were worth.)
 *
 * One project, at the widest step of the responsive policy (ADR-0005), because
 * nothing left in the suite is width- or scheme-dependent.
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 4321);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    reducedMotion: "reduce",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: "node --experimental-strip-types ./scripts/serve-dist.ts",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { PORT: String(PORT) },
  },
});
