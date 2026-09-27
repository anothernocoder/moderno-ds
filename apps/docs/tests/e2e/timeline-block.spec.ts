/**
 * The timeline block, checked on the built docs page. It asserts text,
 * attributes and computed styles; no screenshot baseline is committed.
 *
 * Seven claims:
 *
 * 1. **Controls, ruler and tracks render what they are given**: Play and Loop
 *    are named Toggles with a pressed state, the readout is "current /
 *    duration" in m:ss:ff, the ruler is a single-thumb Slider ("Playhead",
 *    "1.40 seconds") with its time marks as markers, and each track is a
 *    labelled Slider with one thumb per keyframe and no range.
 * 2. **Container, not viewport.** Below `--container-sm` the label column is
 *    narrow; from it the column widens; below `--container-md` the ruler shows
 *    every other mark. The label column keeps its width while the time area
 *    stretches, the playhead line crosses every track at the playhead, and
 *    nothing overflows sideways. Each copy is measured against its own width.
 * 3. **Playback is the app's**: Play and Space only report; the demo's clock
 *    advances the time. Space works on the timeline and the playhead, not on
 *    a keyframe or a button.
 * 4. **The playhead scrubs**: arrows move a frame, Page Up/Down a second,
 *    Home/End to the ends; a click on the ruler jumps and a drag scrubs; every
 *    reported time sits on a frame.
 * 5. **Keyframes select and move**: a click or focus selects (a bigger, filled
 *    diamond and "selected" in its name, not only colour); arrows, Page
 *    Up/Down and dragging move it, never past a neighbour or onto its frame;
 *    a press on an empty stretch of a track moves nothing.
 * 6. **Long lists scroll under a sticky ruler.**
 * 7. **Looks right** in theme-moderno and theme-contrast, light and dark: AA
 *    text and 3:1 for the diamonds and the playhead line.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The block's two steps — `--container-sm|md` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;

/** The label column, `w-20` below `@sm` and `w-32` from it, in px. */
const LABEL_NARROW = 80;
const LABEL_WIDE = 128;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/timeline/";
const BLOCK = "section.moderno-block-timeline";
const FPS = 30;

const STATES = ["default", "narrow", "compact", "panel", "tracks", "frames"] as const;
type State = (typeof STATES)[number];

function block(page: Page, state: State): Locator {
  return page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
}

async function show(page: Page, state: State): Promise<Locator> {
  const copy = block(page, state);
  await copy.scrollIntoViewIfNeeded();
  await copy.waitFor({ state: "visible" });
  // client:visible hydrates once the copy is on screen.
  await expect(copy.getByRole("button", { name: "Play" })).toHaveAttribute("data-scope", "toggle");
  await expect
    .poll(() => copy.evaluate((section) => !section.closest("astro-island")?.hasAttribute("ssr")))
    .toBe(true);
  return copy;
}

