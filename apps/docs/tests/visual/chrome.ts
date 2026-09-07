/**
 * The docs **chrome** — everything `BaseLayout.astro` wraps a page in — and the
 * one piece of it that couples every page baseline to the repo's page count.
 *
 * ## The rule this file exists to enforce
 *
 * Anything in `BaseLayout.astro` that reads `getCollection("docs")` is chrome
 * whose *content* is a function of how many pages the repo has. Rendering it
 * inside a per-page screenshot makes every baseline change when any page is
 * added. Today that is exactly one element — the layout's own
 * `<aside class="sidebar">` — so the per-page captures neutralise it
 * (`NEUTRALISE_SIDEBAR_CSS`) and it is watched once, from the frozen fixture
 * below, by `chrome.spec.ts`.
 *
 * If a future layout change adds another such element (a footer listing pages,
 * a "related components" rail), it belongs here and in `chrome.spec.ts` — not
 * in the per-page captures. See `README.md`.
 *
 * ## Why a stylesheet and not `mask`
 *
 * Playwright's `mask` option is pure paint: it overlays highlight boxes in the
 * top layer and removes them after the capture, so the masked element keeps its
 * box. Above the 56rem breakpoint that would be enough — `docs.css` gives
 * `.sidebar` `position: sticky; height: calc(100vh - 6rem); overflow-y: auto`,
 * so extra rows scroll inside a fixed box. Below it the sidebar is
 * `position: static; height: auto` in a single-column grid, in normal flow
 * above `<main>`, and one extra row lengthens the whole page. Measured against
 * the built docs by injecting one `<li>`: at 1280 `scrollHeight` holds at 1186,
 * at 768 it moves 1910 → 1943, at 375 it moves 2237 → 2269. A size mismatch
 * fails `toHaveScreenshot` before any mask or pixel tolerance applies, so
 * masking would fix one width out of three. The rule below removes the box.
 */

/**
 * The layout's own sidebar, and nothing else that happens to be called one.
 *
 * `NEUTRALISE_SIDEBAR_CSS` is injected into the whole document, so a bare
 * `.sidebar` would blank **any** element with that class — including one a docs
 * demo renders inside `.preview-panel--demo`. There are none today, but the
 * tickets this decoupling exists to unblock are ~100 block and screen pages,
 * and "app shell with a sidebar" is the obvious first screen: its demo would be
 * hidden inside its *own* baseline, with every guard still green, because a
 * `document.querySelector(".sidebar")` rot check reads the first match in DOM
 * order — which `BaseLayout.astro` guarantees is the layout `<aside>`.
 *
 * Scoping to the direct child of `.layout` is what makes that impossible: the
 * demo lives inside `<main>`, so the rule cannot reach it. Both the rule and
 * the assertion that the rule still applies are built from this one constant,
 * so they cannot drift apart.
 */
export const SIDEBAR_SELECTOR = ".layout > aside.sidebar";

/**
 * Collapse the sidebar to a zero-height, unpainted box.
 *
 * `visibility: hidden` blanks the pixels while `height: 0; overflow: hidden`
 * removes it from the page's height. It deliberately does **not** use
 * `display: none`: that stops the `<aside>` being a grid item, so `<main>`
 * auto-places into the 16rem sidebar track — measured at 1280, `main` goes from
 * x=312 w=672 to x=24 w=256 and grows 1000 → 1668 tall. Keeping the element in
 * the grid keeps `main` exactly where a reader sees it.
 *
 * With this applied, adding a sidebar row moves nothing at any width (dH=0,
 * dW=0 at 375/768/1280) — that invariant is what makes per-page baselines
 * independent of the page count, and `docs.spec.ts` asserts both halves so the
 * rule cannot rot silently: that the layout aside really did collapse, and that
 * a `.sidebar` inside `<main>` really did not.
 */
export const NEUTRALISE_SIDEBAR_CSS = `${SIDEBAR_SELECTOR} {
  visibility: hidden !important;
  height: 0 !important;
  min-height: 0 !important;
  overflow: hidden !important;
}`;

