/**
 * The table block, checked on the built docs page at the three widths of the
 * responsive policy (375 / 768 / 1280) in both colour schemes. It asserts text
 * and computed styles; no screenshot baseline is committed.
 *
 * Five claims:
 *
 * 1. **Container, not viewport.** Below `--container-sm` the page row is
 *    centred under the table and the table scrolls sideways inside its own
 *    frame; from `--container-sm` the page row sits at the end; from
 *    `--container-md` the heading steps up; from `--container-lg` the Issued
 *    column and each customer's email appear, with more room above the
 *    section. Each copy on the page is measured against its own container
 *    width, so the narrow frame keeps scrolling at 1280 while the wide frame
 *    has crossed every step. The block itself never overflows: its frame
 *    takes the overflow.
 * 2. **Every state renders what it claims**, at every width: heading, the
 *    invoice count, a page of rows (number, customer, status badge, amount, a
 *    checkbox and an actions menu each) and a page row by default; no page row
 *    for one page; the amounts in dollars through `formatAmount`; the empty
 *    message; placeholder rows in a busy region while loading; an error Alert
 *    with a retry in place of the table; and every checkbox, sort button, menu
 *    and page button off when disabled. Every copy is centred in its box.
 * 3. **AA contrast** in both schemes on every text the block paints, a
 *    selected row's included.
 * 4. **Hover and focus-visible** on a row, a sort button, a checkbox, a
 *    row's menu and the scrolling frame.
 * 5. **It works**: sorting (with `aria-sort`), selecting rows and a page,
 *    the bulk and row menus, clearing the selection and paging.
 *
 * It also checks that an empty `error` string counts as no error: the table
 * comes back, with no alert.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** The block's three steps — `--container-sm|md|lg` in px at the default root size. */
const CONTAINER_SM = 384;
const CONTAINER_MD = 576;
const CONTAINER_LG = 768;

/** The responsive policy's three widths (ADR-0005). */
const WIDTHS = [375, 768, 1280];

const PAGE = "/en/table/";

const BLOCK = "section.moderno-block-table";

/** The block's own sample invoices, as the first page shows them. */
const HEADING = "Invoices";
const NUMBERS = ["INV-1042", "INV-1041", "INV-1040", "INV-1039", "INV-1038"];
const CUSTOMERS = [
  "Acme Studio",
  "Northwind Traders",
  "Lumen Labs",
  "Bluebird Coffee",
  "Oak & Iron",
];
const EMAILS = [
  "billing@acme.example",
  "ap@northwind.example",
  "finance@lumen.example",
  "hello@bluebird.example",
  "accounts@oakiron.example",
];
const ISSUED = ["12 Jan 2026", "9 Jan 2026", "5 Jan 2026", "2 Jan 2026", "28 Dec 2025"];
const STATUSES = ["Paid", "Pending", "Overdue", "Paid", "Paid"];
const VARIANTS = ["success", "warning", "error", "success", "success"];
const EUROS = ["€2,400.00", "€1,250.50", "€860.00", "€320.00", "€5,400.00"];
const DOLLARS = ["$2,400.00", "$1,250.50", "$860.00"];
/** Twelve invoices, five to a page. */
const PAGES = ["1", "2", "3"];
const EMPTY = "You have not sent any invoices yet.";
const ERROR = "We could not load your invoices.";

