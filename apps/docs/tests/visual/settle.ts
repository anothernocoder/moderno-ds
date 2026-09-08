/**
 * The "has the page stopped moving?" wait, shared by every capture in the seam.
 *
 * It lives in its own module because both `docs.spec.ts` and `chrome.spec.ts`
 * need it and both would otherwise race the same reflow.
 */
import type { Page } from "@playwright/test";

/**
 * Block until the captured geometry stops moving.
 *
 * A hydrating island can reflow after both `networkidle` and `document.fonts
 * .ready` have resolved, and `toHaveScreenshot` fails on a size mismatch before
 * any pixel tolerance applies — so the height is the thing to stabilise. Two
 * consecutive frames at the same height is enough to clear a reflow driven by
 * `onMount` or an effect; the polling stops as soon as that holds, so a static
 * prose page pays two frames, not the timeout.
 *
 * The polled value folds `#main`'s own box height in alongside the document's
 * `scrollHeight`. `docs.spec.ts` injects a stylesheet that collapses the
 * sidebar before this runs, which makes the page's total height a function of
 * `<main>` alone at 375/768 — tracking both means the settle guarantee covers
 * the box that actually determines the capture, not just the document it sits
 * in. Two terms, same two-frame semantics.
 */
export async function settled(page: Page, stableFrames = 2, timeoutMs = 5000): Promise<void> {
  await page.waitForFunction(
    ([needed, deadlineAt]) => {
      const w = window as unknown as { __h?: string; __n?: number };
      const main = document.getElementById("main");
      const height = `${document.documentElement.scrollHeight}:${
        main ? Math.round(main.getBoundingClientRect().height) : -1
      }`;
      w.__n = height === w.__h ? (w.__n ?? 0) + 1 : 0;
      w.__h = height;
      // Give up quietly rather than failing the run: a page that genuinely
      // never settles should be caught by the pixel diff, not by a timeout
      // whose message says nothing about what moved.
      return w.__n >= needed || Date.now() > deadlineAt;
    },
    [stableFrames, Date.now() + timeoutMs] as const,
    { polling: "raf", timeout: timeoutMs + 1000 },
  );
}