async function openPage(page: Page, width = 1280): Promise<void> {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(PAGE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

const readout = (copy: Locator) => copy.locator("p").first();
const playhead = (copy: Locator) => copy.getByRole("slider", { name: "Playhead" });
const keyframe = (copy: Locator, name: string) =>
  copy.getByRole("slider", { name: new RegExp(`^${name}`) });

/** "0:01:12 / 0:05:00" → seconds of the current time at `fps`. */
function secondsOf(text: string, fps = FPS): number {
  const [m, s, f] = text.split("/")[0]!.trim().split(":").map(Number);
  return m! * 60 + s! + f! / fps;
}

interface Layout {
  containerWidth: number;
  labels: number[];
  timeWidths: number[];
  timeLefts: number[];
  marks: string[];
  visibleMarks: string[];
  lineX: number;
  playheadX: number;
  lineTop: number;
  lineBottom: number;
  firstTrackTop: number;
  lastTrackBottom: number;
  overflow: number;
  centred: number;
}

async function layout(copy: Locator): Promise<Layout> {
  return copy.evaluate((section) => {
    const box = (el: Element) => el.getBoundingClientRect();
    const text = (el: Element) => el.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const scroller = section.querySelector<HTMLElement>(".overflow-y-auto")!;
    const rows = [...section.querySelectorAll("li")];
    const labelCells = rows.map((row) => row.firstElementChild!);
    const sliders = [...section.querySelectorAll('[data-scope="slider"][data-part="root"]')];
    const controls = sliders.map((root) => root.querySelector('[data-part="control"]')!);
    const markers = [...section.querySelectorAll('[data-part="marker"]')];
    const line = section.querySelector<HTMLElement>('[aria-hidden="true"] .w-px')!;
    const thumb = section.querySelector('[aria-label="Playhead"]')!;
    const panel = section.closest(".preview-panel--demo, .demo-viewport")!;
    const panelStyle = getComputedStyle(panel);
    const inner = box(panel);
    const left = box(section).left - inner.left - parseFloat(panelStyle.paddingLeft);
    const right = inner.right - parseFloat(panelStyle.paddingRight) - box(section).right;
    return {
      containerWidth: (section as HTMLElement).offsetWidth,
      labels: labelCells.map((cell) => box(cell).width),
      timeWidths: controls.map((control) => box(control).width),
      timeLefts: controls.map((control) => box(control).left),
      marks: markers.map(text),
      visibleMarks: markers.filter((m) => getComputedStyle(m).display !== "none").map(text),
      lineX: box(line).left + box(line).width / 2,
      playheadX: box(thumb).left + box(thumb).width / 2,
      lineTop: box(line).top,
      lineBottom: box(line).bottom,
      firstTrackTop: box(rows[0]!).top,
      lastTrackBottom: box(rows[rows.length - 1]!).bottom,
      overflow: scroller.scrollWidth - scroller.clientWidth,
      centred: Math.abs(left - right),
    };
  });
}

test.describe("timeline — what it renders", () => {
  test("controls, readout, ruler and tracks", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");

    for (const name of ["Play", "Loop"]) {
      const button = copy.getByRole("button", { name });
      await expect(button).toHaveAttribute("aria-pressed", "false");
      await expect(button).toHaveAttribute("data-scope", "toggle");
    }
    await expect(readout(copy)).toHaveText(/^0:01:12 \/\s*0:05:00$/);

    const head = playhead(copy);
    await expect(head).toHaveAttribute("aria-valuetext", "1.40 seconds");
    await expect(head).toHaveAttribute("aria-valuemin", "0");
    await expect(head).toHaveAttribute("aria-valuemax", "5");
    const metrics = await layout(copy);
    expect(metrics.marks).toEqual(["0s", "1s", "2s", "3s", "4s", "5s"]);

    await expect(copy.locator("li > span:first-child")).toHaveText([
      "Opacity",
      "Position",
      "Scale",
    ]);
    const names = await copy
      .locator("[data-track-id] [role=slider]")
      .evaluateAll((thumbs) => thumbs.map((t) => t.getAttribute("aria-label")));
    expect(names).toEqual([
      "Opacity keyframe at 0.00 s",
      "Opacity keyframe at 1.00 s",
      "Opacity keyframe at 4.00 s",
      "Position keyframe at 0.50 s",
      "Position keyframe at 2.50 s",
      "Scale keyframe at 1.50 s",
      "Scale keyframe at 3.00 s",
      "Scale keyframe at 4.50 s",
    ]);
    await expect(copy.locator("[data-track-id]")).toHaveCount(3);
    await expect(copy.locator('[data-track-id] [data-part="range"]')).toHaveCount(0);
    await expect(copy.locator('[data-track-id] [role="slider"]').first()).toHaveAttribute(
      "aria-valuetext",
      "0.00 seconds",
    );

    // A longer animation at 24 fps: marks every ten seconds, frames up to 23.
    const long = await show(page, "frames");
    await expect(readout(long)).toHaveText(/^0:00:00 \/\s*1:30:00$/);
    expect((await layout(long)).marks).toEqual([
      "0s",
      "10s",
      "20s",
      "30s",
      "40s",
      "50s",
      "1:00",
      "1:10",
      "1:20",
      "1:30",
    ]);
  });
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`timeline — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await openPage(page, width);
        for (const state of STATES) {
          const copy = await show(page, state);
          const m = await layout(copy);
          const where = `${scheme} ${width}px, ${state} (${m.containerWidth}px)`;

          const label = m.containerWidth >= CONTAINER_SM ? LABEL_WIDE : LABEL_NARROW;
          for (const cell of m.labels) expect(cell, `${where}: label column`).toBeCloseTo(label, 0);
          // Ruler and tracks share one time area: same left edge, same width.
          for (const [i, w] of m.timeWidths.entries()) {
            expect(w, `${where}: time area ${i}`).toBeCloseTo(m.timeWidths[0]!, 0);
            expect(m.timeLefts[i], `${where}: time area ${i} left`).toBeCloseTo(m.timeLefts[0]!, 0);
          }
          expect(m.timeWidths[0], `${where}: the time area takes the rest`).toBeGreaterThan(
            m.containerWidth - label - 64,
          );

          const expectedMarks =
            m.containerWidth >= CONTAINER_MD ? m.marks : m.marks.filter((_, i) => i % 2 === 0);
          expect(m.visibleMarks, `${where}: visible marks`).toEqual(expectedMarks);

          expect(Math.abs(m.lineX - m.playheadX), `${where}: line under the playhead`).toBeLessThan(
            1.5,
          );
          expect(m.lineTop, `${where}: line reaches the first track`).toBeLessThanOrEqual(
            m.firstTrackTop,
          );
          expect(m.lineBottom, `${where}: line crosses the last track`).toBeGreaterThanOrEqual(
            m.lastTrackBottom - 0.5,
          );
          expect(m.overflow, `${where}: no sideways scroll`).toBeLessThanOrEqual(0);
          expect(m.centred, `${where}: centred`).toBeLessThan(1);

          const panel = await copy.evaluate((section) => {
            const el = section.closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          });
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }
      });
    }
  });
}

test.describe("timeline — playback", () => {
  test("Play and Pause report, and the app's clock moves the time", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    const play = copy.getByRole("button", { name: "Play" });

    await play.hover();
    await expect(page.getByRole("tooltip")).toHaveText("Play (Space)");

    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => secondsOf(await readout(copy).innerText())).toBeGreaterThan(1.6);
    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "false");
    const paused = await readout(copy).innerText();
    await page.waitForTimeout(300);
    await expect(readout(copy)).toHaveText(paused);

    const loop = copy.getByRole("button", { name: "Loop" });
    await loop.click();
    await expect(loop).toHaveAttribute("aria-pressed", "true");
    await loop.click();
    await expect(loop).toHaveAttribute("aria-pressed", "false");
  });

  test("Space plays and pauses on the timeline and the playhead, not on a keyframe", async ({
    page,
  }) => {
    await openPage(page);
    const copy = await show(page, "default");
    const play = copy.getByRole("button", { name: "Play" });

    await copy.focus();
    await page.keyboard.press("Space");
    await expect(play).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Space");
    await expect(play).toHaveAttribute("aria-pressed", "false");

    await playhead(copy).focus();
    await page.keyboard.press("Space");
    await expect(play).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Space");
    await expect(play).toHaveAttribute("aria-pressed", "false");

    await keyframe(copy, "Position keyframe at 2.50").focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);
    await expect(play).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("timeline — the playhead", () => {
  test("moves by frame, by second and to the ends, from the keyboard", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    const head = playhead(copy);
    await head.focus();

    await page.keyboard.press("ArrowRight");
    await expect(head).toHaveAttribute("aria-valuetext", "1.43 seconds");
    await expect(readout(copy)).toHaveText(/^0:01:13/);
    await page.keyboard.press("PageUp");
    await expect(readout(copy)).toHaveText(/^0:02:13/);
    await page.keyboard.press("PageDown");
    await page.keyboard.press("ArrowLeft");
    await expect(readout(copy)).toHaveText(/^0:01:12/);
    await page.keyboard.press("End");
    await expect(head).toHaveAttribute("aria-valuetext", "5.00 seconds");
    await expect(readout(copy)).toHaveText(/^0:05:00/);
    await page.keyboard.press("Home");
    await expect(readout(copy)).toHaveText(/^0:00:00/);
  });

  test("jumps where the ruler is clicked and scrubs when dragged, on a frame", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    const control = copy.locator('[data-part="control"]').first();
    const box = (await control.boundingBox())!;
    const y = box.y + box.height / 2;

    await page.mouse.click(box.x + box.width * 0.6, y);
    await expect.poll(async () => secondsOf(await readout(copy).innerText())).toBeCloseTo(3, 1);

    const thumb = (await playhead(copy).boundingBox())!;
    await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => secondsOf(await readout(copy).innerText())).toBeCloseTo(1, 1);

    const value = Number(await playhead(copy).getAttribute("aria-valuenow"));
    expect(Math.abs(value * FPS - Math.round(value * FPS))).toBeLessThan(1e-6);
  });
});

test.describe("timeline — keyframes", () => {
  test("a click or focus selects, marked by shape and size, not only colour", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");

    await keyframe(copy, "Position keyframe at 0.50").click();
    const selected = keyframe(copy, "Position keyframe at 0.50 s, selected");
    await expect(selected).toHaveAttribute("data-selected", "");
    await expect(copy.locator("[data-selected]")).toHaveCount(1);

    const sizes = await copy.locator("[data-track-id] [role=slider] > span").evaluateAll((spans) =>
      spans.map((span) => ({
        width: span.getBoundingClientRect().width,
        filled: getComputedStyle(span).backgroundColor === getComputedStyle(span).borderColor,
        outline: getComputedStyle(span).outlineStyle,
        selected: span.parentElement!.hasAttribute("data-selected"),
      })),
    );
    const on = sizes.filter((s) => s.selected);
    const off = sizes.filter((s) => !s.selected);
    expect(on).toHaveLength(1);
    for (const other of off) {
      expect(on[0]!.width, "the selected diamond is bigger").toBeGreaterThan(other.width + 4);
      expect(other.filled, "the others are hollow").toBe(false);
      expect(other.outline).toBe("none");
    }
    expect(on[0]!.filled, "the selected diamond is filled").toBe(true);
    expect(on[0]!.outline, "and outlined").toBe("solid");

    await page.keyboard.press("Tab");
    await expect(keyframe(copy, "Position keyframe at 2.50 s, selected")).toBeFocused();
    await expect(copy.locator("[data-selected]")).toHaveCount(1);
  });

  test("moves by frame and by second, never past a neighbour or onto its frame", async ({
    page,
  }) => {
    await openPage(page);
    const copy = await show(page, "default");

    await keyframe(copy, "Opacity keyframe at 1.00").focus();
    await page.keyboard.press("ArrowRight");
    await expect(keyframe(copy, "Opacity keyframe at 1.03 s")).toBeFocused();
    await page.keyboard.press("PageUp");
    await expect(keyframe(copy, "Opacity keyframe at 2.03 s")).toBeFocused();
    await page.keyboard.press("PageUp");
    await page.keyboard.press("PageUp");
    // The next keyframe sits at 4.00 s: this one stops a frame before it.
    await expect(keyframe(copy, "Opacity keyframe at 3.97 s")).toBeFocused();
    await page.keyboard.press("PageDown");
    await page.keyboard.press("PageDown");
    await page.keyboard.press("PageDown");
    await page.keyboard.press("PageDown");
    // …and a frame after the previous one, at 0.00 s.
    await expect(keyframe(copy, "Opacity keyframe at 0.03 s")).toBeFocused();
    await page.keyboard.press("End");
    await expect(keyframe(copy, "Opacity keyframe at 3.97 s")).toBeFocused();

    const values = await copy
      .locator('[data-track-id="opacity"] [role=slider]')
      .evaluateAll((thumbs) => thumbs.map((t) => Number(t.getAttribute("aria-valuenow"))));
    expect(values).toEqual([...values].sort((a, b) => a - b));
    for (const value of values) {
      expect(Math.abs(value * FPS - Math.round(value * FPS))).toBeLessThan(1e-6);
    }
  });

  test("drags along its track and stops at its neighbour", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    const thumb = keyframe(copy, "Scale keyframe at 3.00");
    const track = copy.locator('[data-track-id="scale"] [data-part="control"]');
    const trackBox = (await track.boundingBox())!;
    const box = (await thumb.boundingBox())!;
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(trackBox.x + trackBox.width * 0.5, y, { steps: 6 });
    await expect(keyframe(copy, "Scale keyframe at 2.50 s")).toBeVisible();
    await page.mouse.move(trackBox.x + trackBox.width, y, { steps: 6 });
    await page.mouse.up();
    await expect(keyframe(copy, "Scale keyframe at 4.47 s, selected")).toBeVisible();
    await expect(keyframe(copy, "Scale keyframe at 4.50 s")).toBeVisible();
  });

  test("a press on an empty stretch of a track moves nothing", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "default");
    const names = () =>
      copy
        .locator("[data-track-id] [role=slider]")
        .evaluateAll((thumbs) => thumbs.map((t) => t.getAttribute("aria-label")));
    const before = await names();
    const track = (await copy
      .locator('[data-track-id="position"] [data-part="control"]')
      .boundingBox())!;
    await page.mouse.click(track.x + track.width * 0.8, track.y + track.height / 2);
    await page.waitForTimeout(200);
    expect(await names()).toEqual(before);
  });
});

test.describe("timeline — long track lists", () => {
  test("scroll under a ruler that stays on top", async ({ page }) => {
    await openPage(page);
    const copy = await show(page, "tracks");
    await expect(copy.locator("li")).toHaveCount(8);
    const scrolled = await copy.evaluate(async (section) => {
      const scroller = section.querySelector<HTMLElement>(".overflow-y-auto")!;
      const ruler = scroller.querySelector<HTMLElement>(".sticky")!;
      const overflows = scroller.scrollHeight > scroller.clientHeight;
      scroller.scrollTop = scroller.scrollHeight;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const last = scroller.querySelector("li:last-child")!.getBoundingClientRect();
      return {
        overflows,
        rulerTop:
          ruler.getBoundingClientRect().top -
          (scroller.getBoundingClientRect().top + scroller.clientTop),
        lastVisible: last.bottom <= scroller.getBoundingClientRect().bottom + 1,
      };
    });
    expect(scrolled.overflows, "the list scrolls").toBe(true);
    expect(scrolled.rulerTop, "the ruler stays on top").toBeCloseTo(0, 0);
    expect(scrolled.lastVisible, "the last track scrolls into view").toBe(true);
  });
});

/**
 * Contrast ratios read off the rendered page. Colours are resolved through a
 * canvas: the contract's values are OKLCH, and the browser is the only thing
 * that converts them exactly the way it painted them.
 */
async function ratios(copy: Locator): Promise<Record<string, number>> {
  return copy.evaluate((section) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const rgba = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r!, g!, b!, a! / 255] as const;
    };
    const luminance = (color: string) => {
      const channel = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const [r, g, b] = rgba(color);
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const ratio = (fg: string, bg: string) => {
      const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
      return (hi! + 0.05) / (lo! + 0.05);
    };
    const surface = getComputedStyle(section).backgroundColor;
    const result: Record<string, number> = {};
    const color = (el: Element) => getComputedStyle(el).color;
    result.readout = ratio(color(section.querySelector("p")!), surface);
    result.time = ratio(color(section.querySelector("p > span")!), surface);
    section.querySelectorAll("li > span:first-child").forEach((label) => {
      result[`label ${label.textContent}`] = ratio(color(label), surface);
    });
    section.querySelectorAll('[data-part="marker"]').forEach((mark) => {
      result[`mark ${mark.textContent?.trim()}`] = ratio(color(mark), surface);
    });
    const diamond = section.querySelector("[data-track-id] [role=slider] > span")!;
    result.diamond = ratio(getComputedStyle(diamond).borderTopColor, surface);
    const line = section.querySelector('[aria-hidden="true"] .w-px')!;
    result.line = ratio(getComputedStyle(line).backgroundColor, surface);
    result.icon = ratio(color(section.querySelector("button")!), surface);
    return result;
  });
}

for (const theme of ["moderno", "contrast"] as const) {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`timeline — theme-${theme}, ${scheme}`, () => {
      test.use({ colorScheme: scheme });

      test("AA text, and 3:1 for the diamonds and the playhead line", async ({ page }) => {
        await page.addInitScript((id) => localStorage.setItem("moderno-site-theme", id), theme);
        await openPage(page);
        expect(await page.evaluate(() => document.documentElement.dataset.brand)).toBe(theme);
        const copy = await show(page, "default");
        const found = await ratios(copy);
        for (const [name, value] of Object.entries(found)) {
          const floor = ["diamond", "line", "icon"].includes(name) ? 3 : 4.5;
          expect(value, `${theme} ${scheme}: ${name}`).toBeGreaterThanOrEqual(floor);
        }
      });
    });
  }
}