/** One frozen sidebar section: an `<h2>` label and the rows under it. */
export interface ChromeGroup {
  /** Section heading, as `BaseLayout.astro` renders it from `group`. */
  label: string;
  /** Row labels, in order, as it renders them from each page's `title`. */
  rows: string[];
}

/** A chrome capture: a real docs page whose page-specific content is frozen. */
export interface ChromeAnchor {
  /** Must be a member of `previewPages()`; `chrome.spec.ts` asserts it. */
  path: string;
  /** Snapshot-safe name, i.e. the baseline filename without `.png`. */
  name: string;
  /** Frozen sidebar sections, in this locale. See `CHROME_ANCHORS`. */
  sidebar: ChromeGroup[];
  /** The one row to mark `aria-current="page"`; must appear in `sidebar`. */
  currentRow: string;
  /** Frozen `<main>` copy, in this locale. */
  main: { heading: string; body: string };
}

/** The fixture's two in-page headings, which are also its two TOC rows. */
export const CHROME_SECTIONS = ["Alpha", "Bravo"] as const;

/**
 * One anchor per locale.
 *
 * Both are real committed pages that carry `h2` headings, so they render
 * `layout--with-toc` — one anchor exercises the three-column grid at 1280, the
 * `max-width: 75rem` TOC collapse, and the `max-width: 56rem` single-column
 * restack where the sidebar goes `position: static; height: auto`.
 *
 * Two locales rather than one because the chrome genuinely differs between
 * them: `nav.components`, `nav.themeBuilder`, `toc.title`, the search
 * placeholder and the language switcher's state are all translated, and the
 * per-page baselines no longer render any of the sidebar to show it.
 *
 * ## Why these rows, and why they must not be kept in sync
 *
 * Every label below is a **real** `group` / `title` from
 * `src/content/docs/<locale>/`, because the thing worth watching is text
 * metrics: what the row styling does to the longest string the site actually
 * renders. Measured at 1280, where the sidebar is narrowest, a row has 236.8px
 * of text width; the longest real label is `Using Moderno with agents` at
 * 179.9px and `Usar Moderno con agentes` at 176.8px. Both are in here, so
 * shrinking `--docs-sidebar` by a quarter, bumping `.sidebar-group`'s font, or
 * landing a longer translation crosses the wrap threshold and moves pixels.
 * With the previous ASCII placeholders (`Alpha`…`Echo`, ~45px) none of that
 * moved anything.
 *
 * Three sections rather than the two it had, because the `h2` margins stack
 * (`1.25rem 0 0.5rem`) between *consecutive* `.sidebar-group` blocks: two
 * groups show that seam once, three show it twice, and one of them has a single
 * row so the one-row section — which the real `Guides`, `Blocks`, `Screens` and
 * `Flows` sections all are — is in the picture too.
 *
 * **This list is frozen. Do not add a row when you add a docs page.** It is a
 * fixed worst-case sample, not a mirror of the collection — deriving it from
 * `getCollection("docs")` would put the page count back into twelve baselines,
 * which is the entire coupling this seam exists to remove. `guards.spec.ts`
 * owns the question of whether the *real* sidebar lists the right pages; this
 * owns only how a row looks. Change it when the row *styling* changes, or when
 * a longer title appears and you want the new worst case watched.
 */
export const CHROME_ANCHORS: ChromeAnchor[] = [
  {
    path: "/en/button/",
    name: "chrome-en",
    sidebar: [
      { label: "Start", rows: ["Installation", "Token contract"] },
      { label: "Guides", rows: ["Using Moderno with agents"] },
      { label: "Components", rows: ["Button", "Line Chart", "Scatter Chart"] },
    ],
    currentRow: "Button",
    main: {
      heading: "Chrome fixture",
      body: "Frozen content. This baseline watches the site chrome — header, sidebar and table of contents — not the page it is captured from.",
    },
  },
  {
    path: "/es/button/",
    name: "chrome-es",
    sidebar: [
      { label: "Inicio", rows: ["Instalación", "Contrato de tokens"] },
      { label: "Guías", rows: ["Usar Moderno con agentes"] },
      { label: "Componentes", rows: ["Botón", "Gráfico de líneas", "Gráfico de dispersión"] },
    ],
    currentRow: "Botón",
    main: {
      heading: "Fixture del chrome",
      body: "Contenido fijo. Esta baseline vigila el chrome del sitio — cabecera, barra lateral y tabla de contenidos — no la página desde la que se captura.",
    },
  },
];

