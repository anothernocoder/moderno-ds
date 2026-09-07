/**
 * The docs **chrome** — everything `BaseLayout.astro` wraps a page in — and the
 * one piece of it that couples every page baseline to the repo's page count.
 *
 * ## The rule this file exists to enforce
 *
 * Anything in `BaseLayout.astro` that reads `getCollection("docs")` is chrome
 * whose *content* is a function of how many pages the repo has. Rendering it
 * inside a per-page screenshot makes every baseline change when any page is
 * added. Today that is exactly one element — `<aside class="sidebar">` — so the
 * per-page captures neutralise it (`NEUTRALISE_SIDEBAR_CSS`) and it is watched
 * once, from the frozen fixture below, by `chrome.spec.ts`.
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
 * independent of the page count, and `docs.spec.ts` asserts the box really did
 * collapse so the rule cannot rot silently.
 */
export const NEUTRALISE_SIDEBAR_CSS = `.sidebar {
  visibility: hidden !important;
  height: 0 !important;
  min-height: 0 !important;
  overflow: hidden !important;
}`;

/** A chrome capture: a real docs page whose page-specific content is frozen. */
export interface ChromeAnchor {
  /** Must be a member of `previewPages()`; `chrome.spec.ts` asserts it. */
  path: string;
  /** Snapshot-safe name, i.e. the baseline filename without `.png`. */
  name: string;
  /** Frozen sidebar group labels, in this locale. */
  groups: [string, string];
  /** Frozen `<main>` copy, in this locale. */
  main: { heading: string; body: string };
}

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
 */
export const CHROME_ANCHORS: ChromeAnchor[] = [
  {
    path: "/en/button/",
    name: "chrome-en",
    groups: ["Start", "Components"],
    main: {
      heading: "Chrome fixture",
      body: "Frozen content. This baseline watches the site chrome — header, sidebar and table of contents — not the page it is captured from.",
    },
  },
  {
    path: "/es/button/",
    name: "chrome-es",
    groups: ["Inicio", "Componentes"],
    main: {
      heading: "Fixture del chrome",
      body: "Contenido fijo. Esta baseline vigila el chrome del sitio — cabecera, barra lateral y tabla de contenidos — no la página desde la que se captura.",
    },
  },
];

/**
 * Replace the page-inventory-driven parts of the chrome with fixed markup.
 *
 * Runs in the browser. It rebuilds `<aside class="sidebar">` from the class
 * names `BaseLayout.astro` actually emits (`.sidebar-group > h2`, `ul > li > a`,
 * `aria-current="page"` on the current row), swaps `<main>` for a fixed heading
 * and paragraph so the anchor page's own prose can never move this baseline,
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
 */
export function freezeChrome(anchor: ChromeAnchor): void {
  const [startGroup, componentsGroup] = anchor.groups;
  const group = (label: string, items: [string, boolean][]) =>
    `<section class="sidebar-group"><h2>${label}</h2><ul>${items
      .map(
        ([text, current]) =>
          `<li><a href="#"${current ? ' aria-current="page"' : ""}>${text}</a></li>`,
      )
      .join("")}</ul></section>`;

  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.innerHTML =
      group(startGroup, [
        ["Alpha", false],
        ["Bravo", false],
      ]) +
      group(componentsGroup, [
        ["Charlie", true],
        ["Delta", false],
        ["Echo", false],
      ]);
  }

  const main = document.getElementById("main");
  if (main) {
    main.innerHTML =
      `<h1>${anchor.main.heading}</h1>` +
      `<p>${anchor.main.body}</p>` +
      `<h2 id="fixture-one">Alpha</h2><p>${anchor.main.body}</p>` +
      `<h3 id="fixture-two">Bravo</h3><p>${anchor.main.body}</p>`;
  }

  const tocList = document.querySelector(".toc-list");
  if (tocList) {
    tocList.innerHTML =
      `<li class="toc-item toc-item--2"><a href="#fixture-one" data-toc-link="fixture-one" aria-current="true">Alpha</a></li>` +
      `<li class="toc-item toc-item--3"><a href="#fixture-two" data-toc-link="fixture-two">Bravo</a></li>`;
  }
}
