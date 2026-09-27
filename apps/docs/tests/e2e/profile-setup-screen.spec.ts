/**
 * The profile setup screen, checked where it is shown to a reader: the built
 * docs page, at the three widths of the responsive policy (375 / 768 / 1280) in
 * both colour schemes, and in the three site themes.
 *
 * Three claims:
 *
 * 1. **Container, not viewport.** The screen's steps are read off the width of
 *    the frame it was mounted in, never the window: the masthead and the photo
 *    row line up at `--container-sm`, the footer at `--container-md`. The demo's
 *    Phone, Tablet and Desktop tabs mount the same file at three frame widths,
 *    so at every viewport the phone copy stacks and the other two do not.
 * 2. **A screen owns the viewport as a height.** Its root fills the frame it is
 *    given, which the demo treats as its window. That the shipped file says
 *    `min-h-dvh` is held by `tooling/cli/test/install/profile-setup.test.ts`.
 * 3. **AA contrast** on every text the screen paints — its own chrome, the
 *    avatar's initials, the photo buttons, the alerts and the form block — in
 *    Moderno, Neutro and Contrast, in light and in dark.
 *
 * Each state the page shows is held too: the photo, the busy upload, the
 * rejected photo, the save error, the save in flight and the empty avatar.
 */
import { expect, test, type Page } from "@playwright/test";

/** The contract's two container steps the screen reads, in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/profile-setup/";

const ROOT = "div.moderno-screen-profile-setup";

/**
 * Every copy of the screen the page mounts (islands/ProfileSetupScreenDemo.svelte),
 * in order: the main preview's three width tabs, then each state in its own
 * Examples preview at the tablet width.
 */
const TABS = [
  "phone",
  "tablet",
  "desktop",
  "photo",
  "uploading",
  "photo-error",
  "error",
  "loading",
  "empty",
] as const;
type Tab = (typeof TABS)[number];

const WIDTH_TABS: readonly Tab[] = ["phone", "tablet", "desktop"];

/** The copies whose text is all live (no inert control) and so must clear AA. */
const CONTRAST_TABS: readonly Tab[] = ["tablet", "photo", "photo-error", "error", "empty"];

/** The site themes the header offers, as the `data-brand` each sets on <html>. */
const THEMES = [
  { name: "Moderno", brand: "moderno" },
  { name: "Neutro", brand: null },
  { name: "Contrast", brand: "contrast" },
] as const;

interface ScreenMetrics {
  containerWidth: number;
  rootHeight: number;
  frameHeight: number;
  mastheadDisplay: string;
  photoRowDisplay: string;
  footerDisplay: string;
  headingLevels: number[];
}

async function screenMetrics(page: Page, tab: Tab): Promise<ScreenMetrics[]> {
  return page.evaluate(
    ({ state, rootSelector }) => {
      const panel = document.querySelector(`[data-demo-state="${state}"]`);
      if (!panel) throw new Error(`no ${state} stage on the page`);
      return [...panel.querySelectorAll(rootSelector)].map((root) => {
        const masthead = root.querySelector(":scope > div > header");
        const photoRow = root.querySelector("section > div:has(> [data-scope='avatar'])");
        const footer = root.querySelector(":scope > div > footer");
        if (!masthead || !photoRow || !footer) {
          throw new Error("the profile setup screen did not render its own markup");
        }
        return {
          // Layout size, not the painted box: the docs scale the device to fit
          // the column, and that transform never changes what the container reads.
          containerWidth: (root as HTMLElement).offsetWidth,
          rootHeight: (root as HTMLElement).offsetHeight,
          frameHeight: (root.parentElement as HTMLElement).clientHeight,
          mastheadDisplay: getComputedStyle(masthead).display,
          photoRowDisplay: getComputedStyle(photoRow).display,
          footerDisplay: getComputedStyle(footer).display,
          headingLevels: [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) =>
            Number(h.getAttribute("aria-level") ?? h.tagName.slice(1)),
          ),
        };
      });
    },
    { state: tab, rootSelector: ROOT },
  );
}

/** Scrolls the preview into view and waits for it to hydrate (it mounts `client:visible`). */
async function hydrated(page: Page): Promise<void> {
  await page.locator(".preview-panel--demo").first().scrollIntoViewIfNeeded();
  await page
    .locator(".preview-panel--demo astro-island:not([ssr])")
    .first()
    .waitFor({ state: "attached" });
}

