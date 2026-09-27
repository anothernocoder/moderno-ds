/**
 * The Chip label's box, checked on the built docs page.
 *
 * The label truncates a long value with an ellipsis, so it clips its overflow.
 * That clip must only ever cut the *end* of a label, never the bottom of its
 * glyphs: the label's line box has to fit the font's ascent and descent, or the
 * tails of "g", "p" and "y" disappear. Whether it does is a layout fact, so the
 * browser is asked directly: a label that clips vertically reports a
 * `scrollHeight` taller than its `clientHeight`.
 *
 * Every chip on the page is measured with the same descender-heavy text, so
 * both sizes and all three variants are covered whatever the demos happen to
 * say. Text is swapped and measured in one synchronous step, so a hydrating
 * island cannot re-render in between.
 */
import { expect, test } from "@playwright/test";

const PAGE = "/en/chip/";

/** Has a glyph that dips below the baseline in every position. */
const DESCENDERS = "Typography gjpqy";

/** The chip heights the fix must not move: `--spacing-7` (md) and `--spacing-6` (sm). */
const HEIGHT = { md: 28, sm: 24 };

interface LabelMetrics {
  size: string;
  rootHeight: number;
  scrollHeight: number;
  clientHeight: number;
}

test.describe("chip label", () => {
  test("fits its glyphs' descenders without changing the chip's height", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    const labels = await page.evaluate((text) => {
      const roots = document.querySelectorAll<HTMLElement>('main [data-scope="chip"][data-part="root"]');
      return [...roots].map((root): LabelMetrics => {
        const label = root.querySelector<HTMLElement>('[data-part="label"]')!;
        label.textContent = text;
        return {
          size: root.dataset.size ?? "md",
          rootHeight: root.getBoundingClientRect().height,
          scrollHeight: label.scrollHeight,
          clientHeight: label.clientHeight,
        };
      });
    }, DESCENDERS);

    expect(labels.map((l) => l.size)).toEqual(expect.arrayContaining(["sm", "md"]));
    for (const label of labels) {
      expect(label.scrollHeight, `${label.size} label clips vertically`).toBeLessThanOrEqual(
        label.clientHeight,
      );
      expect(label.rootHeight).toBe(HEIGHT[label.size as keyof typeof HEIGHT]);
    }
  });

  test("still truncates a long label with an ellipsis", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "networkidle" });

    const label = await page.evaluate((text) => {
      const root = document.querySelector<HTMLElement>('main [data-scope="chip"][data-part="root"]')!;
      const label = root.querySelector<HTMLElement>('[data-part="label"]')!;
      root.style.width = "6rem";
      label.textContent = `${text} ${text} ${text}`;
      const style = getComputedStyle(label);
      return {
        overflowsInline: label.scrollWidth > label.clientWidth,
        textOverflow: style.textOverflow,
        scrollHeight: label.scrollHeight,
        clientHeight: label.clientHeight,
      };
    }, DESCENDERS);

    expect(label.overflowsInline).toBe(true);
    expect(label.textOverflow).toBe("ellipsis");
    expect(label.scrollHeight).toBeLessThanOrEqual(label.clientHeight);
  });
});
