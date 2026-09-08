# Visual regression seam

Every **preview page** of the built docs — a page that hydrates at least one
island, i.e. where the design system actually renders (the live `<Preview>`
demos and the Theme Builder) — is screenshotted at **375 / 768 / 1280 px** in
**light and dark** and compared pixel-for-pixel against a committed baseline.
Fourteen pages × six combinations today; the page list is read from `dist/`, so a
docs page for a new primitive or block joins the matrix as soon as it is built.

A diff here means a token, a stylesheet or a component's markup moved. That is
either the change you intended — update the baselines — or a regression.

## The sidebar is not in the page captures

`BaseLayout.astro` builds `<aside class="sidebar">` from
`getCollection("docs")`, so it lists **every** page of the locale on **every**
page. Captured as-is, adding one docs page repainted all 84 baselines at once:
two tickets adding a page in parallel collided on every one of them, and
whichever merged second was stale on arrival.

So `docs.spec.ts` injects `NEUTRALISE_SIDEBAR_CSS` (see `chrome.ts`), which
collapses the aside to a zero-height, unpainted box before the capture. With
that applied, adding a sidebar row moves nothing at any width. Everything else
the layout renders — header, search, language switcher, theme toggle, the TOC
rail, the `.layout` grid geometry, prose, `<Preview>` / `<Install>` /
`<PropsTable>` — is independent of how many pages exist and stays in every
capture.

The rule is scoped to `.layout > aside.sidebar` — `SIDEBAR_SELECTOR`, the one
constant the stylesheet, the collapse assertion and the fixture are all built
from. A bare `.sidebar` would reach **any** element with that class, including
one a block or screen demo renders inside `.preview-panel--demo`: that demo
would be blanked inside its own baseline while every guard stayed green, since
a `querySelector(".sidebar")` rot check finds the layout aside first. Nothing
in the docs collides today; the ~100 block and screen pages this decoupling
unblocks are exactly where an app shell with a sidebar shows up. `docs.spec.ts`
constructs that collision and asserts the demo still paints.

Masking would not have worked. Playwright's `mask` is pure paint: the element
keeps its box. Above the 56rem breakpoint that is enough, because `docs.css`
gives `.sidebar` a fixed `height: calc(100vh - 6rem)` scroll box — but below it
the sidebar is `position: static; height: auto` in normal flow above `<main>`,
so one extra row lengthens the page and `toHaveScreenshot` fails on the image
size before any mask or tolerance applies. Measured with one `<li>` injected:
1280 `scrollHeight` 1186 → 1186, 768 1910 → 1943, 375 2237 → 2269.

**The rule to carry forward:** anything in `BaseLayout.astro` that reads
`getCollection("docs")` is chrome whose content is a function of the repo's page
count. It belongs in `chrome.spec.ts`, never in the per-page captures. If a
future layout change adds a footer listing pages or a "related components" rail,
extend `chrome.ts` — do not let it into `docs.spec.ts`.

(Same bug class, one element away: at 375 the captured image is 428 px wide,
not 375. The overflow is `div.header-tools`, not the sidebar. It is
page-count-independent today so it couples nothing, but adding one header item
would change the width of all 28 narrow baselines at once.)

## What watches the chrome instead

`chrome.spec.ts` captures `chrome-en.png` and `chrome-es.png` — the real
`BaseLayout` markup and the real `docs.css`, at the same six width × scheme
combinations, with only the page-inventory-driven content swapped for a fixture:
a fixed sidebar (three groups, six rows, one `aria-current="page"`), fixed
`<main>` copy, and a fixed TOC list with a fixed highlight. Twelve baselines
whose subject is genuinely shared, and which are **constant with respect to the
page count** — adding a docs page does not move them.

Every label in that fixture is a **real** `group` / `title` from the content
collection, and the set is a frozen worst-case sample rather than a mirror:
three sections so the `h2` margins stack between consecutive `.sidebar-group`
blocks (and one of them holds a single row, like the real `Guides` / `Blocks` /
`Screens` / `Flows`), and each locale's longest real row label — 179.9px of the
236.8px a row has at 1280, and 176.8px in Spanish — so a narrower
`--docs-sidebar` or a larger row font crosses the wrap threshold and moves
pixels. **Do not add a row to it when you add a docs page**: deriving it from
the collection would put the page count straight back into twelve baselines.

Three post-conditions keep the fixture honest, because every branch of
`freezeChrome` is a "replace it if it is still there" branch: it reports the
selectors it could not find, and the spec asserts that list is empty and then
re-reads the frozen sidebar, `<h1>` and TOC rows off the live page. Rename
`<main id="main">` and the capture fails instead of quietly absorbing
`button.mdx`'s prose and repainting on every edit to it from then on.

The sidebar's `overflow-y: auto` scroll box is asserted in geometry, not in
pixels — the `sidebar box` test. `docs.css` gives it `height: calc(100vh - 6rem)`
above 56rem, 804px at this suite's 900px viewport, and neither the fixture
(335px of rows) nor the real sidebar (768px at 1280, fifteen pages) fills it, so
nothing is clipped and deleting `overflow-y: auto` moves zero pixels here _and_
on the real site. Growing the fixture past 804px would buy the clip at the price
of ~470px of stacked nav in the eight narrow baselines, for a property that is
inert in production until the page list outgrows the box. The computed-style
assertion costs no image and fails at all three widths.

