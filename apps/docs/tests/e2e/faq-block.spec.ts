/**
 * The FAQ block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Four claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the support sentence
 *    sits above its button; from `--container-sm` they share one row; at
 *    `--container-md` the heading steps up a size; at `--container-lg` the
 *    section gets more room above and below. Each copy on the page is measured
 *    against its own container width, so the narrow frame keeps its support
 *    line stacked at 1280 while the wide frame has crossed every step.
 * 2. **Every state renders what it claims**, at every width: heading,
 *    introduction, five closed questions, each an `h3` around its trigger with
 *    a hidden chevron, and the support line, by default; the empty message in
 *    place of the questions; placeholders in a busy region while loading; an
 *    error Alert with a retry in place of the questions; and inert questions
 *    when disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, and 3:1 on
 *    each chevron against its surface.
 * 4. **Hover and focus-visible** on a question, one answer open at a time, and
 *    no way to open a disabled one.
 *
 * It also checks that an empty `error` string counts as no error: the
 * questions come back, with no alert.
 */
import { expect, test, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/faq/";

const BLOCK = "section.moderno-block-faq";

/** The copy the block ships with. */
const HEADING = "Frequently asked questions";
const QUESTIONS = [
  "Is there a free trial?",
  "Can I cancel at any time?",
  "Which currencies can I invoice in?",
  "Can I invite my accountant?",
  "Where is my data stored?",
];
const ANSWERS = [
  "Yes. Every plan starts with 14 days free, and you add a card only when you decide to stay.",
  "Yes. Cancel from your account settings and you keep access until the end of the billing period.",
  "More than 30. Your clients pay in their currency, and the money arrives in the currency of your account.",
  "Yes. Invite them as a member who can read your invoices, receipts and reports.",
  "In data centres in the European Union, encrypted at rest and in transit.",
];
const CONTACT_TEXT = "Still have questions? We answer within one working day.";
const CONTACT_LABEL = "Contact support";
const EMPTY = "No questions here yet.";
const ERROR = "We could not load the questions.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** The heading's text. */
  heading: string | null;
  /** The heading's font size, in px. */
  headingSize: number | null;
  /** Whether the heading is set in the contract's `--font-serif`. */
  serifHeading: boolean | null;
  /** Each trigger's text, in order. */
  questions: string[];
  /** Each answer's text, in order. */
  answers: string[];
  /** Triggers that sit directly inside an `h3`. */
  headed: number;
  /** Triggers that carry an aria-hidden chevron in their indicator. */
  chevrons: number;
  /** Triggers that are open (`aria-expanded="true"`). */
  open: number;
  /** Answers that are not hidden. */
  shownAnswers: number;
  /** Whether every trigger is disabled. */
  allQuestionsDisabled: boolean;
  /** Whether every trigger is enabled. */
  allQuestionsLive: boolean;
  /** The empty message, or null. */
  empty: string | null;
  /** The support sentence, or null when the line is hidden. */
  contactText: string | null;
  /** The support line's display: `grid` when stacked, `flex` on one row. */
  contactDisplay: string | null;
  /** The block's padding above its content, in px. */
  paddingTop: number;
  /** The button labels, in order (the retry inside an error, then support). */
  buttons: string[];
  /** The `data-variant` of every button, in order. */
  buttonVariants: string[];
  /** Whether every button in this copy is disabled. */
  allButtonsDisabled: boolean;
  /** Skeleton placeholders inside a busy status region. */
  placeholders: number;
  /** Whether an error Alert is announced. */
  alert: boolean;
  /** Horizontal offset between the heading block's centre and the block's, in px. */
  offCentre: number;
}

