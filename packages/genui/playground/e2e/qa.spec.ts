/**
 * Visual QA as a script: each QA message in each theme, at desktop and 375px
 * (playwright.config.ts). It types, opens every Select and picks an option,
 * presses the widget's action, and checks the message it posts. A widget must
 * fit the page, keep one control height, and leave the console clean.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** Fixture mode answers with the Blocks; a real model may compose primitives instead. */
const FIXTURES = !process.env.GENUI_REAL;

const THEMES = [
  { brand: "moderno", mode: "light" },
  { brand: "moderno", mode: "dark" },
  { brand: "contrast", mode: "light" },
  { brand: "contrast", mode: "dark" },
];

/** Every console error or warning, and every uncaught error, from page load on. */
function consoleProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  return problems;
}

/** Waits until the `count`th answer has arrived whole: text or a widget, not the spinner, and an idle composer. */
async function expectAnswered(page: Page, count: number): Promise<Locator> {
  const answer = page.locator(".thread > .assistant").nth(count - 1);
  await expect(answer.locator(".text, .widget").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeEnabled();
  return answer;
}

/** Sends `text` from the composer and returns its whole answer. */
async function ask(page: Page, text: string): Promise<Locator> {
  await page.getByRole("textbox", { name: "Message" }).fill(text);
  await page.getByRole("button", { name: "Send" }).click();
  return expectAnswered(page, 1);
}

const CONTROLS = [
  '[data-scope="field"][data-part="input"]',
  '[data-scope="select"][data-part="trigger"]',
  '[data-scope="number-input"][data-part="control"]',
  '[data-scope="button"][data-part="root"]',
].join(", ");

/** The page does not scroll sideways, the column is centered, nothing leaves the answer, one control height. */
async function expectWellLaidOut(page: Page, answer: Locator) {
  const layout = await page.evaluate(() => {
    const main = document.querySelector("main")!.getBoundingClientRect();
    return {
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      offCenter: Math.abs(main.left - (window.innerWidth - main.right)),
    };
  });
  expect(layout.pageOverflow).toBeLessThanOrEqual(0);
  expect(layout.offCenter).toBeLessThanOrEqual(1);

  const { overflowing, heights } = await answer.evaluate((element, controls) => {
    const box = element.getBoundingClientRect();
    return {
      overflowing: [...element.querySelectorAll("*")]
        .filter((child) => {
          const rect = child.getBoundingClientRect();
          return rect.width > 0 && (rect.left < box.left - 1 || rect.right > box.right + 1);
        })
        .map((child) => child.outerHTML.slice(0, 120)),
      heights: [...element.querySelectorAll(controls)].map((control) =>
        Math.round(control.getBoundingClientRect().height),
      ),
    };
  }, CONTROLS);
  expect(overflowing).toEqual([]);
  expect(new Set(heights).size).toBeLessThanOrEqual(1);
}

for (const { brand, mode } of THEMES) {
  test.describe(`theme-${brand}, ${mode}`, () => {
    let problems: string[];

    test.beforeEach(async ({ page }) => {
      problems = consoleProblems(page);
      await page.goto(`/?brand=${brand}&mode=${mode}`);
    });

    test.afterEach(async ({ page }, info) => {
      // `QA_SHOTS=<dir>`: a full-page screenshot of each finished chat, for the epic PR.
      const dir = process.env.QA_SHOTS;
      const name = `${info.project.name}-${brand}-${mode}-${info.title.split(":")[0]}.png`;
      if (dir) await page.screenshot({ path: `${dir}/${name}`, fullPage: true });
      expect(problems).toEqual([]);
    });

    test("sales: a StatRow and a chart card", async ({ page }) => {
      const reply = await ask(page, "ventas del mes");
      if (FIXTURES) {
        await expect(reply.locator(".moderno-block-stat-row")).toBeVisible();
        await expect(reply.locator('[data-scope="card"] svg').first()).toBeVisible();
      }
      await expectWellLaidOut(page, reply);
    });

    test("order: an OrderSummary whose confirm posts back", async ({ page }) => {
      const reply = await ask(page, "confirma mi pedido");
      if (FIXTURES) await expect(reply.locator(".moderno-block-order-summary")).toBeVisible();
      await expectWellLaidOut(page, reply);

      await reply.getByRole("button", { name: /confirm/i }).click();
      await expect(page.locator(".thread > .user").last()).toHaveText(/confirm/i);
      await expectAnswered(page, 2);
    });

    test("form: a FormLayout that sends what was typed and picked", async ({ page }) => {
      const reply = await ask(page, "quiero jugar un chance");
      if (FIXTURES) await expect(reply.locator(".moderno-block-form-layout")).toBeVisible();
      await expectWellLaidOut(page, reply);

      const typed: string[] = [];
      for (const input of await reply.locator('[data-scope="field"][data-part="input"]').all()) {
        await input.fill("4827");
        typed.push("4827");
      }
      for (const trigger of await reply
        .locator('[data-scope="select"][data-part="trigger"]')
        .all()) {
        await trigger.click();
        const option = page.getByRole("option").last();
        typed.push((await option.innerText()).trim());
        await option.click();
      }
      for (const input of await reply.locator('[data-scope="number-input"] input').all()) {
        await input.fill("7000");
        typed.push("7000");
      }
      expect(typed.length).toBeGreaterThan(0);

      // A form Block submits itself; a composed form sends with its last button.
      const submit = reply.locator('button[type="submit"]');
      await ((await submit.count()) ? submit : reply.locator("button").last()).click();
      const sent = page.locator(".thread > .user").last();
      for (const value of typed) await expect(sent).toContainText(value);
      await expectAnswered(page, 2);
    });
  });
}