Both anchors (`/en/button/`, `/es/button/`) are asserted to be members of
`previewPages()` before capture, so renaming or deleting one is a red test
rather than a silent deletion of all chrome coverage.

Not watched by the chrome baselines, deliberately: the plain `.layout` (no-TOC)
variant, since both anchors carry `h2` headings; and the locale index pages,
which `BaseLayout.astro` filters out of the sidebar so no row there is
`aria-current`. Another anchor costs six more baselines if that changes.

`guards.spec.ts` covers what neither pixel set can any more: that the sidebar
lists exactly the locale's docs pages, in the same order on every page of the
locale, with the current page's own row marked — and that every island in
`src/islands/` is hydrated by at least one captured page, so a demo cannot drop
out of the matrix silently. Text assertions, no committed artifact, so they can
never conflict between branches.

## Why a cascade test, not a baseline

`preview-cascade.spec.ts` sits alongside the pixel baselines and asserts
**computed styles** instead: inside a live `<Preview>` panel, a block's own
utilities and the panel's scoped preflight have to beat `docs.css`'s prose
typography, which selects the same elements (`main h2` matches a block's
`<h2 class="text-lg">`). That is a cascade fact — a baseline can only say
_something moved_, and a test that greps the emitted CSS passes just as happily
while every rule it found is being overridden.

## Running it

```sh
pnpm --filter @moderno-ui/docs... build   # the suite serves dist/, not astro dev
pnpm docs:visual                          # compare against the baselines
pnpm docs:visual --project=375-dark       # one width × scheme
pnpm docs:visual --ui                     # Playwright's UI mode
```

`playwright.config.ts` starts `scripts/serve-dist.ts` over `apps/docs/dist`, so
the build must be current — including the Pagefind index (`pnpm build` runs it),
because the search UI is part of every captured page.

## Updating the baselines

```sh
pnpm docs:visual:update                          # replace every baseline
pnpm docs:visual:update --only en-alert,es-alert # take only these
```

Screenshots are only reproducible inside the environment that rendered them, so
the committed baselines are the ones the CI container produces — never a
laptop's. The script dispatches the `visual-baselines` workflow on the current
branch (push it first), waits for it, and writes the artifact into
`__screenshots__/linux/`. Review the result with `git diff --stat` and commit it
**in the same PR as the change that caused it**: that is what makes a deliberate
style change fail CI until someone accepts it.

**Adding a docs page: use `--only`.** The plain form replaces the whole `linux/`
directory with whatever the dispatching branch's `dist/` produced. From a branch
that is behind `main` that tree is missing a sibling's newly merged baselines, and
committing it reverts them — the mechanism is parallel-safe, the procedure is
not. Name the new baselines instead and touch nothing else. The full replace is
for a change to the chrome or to a shared stylesheet, where every baseline
really did move.

For a quick local loop, `pnpm docs:visual --update-snapshots` writes a
`__screenshots__/darwin/` (or `win32/`) directory instead. `.gitignore` drops
those, so a host-rendered screenshot can never be mistaken for what CI compares
against.

A **new** page needs no dispatch: the CI `visual` job fails on it (there is
nothing to compare against) but Playwright writes the screenshot anyway, and the
job uploads it as the `visual-baselines` artifact. Copy **only that page's
files** out of it into `__screenshots__/linux/<project>/` — never the whole
directory, for the reason above — and commit. Same route when the workflow
itself is not on the default branch yet, since GitHub only offers
`workflow_dispatch` from there.

## Layout

| Path                                                     | What it is                                                           |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| `pages.ts`                                               | The pages, read from `dist/`: `previewPages()` and `allPages()`.     |
| `settle.ts`                                              | The "has it stopped moving?" wait, shared by both capture specs.     |
| `chrome.ts`                                              | The sidebar-neutralising rule, the chrome anchors and their fixture. |
| `docs.spec.ts`                                           | One capture per preview page, sidebar collapsed; the scoping guard.  |
| `chrome.spec.ts`                                         | One frozen chrome capture per locale, plus the scroll-box guard.     |
| `guards.spec.ts`                                         | Non-pixel guards: sidebar inventory, island coverage.                |
| `preview-cascade.spec.ts`                                | Computed styles inside a `<Preview>` panel — no screenshots.         |
| `__screenshots__/{platform}/{width}-{scheme}/{page}.png` | The baselines.                                                       |
| `../../playwright.config.ts`                             | The width × scheme matrix, the static server, the tolerance.         |

The comparison tolerance is **zero pixels**: the docs are deterministic by
construction (self-hosted fonts, fixed demo data, animations disabled), so
anything flaky is a bug in the page, not a threshold to raise.

`settle.ts` is load-bearing for that determinism, and so is _when_ it runs. Both
specs mutate the page (a stylesheet in `docs.spec.ts`, a DOM swap in
`chrome.spec.ts`) and both do it **before** `settled(page)`. Reorder them and
`settled` certifies a height the mutation is about to invalidate, and the capture
races the Theme Builder's `onMount` reflow again — the flake #212 fixed.

## Pinning

The baselines belong to `mcr.microsoft.com/playwright:v<version>-noble`. The
image tag in `.github/workflows/ci.yml` and `visual-baselines.yml` and the
exact `@playwright/test` version in `apps/docs/package.json` are one decision in
three places — bump them together, and regenerate the baselines in the same PR.
