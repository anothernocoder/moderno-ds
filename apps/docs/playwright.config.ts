/**
 * Playwright config for the docs visual regression seam.
 *
 * Screenshots are platform-specific down to the pixel, so the baselines this
 * repo commits are the Linux ones produced inside
 * `mcr.microsoft.com/playwright:v<version>-noble` — the same image the CI job
 * runs in (`.github/workflows/ci.yml`). `{platform}` in the snapshot path keeps
 * that honest: a local macOS or Windows run writes its own directory, which
 * `.gitignore` drops, so nobody can accidentally commit baselines CI will never
 * match. Regenerate the committed ones with `pnpm docs:visual:update`.
 *
 * Keep the `@playwright/test` version pinned exactly — it is half of the
 * image tag.
 */
import { defineConfig, devices } from "@playwright/test";

/** Container widths from the responsive policy (ADR-0005), plus a phone. */
const WIDTHS = [375, 768, 1280] as const;
const SCHEMES = ["light", "dark"] as const;

const PORT = Number(process.env.PORT ?? 4321);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  expect: {
    toHaveScreenshot: {
      // A design system's own docs should be deterministic; anything that
      // isn't is a bug in the page, not a threshold to raise.
      maxDiffPixels: 0,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  use: {
    baseURL: BASE_URL,
    reducedMotion: "reduce",
    trace: "off",
  },
  // Six projects: one per width × scheme. The spec is width-agnostic; the
  // matrix lives here so a new width is a one-line change.
  projects: SCHEMES.flatMap((colorScheme) =>
    WIDTHS.map((width) => ({
      name: `${width}-${colorScheme}`,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width, height: 900 },
        colorScheme,
      },
    })),
  ),
  webServer: {
    command: "node --experimental-strip-types ./scripts/serve-dist.ts",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { PORT: String(PORT) },
  },
});
