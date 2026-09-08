---
status: accepted
---

# Docs craft: harvest Nimbus rather than adopt it; Astro 7 with Sätteri and native Shiki; examples as real files

The docs site ships its features (bilingual with a parity gate, per-locale
Pagefind, props-doc tables, Theme Builder, the `/r/` registry) but not a reader
experience: no way to see a component in Vue, Svelte or Solid, previews hidden
behind a Preview/Code tab pair, a flat sidebar, a plain heading list for a table
of contents, and a search box that mounts nothing when the index is missing.
Cloudflare's Nimbus (#60) was evaluated as a replacement. ADR-0001 chose plain
Astro and the brief forbade "a generic docs framework"; that guardrail is set
aside here — the only criterion is whether the documentation gets better.

## Decision

- **Harvest Nimbus, do not adopt it.** Nimbus is MIT and scaffolds source the
  consumer owns, so its pieces port cleanly: the code group with page-wide
  synced selection, package-manager tabs, prev/next pagination, breadcrumbs,
  the table-of-contents rail, the API field-list presentation, page actions,
  `llms-full.txt`, JSON-LD and per-page OG images. Complex pieces (client
  logic) are copied with attribution; simple ones are re-implemented against
  the token contract. We keep our own props-doc extraction — Nimbus's prop
  table is hand-written front matter. The framework itself is not adopted:
  it has no i18n beyond a single `locale` string and we are bilingual with a
  CI gate; it has no Svelte, which is our island runtime (React 19 is its only
  optional island framework); its search is the Pagefind we already run; its
  `--nb-*` / `[data-mode]` tokens are the second theming mechanism
  CONTRACT.md forbids; it is pre-1.0 with a closed contribution model; and its
  registry CLI would sit beside `@moderno-ui/cli`.
- **Astro 7 (Vite 8), scoped to `apps/docs`.** Sätteri is the markdown
  processor — Astro 7's default, and the repo has no remark/rehype plugins to
  port. Code is highlighted by Astro's native Shiki (`astro:components`
  `<Code>`) with `github-light`/`github-dark` emitted as CSS variables and
  switched by our `.dark` class. `astro-expressive-code` is removed: of its
  surface we used two themes and a border, and its frames were disabled.
- **Preview anatomy: live demo above, source below, always visible.** One
  Svelte island per demo regardless of framework — the stylesheet is shared,
  so one live instance is the proof. A page-global **framework selector**
  (React, Vue, Svelte, Solid) switches every code block and the install
  command at once and is remembered across pages.
- **Examples are real files, never string literals in MDX.** Each demo's
  source lives per framework as a file the docs both display and mount, so it
  is typechecked and linted like any other source and cannot drift from the
  rendered demo. Block examples read the registry item itself.
- **Search and filter are separate gestures.** Pagefind's per-locale index
  stays; its stock UI goes, replaced by our own dialog over `pagefind.search()`
  opened with ⌘K / Ctrl+K, with an explicit state when the index is absent.
  The sidebar gets a title filter (`/`) that narrows the nav and never touches
  page content.
- **Order of delivery:** the upgrade lands first in its own PR, so a failure
  there is found before anything is built on it; then the ToC rail, the
  sidebar filter and search, which do not touch previews; the stacked Preview
  and framework selector last. The pixel baselines go with #217, which
  merges before the first ticket starts; from then on the e2e seams in
  `apps/docs/tests/e2e` are the gate, and each ticket extends them.

## Alternatives rejected

Full migration to Nimbus: two Astro majors and a token-vocabulary change to
rebuild by hand the i18n, Svelte islands, Theme Builder and `/r/` it does not
provide — and Cloudflare eating its own food does not change that list.
Rejecting Nimbus and designing the chrome from zero: throws away working,
actively maintained, MIT pieces that match our gap exactly. Staying on remark
for the upgrade: there is no plugin pipeline to protect. Keeping
expressive-code: a dependency carried for a feature set we turned off. Four
live islands per demo: ~160 files for no additional proof. Hand-written
four-framework literals in MDX: the drift bug we already have, times four.
Merging the sidebar filter into ⌘K: makes both worse.

## Consequences

- ADR-0001's docs table is amended, not superseded: the search row now reads
  "Pagefind, our own UI"; the framework and island-runtime rows stand.
- The brief's guardrail lines point here: harvesting pieces of a docs
  framework as owned source is allowed; adopting one is still not.
- #69's "React and Svelte code tabs" for blocks becomes four code tabs behind
  one live preview; docs pages written under #69 use the example-file
  convention from the start rather than migrating later.
- Files derived from Nimbus carry an attribution header naming the source file
  and its MIT licence.
- Expressive-code's fence meta syntax (`title=`, line markers) is gone; no
  page used it.