/**
 * The page's previews (islands/FaqBlockDemo.svelte): the main preview mounts
 * the default; the Examples frame the same block at 18rem, 30rem, 40rem and
 * 50rem, then mount the empty, loading, error and disabled states. Every copy
 * is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

async function showState(page: Page, state: State): Promise<void> {
  const block = page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

async function blockMetrics(page: Page, state: State): Promise<BlockMetrics[]> {
  return page.evaluate(
    ({ state, selector }) => {
      const wrapper = document.querySelector(`[data-demo-state="${state}"]`);
      if (!wrapper) throw new Error(`no preview for the ${state} state on the page`);
      const normalise = (family: string) => family.replace(/["'\s]/g, "");
      const serif = normalise(
        getComputedStyle(document.documentElement).getPropertyValue("--font-serif"),
      );
      const text = (el: Element | null | undefined) => el?.textContent?.trim() ?? "";

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        const first = body?.firstElementChild as HTMLElement | null;
        if (!body || !first) throw new Error("the FAQ block did not render its own markup");

        const heading = section.querySelector("h2");
        const triggers = [
          ...section.querySelectorAll<HTMLButtonElement>(
            '[data-scope="accordion"][data-part="item-trigger"]',
          ),
        ];
        const contents = [
          ...section.querySelectorAll<HTMLElement>(
            '[data-scope="accordion"][data-part="item-content"]',
          ),
        ];
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-scope="button"]')];
        const empty = [...body.children].find(
          (el) => el.tagName === "P" && el.classList.contains("border-dashed"),
        );
        // The support line is the block's last row: a sentence beside its button.
        const last = body.lastElementChild;
        const contactLine = last?.querySelector(':scope > [data-scope="button"]') ? last : null;
        const blockBox = section.getBoundingClientRect();
        const firstBox = first.getBoundingClientRect();

        return {
          containerWidth: section.offsetWidth,
          heading: heading ? text(heading) : null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifHeading: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          questions: triggers.map((t) => text(t)),
          answers: contents.map((c) => text(c)),
          headed: triggers.filter((t) => t.parentElement?.tagName === "H3").length,
          chevrons: triggers.filter((t) =>
            t.querySelector('[data-part="item-indicator"] svg[aria-hidden="true"] path'),
          ).length,
          open: triggers.filter((t) => t.getAttribute("aria-expanded") === "true").length,
          shownAnswers: contents.filter((c) => !c.hidden).length,
          allQuestionsDisabled: triggers.length > 0 && triggers.every((t) => t.disabled),
          allQuestionsLive: triggers.length > 0 && triggers.every((t) => !t.disabled),
          empty: empty ? text(empty) : null,
          contactText: contactLine ? text(contactLine.querySelector("p")) : null,
          contactDisplay: contactLine ? getComputedStyle(contactLine).display : null,
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          buttons: buttons.map((b) => text(b)),
          buttonVariants: buttons.map((b) => b.getAttribute("data-variant") ?? ""),
          allButtonsDisabled: buttons.length > 0 && buttons.every((b) => b.disabled),
          placeholders: busy ? busy.querySelectorAll('[data-scope="skeleton"]').length : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          offCentre: Math.abs(
            firstBox.left + firstBox.width / 2 - (blockBox.left + blockBox.width / 2),
          ),
        };
      });
    },
    { state, selector: BLOCK },
  );
}

/**
 * Contrast ratios read off the rendered page. Colours are resolved through a
 * canvas: the contract's values are OKLCH, and the browser is the only thing
 * that converts them exactly the way it painted them.
 */