interface BlockMetrics {
  /** Layout width of the block's own `@container` root — what its variants read. */
  containerWidth: number;
  /** Whether the block itself overflows sideways (it never should). */
  blockOverflows: boolean;
  heading: string | null;
  headingSize: number | null;
  serifHeading: boolean | null;
  /** The toolbar's count, or null when there is no table. */
  count: string | null;
  /** The visible column headers' text, arrows dropped. */
  headers: string[];
  /** The headers that sort, by their button's text. */
  sortButtons: string[];
  numbers: string[];
  customers: string[];
  /** The email under each name, only where it shows. */
  emails: string[];
  /** The Issued cells, only where they show. */
  issued: string[];
  statuses: string[];
  statusVariants: string[];
  amounts: string[];
  /** The accessible names of the row menus' triggers. */
  menuTriggers: string[];
  /** The checkboxes' accessible names (the header's first). */
  checkboxes: string[];
  /** How many checkboxes, sort buttons, menu triggers and page buttons are off. */
  disabledCheckboxes: number;
  disabledSortButtons: number;
  disabledMenuTriggers: number;
  /** Whether the table is wider than its frame, which then scrolls. */
  scrolls: boolean;
  /** Whether the table fills its frame at least. */
  tableFillsFrame: boolean;
  /** The page row: its buttons' text, the current page and where it sits. */
  pages: string[];
  currentPage: string | null;
  pagePlacement: "centre" | "end" | "other" | "none";
  pageButtons: number;
  disabledPageButtons: number;
  empty: string | null;
  paddingTop: number;
  /** The retry inside an error, by text. */
  retry: string[];
  placeholders: number;
  alert: boolean;
  offCentre: number;
}

/**
 * The page's previews (islands/TableBlockDemo.svelte): the main preview mounts
 * the default; the Examples frame the same block at 18rem, 30rem, 40rem and
 * 50rem, then mount the one-page, dollars, empty, loading, error and disabled
 * states. Every copy is found by the `data-demo-state` its wrapper carries.
 */
const STATES = [
  "default",
  "narrow",
  "compact",
  "panel",
  "wide",
  "one-page",
  "dollars",
  "empty",
  "loading",
  "error",
  "disabled",
] as const;
type State = (typeof STATES)[number];

/** The copies that show three invoices, one page. */
const ONE_PAGE: State[] = ["one-page", "dollars"];

function blockIn(page: Page, state: State): Locator {
  return page.locator(`[data-demo-state="${state}"] ${BLOCK}`);
}

async function showState(page: Page, state: State): Promise<void> {
  const block = blockIn(page, state);
  await block.scrollIntoViewIfNeeded();
  await block.waitFor({ state: "visible" });
}