/** Everything `freezeChrome` needs, since it runs without its module scope. */
export interface FreezeInput {
  anchor: ChromeAnchor;
  /** `SIDEBAR_SELECTOR`. */
  sidebar: string;
  /** `CHROME_SECTIONS`. */
  sections: readonly [string, string];
}

/**
 * Replace the page-inventory-driven parts of the chrome with fixed markup.
 *
 * Runs in the browser, so it is passed everything it needs rather than closing
 * over it: `page.evaluate` serializes the function source and evaluates it in
 * the page, where this module's constants do not exist.
 *
 * It rebuilds the layout's `<aside class="sidebar">` from the class names
 * `BaseLayout.astro` actually emits (`.sidebar-group > h2`, `ul > li > a`,
 * `aria-current="page"` on the current row), swaps `<main>` for a fixed heading
 * and paragraphs so the anchor page's own prose can never move this baseline,
 * and freezes the TOC rail.
 *
 * The TOC needs freezing for a second reason: `scripts/toc.ts` highlights the
 * link for whichever heading is nearest the top via an `IntersectionObserver`
 * bound to the *original* heading elements. Replacing `<main>` detaches those,
 * so whatever `aria-current` the observer had already set would stick at
 * whatever it happened to be — a race. Rebuilding the list leaves the observer
 * holding only detached nodes (it can no longer write anywhere) and lets the
 * fixture set the highlight itself, which keeps the
 * `.toc-list a[aria-current="true"]` treatment watched *and* deterministic.
 *
 * @returns the selectors it looked for and did not find — empty when every part
 * was frozen. Every branch here is a "if the element is still there" branch, so
 * without this the whole function is a silent no-op the day `BaseLayout.astro`
 * renames `#main` or `.toc-list`: the anchor page's real prose would walk into
 * `chrome-en`/`chrome-es`, the baselines would diff once, get regenerated, and
 * from then on every edit to `button.mdx` would repaint them. `chrome.spec.ts`
 * asserts on this, the way `docs.spec.ts` asserts the collapse really happened.
 */
export function freezeChrome({ anchor, sidebar, sections }: FreezeInput): string[] {
  const missing: string[] = [];
  // Labels are fixed literals from this file, never user input, so they go in
  // as-is; nothing here needs escaping.
  const group = (g: ChromeGroup) =>
    `<section class="sidebar-group"><h2>${g.label}</h2><ul>${g.rows
      .map(
        (row) =>
          `<li><a href="#"${row === anchor.currentRow ? ' aria-current="page"' : ""}>${row}</a></li>`,
      )
      .join("")}</ul></section>`;

  const aside = document.querySelector(sidebar);
  if (aside) aside.innerHTML = anchor.sidebar.map(group).join("");
  else missing.push(sidebar);

  const main = document.getElementById("main");
  if (main) {
    main.innerHTML =
      `<h1>${anchor.main.heading}</h1>` +
      `<p>${anchor.main.body}</p>` +
      `<h2 id="fixture-one">${sections[0]}</h2><p>${anchor.main.body}</p>` +
      `<h3 id="fixture-two">${sections[1]}</h3><p>${anchor.main.body}</p>`;
  } else missing.push("#main");

  const tocList = document.querySelector(".toc-list");
  if (tocList) {
    tocList.innerHTML =
      `<li class="toc-item toc-item--2"><a href="#fixture-one" data-toc-link="fixture-one" aria-current="true">${sections[0]}</a></li>` +
      `<li class="toc-item toc-item--3"><a href="#fixture-two" data-toc-link="fixture-two">${sections[1]}</a></li>`;
  } else missing.push(".toc-list");

  return missing;
}