/** Brings up one entry of `TABS` — a width tab or a state's preview — and waits for its copy. */
async function showTab(page: Page, tab: Tab): Promise<void> {
  if (WIDTH_TABS.includes(tab)) {
    await page.locator(`[data-demo-tab="${tab}"]`).click();
  } else {
    await page.locator(`[data-demo-state="${tab}"]`).scrollIntoViewIfNeeded();
    await page
      .locator(`astro-island:not([ssr]):has([data-demo-state="${tab}"])`)
      .waitFor({ state: "attached" });
  }
  await page.locator(`[data-demo-state="${tab}"] ${ROOT}`).waitFor({ state: "attached" });
}

/**
 * The contrast of every piece of text inside `tab`'s copy of the screen, keyed
 * by a short description of where it is.
 *
 * Colours are resolved through a canvas rather than parsed: the contract's
 * values are OKLCH and the browser is the only thing that converts them exactly
 * the way it painted them. Translucent backgrounds are composited down to the
 * first opaque one, and a translucent text colour onto that.
 */
async function contrastRatios(page: Page, tab: Tab): Promise<Record<string, number>> {
  return page.evaluate(
    ({ state, rootSelector }) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no 2d context");

      type Rgba = [number, number, number, number];

      function toRgba(color: string): Rgba {
        ctx!.clearRect(0, 0, 1, 1);
        ctx!.fillStyle = color;
        ctx!.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx!.getImageData(0, 0, 1, 1).data;
        return [r!, g!, b!, a! / 255];
      }

      function over([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
        return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
      }

      function luminance([r, g, b]: Rgba): number {
        const channel = (v: number) => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      }

      /** The background behind `el`, every translucent layer composited. */
      function surfaceOf(el: Element): Rgba {
        const layers: Rgba[] = [];
        let node: Element | null = el;
        while (node) {
          const layer = toRgba(getComputedStyle(node).backgroundColor);
          if (layer[3] > 0) layers.push(layer);
          if (layer[3] >= 1) break;
          node = node.parentElement;
        }
        let surface: Rgba = node
          ? layers.pop()!
          : toRgba(getComputedStyle(document.body).backgroundColor);
        for (const layer of layers.reverse()) surface = over(layer, surface);
        return surface;
      }

      function ratio(el: Element): number {
        const bg = surfaceOf(el);
        const fg = over(toRgba(getComputedStyle(el).color), bg);
        const a = luminance(fg);
        const b = luminance(bg);
        const [hi, lo] = a > b ? [a, b] : [b, a];
        return (hi + 0.05) / (lo + 0.05);
      }

      const root = document.querySelector(`[data-demo-state="${state}"] ${rootSelector}`);
      if (!root) throw new Error(`the ${state} copy of the screen did not render`);

      const ratios: Record<string, number> = {};
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); text; text = walker.nextNode()) {
        const content = text.textContent?.trim();
        const el = text.parentElement;
        if (!content || !el) continue;
        // Only what is painted: hidden parts (Ark's hidden fallback, an empty
        // error slot) and screen-reader-only text are not on screen.
        if (el.closest("[hidden], [aria-hidden='true'], .sr-only")) continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        if (getComputedStyle(el).visibility === "hidden") continue;
        ratios[`${el.tagName.toLowerCase()} "${content.slice(0, 32)}"`] = ratio(el);
      }
      return ratios;
    },
    { state: tab, rootSelector: ROOT },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`profile-setup — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));
        await hydrated(page);

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const screens: ScreenMetrics[] = [];
        for (const tab of TABS) {
          await showTab(page, tab);
          const mounted = await screenMetrics(page, tab);
          expect(mounted, `${scheme} ${width}px, ${tab}: mounted copies`).toHaveLength(1);
          screens.push(mounted[0]!);
        }

        const widths = screens.map((s) => s.containerWidth);
        expect(
          widths.some((w) => w < CONTAINER_SM),
          `${scheme} ${width}px: a copy below @sm`,
        ).toBe(true);
        expect(
          widths.some((w) => w >= CONTAINER_MD),
          `${scheme} ${width}px: a copy at or above @md`,
        ).toBe(true);

        for (const [index, screen] of screens.entries()) {
          const where = `${scheme} ${width}px, ${TABS[index]} (${screen.containerWidth}px)`;
          const sm = screen.containerWidth >= CONTAINER_SM ? "flex" : "grid";
          expect(screen.mastheadDisplay, `${where}: masthead`).toBe(sm);
          expect(screen.photoRowDisplay, `${where}: photo row`).toBe(sm);
          expect(screen.footerDisplay, `${where}: footer`).toBe(
            screen.containerWidth >= CONTAINER_MD ? "flex" : "grid",
          );
          expect(screen.rootHeight, `${where}: root height`).toBeGreaterThanOrEqual(
            screen.frameHeight,
          );
          // One h1 for the route, then headings that descend one rank at a time.
          expect(screen.headingLevels[0], `${where}: first heading`).toBe(1);
          expect(
            screen.headingLevels.filter((l) => l === 1),
            `${where}: one h1`,
          ).toHaveLength(1);
          for (const [i, level] of screen.headingLevels.entries()) {
            if (i === 0) continue;
            expect(
              level,
              `${where}: heading ${i + 1} of ${screen.headingLevels.join("/")}`,
            ).toBeLessThanOrEqual(screen.headingLevels[i - 1]! + 1);
          }
        }
      });
    }

    test("renders each state it is handed", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await hydrated(page);

      const read = async (tab: Tab) => {
        await showTab(page, tab);
        const root = page.locator(`[data-demo-state="${tab}"] ${ROOT}`);
        return {
          root,
          image: root.locator("[data-part='image']:not([hidden])"),
          upload: root.getByRole("button", { name: /upload|change photo|uploading/i }),
          remove: root.getByRole("button", { name: "Remove" }),
          save: root.locator("button[type='submit']"),
          alerts: root.getByRole("alert"),
        };
      };

      // Default: initials in the avatar, a hint-described upload button, one file input.
      const initial = await read("tablet");
      await expect(initial.root.locator("[data-part='fallback']")).toHaveText("AL");
      await expect(initial.upload).toHaveText("Upload photo");
      await expect(initial.upload).toHaveAccessibleDescription(
        "Shown next to your name. A square PNG or JPG works best.",
      );
      await expect(initial.remove).toHaveCount(0);
      await expect(initial.root.locator("input[type='file']")).toHaveCount(1);

      // With a photo: the image shows, and the reader can change or remove it.
      const photo = await read("photo");
      await expect(photo.image).toHaveCount(1);
      await expect(photo.upload).toHaveText("Change photo");
      await expect(photo.remove).toBeEnabled();

      // Uploading: the upload button is busy and inert.
      const uploading = await read("uploading");
      await expect(uploading.upload).toHaveAttribute("aria-busy", "true");
      await expect(uploading.upload).toBeDisabled();
      await expect(uploading.save).toBeEnabled();

      // A rejected photo explains itself; the form is untouched.
      const photoError = await read("photo-error");
      await expect(photoError.alerts).toHaveCount(1);
      await expect(photoError.alerts).toContainText("5 MB");

      // A failed save: the form alert and the invalid field.
      const error = await read("error");
      await expect(error.root.locator("[name='fullName']")).toHaveAttribute("aria-invalid", "true");
      await expect(error.root.locator("[name='email']")).not.toHaveAttribute(
        "aria-invalid",
        "true",
      );

      // Saving: everything inert, the save button busy.
      const loading = await read("loading");
      await expect(loading.save).toHaveAttribute("aria-busy", "true");
      await expect(loading.upload).toBeDisabled();
      await expect(loading.remove).toBeDisabled();

      // Empty: no initials, a person glyph in their place.
      const empty = await read("empty");
      await expect(empty.root.locator("[data-part='fallback'] svg")).toHaveCount(1);
    });

    for (const theme of THEMES) {
      test(`clears AA contrast on every text it paints in ${theme.name}`, async ({ page }) => {
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate((brand) => {
          const root = document.documentElement;
          if (brand) root.dataset.brand = brand;
          else delete root.dataset.brand;
        }, theme.brand);
        await hydrated(page);

        for (const tab of CONTRAST_TABS) {
          await showTab(page, tab);
          const ratios = await contrastRatios(page, tab);
          expect(Object.keys(ratios).length, `${tab}: texts found`).toBeGreaterThan(10);
          for (const [what, ratio] of Object.entries(ratios)) {
            expect(
              ratio,
              `${theme.name} ${scheme}, ${tab}: ${what} contrast`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      });
    }
  });
}