async function contrastRatios(
  page: Page,
  state: "default" | "empty" | "error",
): Promise<Record<string, number>> {
  await showState(page, state);
  return page.evaluate(
    ({ state, selector }) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no 2d context");

      function toRgba(color: string): [number, number, number, number] {
        ctx!.clearRect(0, 0, 1, 1);
        ctx!.fillStyle = color;
        ctx!.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx!.getImageData(0, 0, 1, 1).data;
        return [r!, g!, b!, a! / 255];
      }

      function luminance(color: string): number {
        const channel = (v: number) => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        };
        const [r, g, b] = toRgba(color);
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      }

      function ratio(fg: string, bg: string): number {
        const a = luminance(fg);
        const b = luminance(bg);
        const [hi, lo] = a > b ? [a, b] : [b, a];
        return (hi + 0.05) / (lo + 0.05);
      }

      /** The nearest ancestor that actually paints a background. */
      function surfaceOf(el: Element): string {
        let node: Element | null = el;
        while (node) {
          const bg = getComputedStyle(node).backgroundColor;
          if (toRgba(bg)[3] > 0) return bg;
          node = node.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      }

      const block = document.querySelector(`[data-demo-state="${state}"] ${selector}`);
      if (!block) throw new Error(`the ${state} preview did not render`);

      const against = (el: Element) => ratio(getComputedStyle(el).color, surfaceOf(el));
      const body = block.firstElementChild!;
      const contact = body.lastElementChild!;
      const parts: Array<[string, Element | null]> = [
        ["heading", block.querySelector("h2")],
        ["description", block.querySelector("h2 + p")],
        ["empty message", block.querySelector("p.border-dashed")],
        ["support sentence", contact.querySelector(":scope > p")],
        ["alert title", block.querySelector('[data-scope="alert"] [data-part="title"]')],
        [
          "alert description",
          block.querySelector('[data-scope="alert"] [data-part="description"]'),
        ],
      ];

      const ratios: Record<string, number> = {};
      for (const [name, el] of parts) {
        if (el) ratios[`${state} ${name}`] = against(el);
      }
      for (const item of block.querySelectorAll('[data-scope="accordion"][data-part="item"]')) {
        const trigger = item.querySelector('[data-part="item-trigger"]')!;
        const name = trigger.textContent?.trim() ?? "question";
        ratios[`${state} ${name} question`] = against(trigger);
        ratios[`${state} ${name} answer`] = against(
          item.querySelector('[data-part="item-content"]')!,
        );
        // Non-text contrast (WCAG 1.4.11): the chevron's stroke against its surface.
        ratios[`${state} ${name} chevron`] = against(
          trigger.querySelector('[data-part="item-indicator"]')!,
        );
      }
      for (const button of block.querySelectorAll('[data-scope="button"]')) {
        ratios[`${state} ${button.textContent?.trim() ?? "button"} button`] = against(button);
      }
      return ratios;
    },
    { state, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`faq — ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const width of WIDTHS) {
      test(`lays itself out from its container at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1200 });
        await page.goto(PAGE, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready.then(() => true));

        expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
          scheme === "dark",
        );

        const blocks: Array<BlockMetrics & { state: State }> = [];
        for (const state of STATES) {
          await showState(page, state);
          const mounted = await blockMetrics(page, state);
          expect(mounted, `${state}: mounted copies`).toHaveLength(1);
          const block = mounted[0]!;
          blocks.push({ ...block, state });
          const where = `${scheme} ${width}px, ${state} (${block.containerWidth}px)`;

          expect(block.contactText, `${where}: support sentence`).toBe(CONTACT_TEXT);
          expect(block.contactDisplay, `${where}: support line on one row`).toBe(
            block.containerWidth >= CONTAINER_SM ? "flex" : "grid",
          );
          expect(block.paddingTop, `${where}: room above`).toBe(
            block.containerWidth >= CONTAINER_LG ? 64 : 48,
          );
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);

          if (state === "loading") {
            expect(block.placeholders, `${where}: placeholders`).toBe(5);
            expect(block.questions, `${where}: no questions while loading`).toEqual([]);
            expect(block.buttons, `${where}: support only`).toEqual([CONTACT_LABEL]);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.questions, `${where}: no questions`).toEqual([]);
            expect(block.buttons, `${where}: support only`).toEqual([CONTACT_LABEL]);
          } else if (state === "error") {
            expect(block.questions, `${where}: no questions`).toEqual([]);
            expect(block.buttons, `${where}: retry, then support`).toEqual([
              "Try again",
              CONTACT_LABEL,
            ]);
            expect(block.buttonVariants, `${where}: button variants`).toEqual([
              "outline",
              "outline",
            ]);
          } else {
            expect(block.questions, `${where}: questions`).toEqual(QUESTIONS);
            expect(block.answers, `${where}: answers`).toEqual(ANSWERS);
            expect(block.headed, `${where}: every question is an h3`).toBe(QUESTIONS.length);
            expect(block.chevrons, `${where}: one hidden chevron per question`).toBe(
              QUESTIONS.length,
            );
            expect(block.open, `${where}: every question starts closed`).toBe(0);
            expect(block.shownAnswers, `${where}: every answer starts hidden`).toBe(0);
            expect(block.empty, `${where}: no empty message`).toBeNull();
            expect(block.buttons, `${where}: support only`).toEqual([CONTACT_LABEL]);
            expect(block.buttonVariants, `${where}: support variant`).toEqual(["outline"]);
          }

          // The 50rem frame scrolls inside itself; the panel holding the demo
          // never pushes the page sideways.
          const panel = await page.evaluate((state) => {
            const el = document
              .querySelector(`[data-demo-state="${state}"]`)!
              .closest(".preview-panel--demo") as HTMLElement;
            return { scroll: el.scrollWidth, client: el.clientWidth };
          }, state);
          expect(panel.scroll, `${where}: demo panel overflow`).toBeLessThanOrEqual(panel.client);
        }

        expect(
          blocks.filter((block) => block.allQuestionsDisabled).map((block) => block.state),
          "the disabled render",
        ).toEqual(["disabled"]);
        expect(
          blocks.filter((block) => block.allButtonsDisabled).map((block) => block.state),
          "disabled buttons",
        ).toEqual(["disabled"]);
        expect(
          blocks.filter((block) => block.allQuestionsLive).map((block) => block.state),
          "every other render with questions",
        ).toEqual(["default", "narrow", "compact", "panel", "wide"]);

        // The heading steps up at `--container-md`: one size below it, one
        // larger size from it on.
        const below = new Set(
          blocks.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.headingSize),
        );
        const above = new Set(
          blocks.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.headingSize),
        );
        expect(below.size, "one heading size below @md").toBe(1);
        expect(above.size, "one heading size from @md").toBe(1);
        expect([...above][0]!, "heading steps up at @md").toBeGreaterThan([...below][0]!);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = blocks.map((b) => b.containerWidth);
        for (const step of [CONTAINER_SM, CONTAINER_MD, CONTAINER_LG]) {
          expect(
            containerWidths.some((w) => w < step),
            `a copy under ${step}px`,
          ).toBe(true);
          expect(
            containerWidths.some((w) => w >= step),
            `a copy over ${step}px`,
          ).toBe(true);
        }
      });
    }

    test("sits in the middle of its preview", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      for (const state of ["default", "empty", "loading", "error", "disabled"] as const) {
        await showState(page, state);
        const gaps = await page.evaluate(
          ({ state, selector }) => {
            const wrapper = document.querySelector(`[data-demo-state="${state}"]`)!;
            const panel = wrapper.closest(".preview-panel--demo")!.getBoundingClientRect();
            const block = wrapper.querySelector(selector)!;
            const content = [...block.firstElementChild!.children]
              .filter((el) => !el.classList.contains("sr-only"))
              .map((el) => el.getBoundingClientRect());
            const top = Math.min(...content.map((r) => r.top));
            const bottom = Math.max(...content.map((r) => r.bottom));
            const left = Math.min(...content.map((r) => r.left));
            const right = Math.max(...content.map((r) => r.right));
            return {
              above: top - panel.top,
              below: panel.bottom - bottom,
              before: left - panel.left,
              after: panel.right - right,
            };
          },
          { state, selector: BLOCK },
        );
        expect(Math.abs(gaps.above - gaps.below), `${scheme} ${state}: vertical`).toBeLessThan(2);
        expect(Math.abs(gaps.before - gaps.after), `${scheme} ${state}: horizontal`).toBeLessThan(
          2,
        );
      }
    });

    test("clears AA contrast on every text it paints", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      const ratios = {
        ...(await contrastRatios(page, "default")),
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      for (const label of [
        "default heading",
        "default description",
        ...QUESTIONS.flatMap((question) => [
          `default ${question} question`,
          `default ${question} answer`,
          `default ${question} chevron`,
        ]),
        "default support sentence",
        `default ${CONTACT_LABEL} button`,
        "empty empty message",
        "error alert title",
        "error alert description",
        "error Try again button",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        const floor = what.endsWith(" chevron") ? 3 : 4.5;
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(floor);
      }
    });

    test("shows hover and focus-visible on a question", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const trigger = block.getByRole("button", { name: QUESTIONS[0] });
      await expect(trigger).toHaveCount(1);

      // The chevron turns from the muted colour to the foreground on hover.
      const chevron = () =>
        trigger.evaluate(
          (el) => getComputedStyle(el.querySelector('[data-part="item-indicator"]')!).color,
        );
      await page.mouse.move(0, 0);
      const resting = await chevron();
      await trigger.hover();
      await expect.poll(chevron, { message: `${scheme}: hover` }).not.toBe(resting);
      expect(await chevron(), `${scheme}: hover reads the trigger's colour`).toBe(
        await trigger.evaluate((el) => getComputedStyle(el).color),
      );

      await page.mouse.move(0, 0);
      await trigger.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await trigger.evaluate((el) => ({
        focused: el.matches(":focus-visible"),
        style: getComputedStyle(el).outlineStyle,
      }));
      expect(outline.focused, `${scheme}: keyboard focus`).toBe(true);
      expect(outline.style, `${scheme}: focus ring`).not.toBe("none");
    });

    test("opens one answer at a time and closes the open one again", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = page.locator(`[data-demo-state="default"] ${BLOCK}`);
      const first = block.getByRole("button", { name: QUESTIONS[0] });
      const second = block.getByRole("button", { name: QUESTIONS[1] });

      await first.click();
      await expect(first).toHaveAttribute("aria-expanded", "true");
      await expect(block.getByRole("region", { name: QUESTIONS[0] })).toHaveText(ANSWERS[0]!);

      await second.click();
      await expect(second).toHaveAttribute("aria-expanded", "true");
      await expect(first).toHaveAttribute("aria-expanded", "false");
      await expect(block.getByRole("region", { name: QUESTIONS[1] })).toHaveText(ANSWERS[1]!);

      await second.click();
      await expect(second).toHaveAttribute("aria-expanded", "false");
      await expect(block.getByRole("region")).toHaveCount(0);
    });

    test("keeps a disabled question closed", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      const block = page.locator(`[data-demo-state="disabled"] ${BLOCK}`);
      const trigger = block.getByRole("button", { name: QUESTIONS[0] });
      await expect(trigger).toBeDisabled();
      await expect(block.getByRole("button", { name: CONTACT_LABEL })).toBeDisabled();

      await trigger.click({ force: true });
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(block.getByRole("region")).toHaveCount(0);
    });

    test("announces the loading questions once and the failed load as an alert", async ({
      page,
    }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading questions");
      const hidden = await region.evaluate((el) =>
        [...el.querySelectorAll('[data-scope="skeleton"]')].every(
          (placeholder) => placeholder.closest('[aria-hidden="true"]') !== null,
        ),
      );
      expect(hidden).toBe(true);

      await showState(page, "error");
      const alert = page.locator(`[data-demo-state="error"] ${BLOCK} [role="alert"]`);
      await expect(alert).toContainText(ERROR);
      await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = page.locator(`[data-demo-state="error"] ${BLOCK}`);

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.locator('h3 > [data-part="item-trigger"]')).toHaveText(QUESTIONS);
    });
  });
}