/** Waits for the island to hydrate: Ark stamps `data-state` on each checkbox. */
async function hydrated(page: Page, state: State): Promise<void> {
  await expect(
    blockIn(page, state).locator('tbody [data-scope="checkbox"][data-part="root"]').first(),
  ).toHaveAttribute("data-state", /checked|unchecked/);
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
      const text = (el: Element | null | undefined) =>
        el?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const shown = (el: Element) => getComputedStyle(el).display !== "none";

      return [...wrapper.querySelectorAll<HTMLElement>(selector)].map((section) => {
        const body = section.firstElementChild as HTMLElement | null;
        if (!body) throw new Error("the table block did not render its own markup");

        const heading = section.querySelector("h2");
        const region = section.querySelector<HTMLElement>('[role="region"]');
        const table = section.querySelector<HTMLElement>("table");
        const count = section.querySelector("p[aria-live]");
        const headerCells = [...section.querySelectorAll<HTMLElement>("thead th")].filter(shown);
        const sortButtons = [
          ...section.querySelectorAll<HTMLButtonElement>('thead [data-scope="button"]'),
        ];
        const rows = [...section.querySelectorAll<HTMLElement>("tbody tr")];
        const cells = (i: number) =>
          rows.map((row) => row.children[i] as HTMLElement).filter((cell) => cell && shown(cell));
        const inputs = [...section.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
        const triggers = [
          ...section.querySelectorAll<HTMLButtonElement>(
            'tbody [data-scope="menu"][data-part="trigger"]',
          ),
        ];
        const nav = section.querySelector<HTMLElement>('nav[data-scope="pagination"]');
        const pageButtons = nav ? [...nav.querySelectorAll<HTMLButtonElement>("button")] : [];
        const busy = section.querySelector('[role="status"][aria-busy="true"]');
        const empty = [...body.children].find(
          (el) => el.tagName === "P" && el.classList.contains("border-dashed"),
        );
        const tableBox = body.lastElementChild as HTMLElement;
        const blockBox = section.getBoundingClientRect();
        const bodyBox = body.getBoundingClientRect();

        let pagePlacement: BlockMetrics["pagePlacement"] = "none";
        if (nav) {
          const n = nav.getBoundingClientRect();
          const g = tableBox.getBoundingClientRect();
          if (Math.abs(n.right - g.right) < 1 && n.left > g.left + 1) pagePlacement = "end";
          else if (Math.abs(n.left + n.width / 2 - (g.left + g.width / 2)) < 1)
            pagePlacement = "centre";
          else pagePlacement = "other";
        }

        return {
          containerWidth: section.offsetWidth,
          blockOverflows: section.scrollWidth > section.clientWidth + 1,
          heading: heading ? text(heading) : null,
          headingSize: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
          serifHeading: heading ? normalise(getComputedStyle(heading).fontFamily) === serif : null,
          count: count ? text(count) : null,
          headers: headerCells.map((th) =>
            text(th.querySelector('[data-part="label"]') ?? th)
              .replace(/[↕↑↓]/g, "")
              .trim(),
          ),
          sortButtons: sortButtons.map((b) => text(b).replace(/[↕↑↓]/g, "").trim()),
          numbers: rows.map((row) => text(row.querySelector('th[scope="row"]'))),
          customers: cells(2).map((cell) => text(cell.firstElementChild)),
          emails: cells(2)
            .map((cell) => cell.children[1] as HTMLElement)
            .filter((email) => email && shown(email))
            .map((email) => text(email)),
          issued: cells(3).map((cell) => text(cell)),
          statuses: rows.map((row) => text(row.querySelector('[data-scope="badge"]'))),
          statusVariants: rows.map(
            (row) => row.querySelector('[data-scope="badge"]')?.getAttribute("data-variant") ?? "",
          ),
          amounts: rows.map((row) => text(row.children[5])),
          menuTriggers: triggers.map((t) => t.getAttribute("aria-label") ?? ""),
          checkboxes: inputs.map((input) =>
            text(input.closest("label")?.querySelector('[data-part="label"]')),
          ),
          disabledCheckboxes: inputs.filter((input) => input.disabled).length,
          disabledSortButtons: sortButtons.filter((b) => b.disabled).length,
          disabledMenuTriggers: triggers.filter((t) => t.disabled).length,
          scrolls: region ? region.scrollWidth > region.clientWidth + 1 : false,
          tableFillsFrame: region && table ? table.offsetWidth >= region.clientWidth - 1 : false,
          pages: nav
            ? [...nav.querySelectorAll('[data-part="item"]')].map((item) => text(item))
            : [],
          currentPage: nav ? text(nav.querySelector('[aria-current="page"]')) || null : null,
          pagePlacement,
          pageButtons: pageButtons.length,
          disabledPageButtons: pageButtons.filter((b) => b.disabled).length,
          empty: empty ? text(empty) : null,
          paddingTop: parseFloat(getComputedStyle(body).paddingTop),
          retry: [...section.querySelectorAll('[data-scope="alert"] [data-scope="button"]')].map(
            (b) => text(b),
          ),
          placeholders: busy
            ? [...busy.querySelectorAll('[aria-hidden="true"]')].filter(
                (row) => row.querySelector('[data-scope="skeleton"]') !== null,
              ).length
            : 0,
          alert: section.querySelector('[data-scope="alert"][role="alert"]') !== null,
          offCentre: Math.abs(
            bodyBox.left + bodyBox.width / 2 - (blockBox.left + blockBox.width / 2),
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
  state: "default" | "wide" | "empty" | "error",
  label: string = state,
): Promise<Record<string, number>> {
  await showState(page, state);
  return page.evaluate(
    ({ state, label, selector }) => {
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
      const shown = (el: Element) => getComputedStyle(el).display !== "none";
      const parts: Array<[string, Element | null | undefined]> = [
        ["heading", block.querySelector("h2")],
        ["description", block.querySelector("h2 + p")],
        ["count", block.querySelector("p[aria-live]")],
        ["empty message", block.querySelector("p.border-dashed")],
        ["alert title", block.querySelector('[data-scope="alert"] [data-part="title"]')],
        [
          "alert description",
          block.querySelector('[data-scope="alert"] [data-part="description"]'),
        ],
        ["retry", block.querySelector('[data-scope="alert"] [data-scope="button"]')],
        ["current page", block.querySelector('nav [aria-current="page"]')],
        ["other page", block.querySelector('nav [data-part="item"]:not([aria-current])')],
        ["next page", block.querySelector('nav [data-part="next-trigger"]')],
        ["clear selection", block.querySelector('p[aria-live] + div [data-scope="button"]')],
        ["bulk actions", block.querySelector('p[aria-live] + div [data-scope="menu"]')],
      ];
      [...block.querySelectorAll("thead th")].filter(shown).forEach((th, i) => {
        const button = th.querySelector('[data-scope="button"]');
        if (th.textContent?.trim()) parts.push([`header ${i + 1}`, button ?? th]);
      });

      const ratios: Record<string, number> = {};
      for (const [name, el] of parts) {
        if (el) ratios[`${label} ${name}`] = against(el);
      }
      block.querySelectorAll("tbody tr").forEach((row, i) => {
        const n = `row ${i + 1}`;
        const cells = [...row.children] as HTMLElement[];
        ratios[`${label} ${n} number`] = against(cells[1]!);
        ratios[`${label} ${n} customer`] = against(cells[2]!.firstElementChild!);
        const email = cells[2]!.children[1];
        if (email && shown(email)) ratios[`${label} ${n} email`] = against(email);
        if (shown(cells[3]!)) ratios[`${label} ${n} issued`] = against(cells[3]!);
        ratios[`${label} ${n} status`] = against(cells[4]!.querySelector('[data-scope="badge"]')!);
        ratios[`${label} ${n} amount`] = against(cells[5]!);
        ratios[`${label} ${n} menu`] = against(cells[6]!.querySelector('[data-scope="menu"]')!);
      });
      return ratios;
    },
    { state, label, selector: BLOCK },
  );
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`table — ${scheme}`, () => {
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
          const lg = block.containerWidth >= CONTAINER_LG;

          expect(block.paddingTop, `${where}: room above`).toBe(lg ? 64 : 48);
          expect(block.offCentre, `${where}: centred`).toBeLessThan(1);
          expect(block.blockOverflows, `${where}: the block never overflows`).toBe(false);
          expect(block.alert, `${where}: error announced`).toBe(state === "error");
          expect(block.heading, `${where}: heading`).toBe(HEADING);
          expect(block.serifHeading, `${where}: serif heading`).toBe(true);

          if (state === "loading") {
            expect(block.placeholders, `${where}: a placeholder per row on a page`).toBe(5);
            expect(block.numbers, `${where}: no rows while loading`).toEqual([]);
            expect(block.count, `${where}: no count while loading`).toBeNull();
            expect(block.pageButtons, `${where}: no page row`).toBe(0);
          } else if (state === "empty") {
            expect(block.empty, `${where}: empty message`).toBe(EMPTY);
            expect(block.numbers, `${where}: no rows`).toEqual([]);
            expect(block.count, `${where}: no count`).toBeNull();
            expect(block.pageButtons, `${where}: no page row`).toBe(0);
          } else if (state === "error") {
            expect(block.numbers, `${where}: no rows`).toEqual([]);
            expect(block.count, `${where}: no count`).toBeNull();
            expect(block.retry, `${where}: retry`).toEqual(["Try again"]);
            expect(block.pageButtons, `${where}: no page row`).toBe(0);
          } else {
            const rows = ONE_PAGE.includes(state) ? 3 : 5;
            expect(block.count, `${where}: invoice count`).toBe(
              rows === 3 ? "3 invoices" : "12 invoices",
            );
            expect(block.headers, `${where}: column headers`).toEqual([
              "Select every invoice on this page",
              "Invoice",
              "Customer",
              ...(lg ? ["Issued"] : []),
              "Status",
              "Amount",
              "Actions",
            ]);
            expect(block.sortButtons, `${where}: sortable headers`).toEqual([
              "Invoice",
              "Customer",
              "Amount",
            ]);
            expect(block.numbers, `${where}: numbers`).toEqual(NUMBERS.slice(0, rows));
            expect(block.customers, `${where}: customers`).toEqual(CUSTOMERS.slice(0, rows));
            expect(block.emails, `${where}: emails`).toEqual(lg ? EMAILS.slice(0, rows) : []);
            expect(block.issued, `${where}: issued`).toEqual(lg ? ISSUED.slice(0, rows) : []);
            expect(block.statuses, `${where}: statuses`).toEqual(STATUSES.slice(0, rows));
            expect(block.statusVariants, `${where}: status colours`).toEqual(
              VARIANTS.slice(0, rows),
            );
            expect(block.amounts, `${where}: amounts`).toEqual(
              state === "dollars" ? DOLLARS : EUROS.slice(0, rows),
            );
            expect(block.menuTriggers, `${where}: row menus`).toEqual(
              NUMBERS.slice(0, rows).map((n) => `Actions for ${n}`),
            );
            expect(block.checkboxes, `${where}: checkboxes`).toEqual([
              "Select every invoice on this page",
              ...NUMBERS.slice(0, rows).map((n) => `Select ${n}`),
            ]);
            const off = state === "disabled";
            expect(block.disabledCheckboxes, `${where}: checkboxes off`).toBe(off ? rows + 1 : 0);
            expect(block.disabledSortButtons, `${where}: sort buttons off`).toBe(off ? 3 : 0);
            expect(block.disabledMenuTriggers, `${where}: menus off`).toBe(off ? rows : 0);
            expect(block.tableFillsFrame, `${where}: the table fills its frame`).toBe(true);
            if (block.containerWidth < CONTAINER_SM) {
              expect(block.scrolls, `${where}: the table scrolls in its frame`).toBe(true);
            }
            if (lg) expect(block.scrolls, `${where}: the table fits`).toBe(false);
            if (rows === 3) {
              expect(block.pageButtons, `${where}: no page row for one page`).toBe(0);
            } else {
              expect(block.pages, `${where}: pages`).toEqual(PAGES);
              expect(block.currentPage, `${where}: current page`).toBe("1");
              expect(block.pagePlacement, `${where}: page row placement`).toBe(
                block.containerWidth >= CONTAINER_SM ? "end" : "centre",
              );
              // Previous is off on the first page; disabled turns off every button.
              expect(block.disabledPageButtons, `${where}: page buttons off`).toBe(
                off ? block.pageButtons : 1,
              );
            }
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

        // The heading is one size below `@md` and one larger size from it on.
        const below = new Set(
          blocks.filter((b) => b.containerWidth < CONTAINER_MD).map((b) => b.headingSize),
        );
        const above = new Set(
          blocks.filter((b) => b.containerWidth >= CONTAINER_MD).map((b) => b.headingSize),
        );
        expect(below.size, "one heading size below @md").toBe(1);
        expect(above.size, "one heading size from @md").toBe(1);
        expect([...above][0]!, "the heading steps up at @md").toBeGreaterThan([...below][0]!);

        // Each step is exercised on both sides at every viewport, so a step that
        // silently stopped firing cannot pass this file.
        const containerWidths = blocks
          .filter((b) => b.numbers.length > 0)
          .map((b) => b.containerWidth);
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
      for (const state of [
        "default",
        "one-page",
        "dollars",
        "empty",
        "loading",
        "error",
        "disabled",
      ] as const) {
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
      await showState(page, "wide");
      await hydrated(page, "wide");
      const ratios = {
        ...(await contrastRatios(page, "default")),
        ...(await contrastRatios(page, "wide")),
        ...(await contrastRatios(page, "empty")),
        ...(await contrastRatios(page, "error")),
      };
      // A selected row fills with --muted; its texts must still read.
      const wide = blockIn(page, "wide");
      await wide.getByRole("checkbox", { name: "Select INV-1042" }).check({ force: true });
      await wide.getByRole("checkbox", { name: "Select INV-1041" }).check({ force: true });
      await page.mouse.move(0, 0);
      Object.assign(ratios, await contrastRatios(page, "wide", "selected"));

      for (const label of [
        "default heading",
        "default description",
        "default count",
        "default current page",
        "default other page",
        "default next page",
        ...["header 2", "header 3", "header 4", "header 5"].map((h) => `default ${h}`),
        ...NUMBERS.flatMap((_, i) =>
          ["number", "customer", "status", "amount", "menu"].map(
            (part) => `default row ${i + 1} ${part}`,
          ),
        ),
        ...NUMBERS.flatMap((_, i) => [`wide row ${i + 1} email`, `wide row ${i + 1} issued`]),
        "wide header 4",
        "selected clear selection",
        "selected bulk actions",
        ...["number", "customer", "email", "issued", "status", "amount", "menu"].flatMap((part) => [
          `selected row 1 ${part}`,
          `selected row 2 ${part}`,
        ]),
        "empty empty message",
        "error alert title",
        "error alert description",
        "error retry",
      ]) {
        expect(Object.keys(ratios), `${scheme}: ${label} measured`).toContain(label);
      }
      for (const [what, ratio] of Object.entries(ratios)) {
        expect(ratio, `${scheme}: ${what} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("shows hover and focus-visible on its rows and controls", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      await hydrated(page, "default");
      const block = blockIn(page, "default");
      const ring = (locator: Locator) =>
        locator.evaluate((el) => ({
          focused: el.matches(":focus-visible") || el.hasAttribute("data-focus-visible"),
          style: getComputedStyle(el).outlineStyle,
        }));
      const fill = (locator: Locator) =>
        locator.evaluate((el) => getComputedStyle(el).backgroundColor);

      // A row fills with --muted under the pointer.
      const row = block.locator("tbody tr").nth(1);
      await page.mouse.move(0, 0);
      const resting = await fill(row);
      const muted = await page.evaluate(() => {
        const probe = document.createElement("div");
        probe.style.backgroundColor = "var(--muted)";
        document.body.append(probe);
        const colour = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return colour;
      });
      expect(resting, `${scheme}: row at rest`).not.toBe(muted);
      await row.hover();
      // The fill eases in over the row's colour transition.
      await expect.poll(() => fill(row), `${scheme}: row hover is --muted`).toBe(muted);

      // A sort button fills on hover and rings on keyboard focus.
      const sort = block.getByRole("button", { name: "Amount" });
      await page.mouse.move(0, 0);
      const sortResting = await fill(sort);
      await sort.hover();
      expect(await fill(sort), `${scheme}: sort button hover`).not.toBe(sortResting);
      await page.mouse.move(0, 0);
      await sort.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const sortRing = await ring(sort);
      expect(sortRing.focused, `${scheme}: sort button keyboard focus`).toBe(true);
      expect(sortRing.style, `${scheme}: sort button focus ring`).not.toBe("none");

      // A checkbox draws its ring on the control while its hidden input has focus.
      const checkbox = block.getByRole("checkbox", { name: "Select INV-1041" });
      await checkbox.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const control = block.locator("tbody tr").nth(1).locator('[data-part="control"]');
      const checkboxRing = await ring(control);
      expect(checkboxRing.focused, `${scheme}: checkbox keyboard focus`).toBe(true);
      expect(checkboxRing.style, `${scheme}: checkbox focus ring`).not.toBe("none");

      // A row's menu trigger fills on hover and rings on keyboard focus.
      const trigger = block.getByRole("button", { name: "Actions for INV-1041" });
      await page.mouse.move(0, 0);
      const triggerResting = await fill(trigger);
      await trigger.hover();
      expect(await fill(trigger), `${scheme}: menu trigger hover`).not.toBe(triggerResting);
      await page.mouse.move(0, 0);
      await trigger.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const triggerRing = await ring(trigger);
      expect(triggerRing.focused, `${scheme}: menu trigger keyboard focus`).toBe(true);
      expect(triggerRing.style, `${scheme}: menu trigger focus ring`).not.toBe("none");

      // The scrolling frame takes keyboard focus, so the keyboard can scroll it.
      const frame = blockIn(page, "narrow").getByRole("region", { name: HEADING });
      await frame.scrollIntoViewIfNeeded();
      await frame.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const frameRing = await ring(frame);
      expect(frameRing.focused, `${scheme}: frame keyboard focus`).toBe(true);
      expect(frameRing.style, `${scheme}: frame focus ring`).not.toBe("none");
      await page.keyboard.press("ArrowRight");
      await expect.poll(() => frame.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    });

    test("sorts by a column, up and then down", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      await hydrated(page, "default");
      const block = blockIn(page, "default");
      const amounts = block.locator("tbody tr td:nth-child(6)");
      const headerOf = (name: string) =>
        block.locator("thead th").filter({ has: page.getByRole("button", { name }) });

      await expect(block.locator("thead th[aria-sort]")).toHaveCount(0);

      await block.locator("nav [data-part='item'][data-index='2']").click();
      await expect(block.locator('nav [aria-current="page"]')).toHaveText("2");

      await block.getByRole("button", { name: "Amount" }).click();
      await expect(headerOf("Amount")).toHaveAttribute("aria-sort", "ascending");
      await expect(amounts).toHaveText(["€320.00", "€450.00", "€690.00", "€740.00", "€860.00"]);
      // A new sort goes back to the first page.
      await expect(block.locator('nav [aria-current="page"]')).toHaveText("1");

      await block.getByRole("button", { name: "Amount" }).click();
      await expect(headerOf("Amount")).toHaveAttribute("aria-sort", "descending");
      await expect(amounts).toHaveText([
        "€5,400.00",
        "€3,100.00",
        "€2,750.00",
        "€2,400.00",
        "€1,980.00",
      ]);

      await block.getByRole("button", { name: "Customer" }).click();
      await expect(headerOf("Customer")).toHaveAttribute("aria-sort", "ascending");
      await expect(headerOf("Amount")).not.toHaveAttribute("aria-sort");
      await expect(block.locator("tbody tr td:nth-child(3) > span:first-child")).toHaveText([
        "Acme Studio",
        "Bluebird Coffee",
        "Fjord Design",
        "Kite Analytics",
        "Lumen Labs",
      ]);
    });

    test("selects rows and a page, and acts on them", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      await hydrated(page, "default");
      const block = blockIn(page, "default");
      const count = block.locator("p[aria-live]");
      const all = block.getByRole("checkbox", { name: "Select every invoice on this page" });
      const allRoot = block.locator('thead [data-scope="checkbox"][data-part="root"]');

      await expect(count).toHaveText("12 invoices");
      await expect(block.getByRole("button", { name: "Clear selection" })).toHaveCount(0);

      await block.getByRole("checkbox", { name: "Select INV-1041" }).check({ force: true });
      await block.getByRole("checkbox", { name: "Select INV-1039" }).check({ force: true });
      await expect(count).toHaveText("2 of 12 selected");
      await expect(allRoot).toHaveAttribute("data-state", "indeterminate");
      await expect(block.locator("tbody tr[data-selected]")).toHaveCount(2);

      // The bulk menu lists its actions.
      await block.getByRole("button", { name: /Bulk actions/ }).click();
      const menu = page.getByRole("menu");
      await expect(menu.getByRole("menuitem")).toHaveText([
        "Mark as paid",
        "Download PDFs",
        "Delete",
      ]);
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);

      // The header checkbox takes the whole page…
      await all.check({ force: true });
      await expect(count).toHaveText("5 of 12 selected");
      await expect(allRoot).toHaveAttribute("data-state", "checked");

      // …and the selection survives paging, where the header starts clear.
      await block.locator("nav [data-part='next-trigger']").click();
      await expect(block.locator('nav [aria-current="page"]')).toHaveText("2");
      await expect(allRoot).toHaveAttribute("data-state", "unchecked");
      await expect(count).toHaveText("5 of 12 selected");
      await all.check({ force: true });
      await expect(count).toHaveText("10 of 12 selected");
      await all.uncheck({ force: true });
      await expect(count).toHaveText("5 of 12 selected");

      await block.getByRole("button", { name: "Clear selection" }).click();
      await expect(count).toHaveText("12 invoices");
      await expect(block.locator("tbody tr[data-selected]")).toHaveCount(0);

      // Each row's menu lists its actions.
      await block.getByRole("button", { name: "Actions for INV-1037" }).click();
      await expect(page.getByRole("menu").getByRole("menuitem")).toHaveText([
        "View",
        "Download PDF",
        "Delete",
      ]);
      await page.keyboard.press("Escape");
    });

    test("keeps every control out of reach when disabled", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "disabled");
      await hydrated(page, "disabled");
      const block = blockIn(page, "disabled");
      for (const checkbox of await block.getByRole("checkbox").all()) {
        await expect(checkbox).toBeDisabled();
      }
      for (const name of ["Invoice", "Customer", "Amount", "Actions for INV-1042"]) {
        await expect(block.getByRole("button", { name })).toBeDisabled();
      }
      for (const button of await block.locator("nav button").all()) {
        await expect(button).toBeDisabled();
      }
      await block.getByRole("checkbox", { name: "Select INV-1042" }).click({ force: true });
      await expect(block.locator("p[aria-live]")).toHaveText("12 invoices");
      await expect(block.locator("thead th[aria-sort]")).toHaveCount(0);
    });

    test("announces the loading rows once and the failed load as an alert", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "loading");
      const region = page.locator(`[data-demo-state="loading"] ${BLOCK} [role="status"]`);
      await expect(region).toHaveAttribute("aria-busy", "true");
      await expect(region).toContainText("Loading your invoices");
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

    test("names its table and its rows", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "default");
      const block = blockIn(page, "default");
      await expect(block.getByRole("heading", { level: 2 })).toHaveText(HEADING);
      await expect(block.getByRole("table", { name: HEADING })).toHaveCount(1);
      await expect(block.getByRole("region", { name: HEADING })).toHaveCount(1);
      await expect(block.getByRole("rowheader")).toHaveText(NUMBERS);
      await expect(block.getByRole("navigation")).toHaveCount(1);
    });

    test("treats an empty error string as no error", async ({ page }) => {
      await page.goto(PAGE, { waitUntil: "networkidle" });
      await showState(page, "error");
      const block = blockIn(page, "error");

      // The demo's retry clears its message to "", the way a consumer holding
      // the error as a string does once the load succeeds.
      await block.getByRole("button", { name: "Try again" }).click();

      await expect(block.locator('[data-scope="alert"]')).toHaveCount(0);
      await expect(block.getByRole("rowheader")).toHaveText(NUMBERS);
      await expect(block.locator("nav")).toHaveCount(1);
    });
  });
}
