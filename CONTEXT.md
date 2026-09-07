# Moderno Design System

Framework-agnostic design system monorepo: primitives versioned via npm, blocks/themes via a shadcn-style registry, documentation in Astro. Platform decisions (toolchain, publish, docs, themes): **ADR-0001** (`docs/adr/0001-platform-distribution-docs-theming.md`). Absorption of the predecessor `moderno` and the npm scope: **ADR-0004**. Responsive policy and registry tiers: **ADR-0005**.

## Language

**Design System (DS)**:
The complete product: tokens, primitives, charts, blocks, themes, CLI and docs.
_Avoid_: UI kit, component library (when referring to the entire product)

**Primitive**:
Headless component + shared styles, distributed as a versioned npm package (`@moderno-ui/react`, etc.). Not copied into the consumer project unless explicitly ejected.
_Avoid_: Component, widget

**Block**:
A page *section* composed of primitives (e.g. hero, pricing table, login form) that the consumer copies with the CLI and can modify freely. A block does not own the viewport and carries no navigation state.
_Avoid_: Template, pattern, organism, section (as a domain term)

**Screen**:
A full-viewport composition of blocks that represents one state of a flow (e.g. `sign-in`, `cart`). Presentational: it receives data and callbacks, holds no navigation state of its own. Installable on its own via the CLI; installing it pulls in the blocks it composes.
_Avoid_: Page, view, layout (as a domain term)

**Flow**:
An ordered sequence of screens plus an example assembly that supplies the navigation state between them (e.g. `auth`: sign-in → sign-up → forgot-password → reset-password → verify). Installable as a unit via the CLI.
_Avoid_: Wizard, journey, funnel, multi-step form (for the registry unit)

**Theme**:
A CSS file of variables that defines the appearance of a brand. The brand lives 100% in CSS variables, never inside the components.
_Avoid_: Skin, palette file

**Registry**:
A versioned catalog of items installable via the CLI, in copy tiers (`registry:component` for primitives in eject mode, `registry:block`, `registry:screen`, `registry:flow`) plus `registry:theme`. A tier composes only the tiers below it; installing one installs those transitively. Source in the repo: `registry/registry.json`. Public URL: `https://moderno.style/r/registry.json` (served from the docs deploy).
_Avoid_: Catalog, manifest (when referring to the complete catalog)

**Eject**:
Copying a primitive's source into the consumer project to own the markup. An escape hatch, not the default path.
_Avoid_: Fork, vendor

**CONTRACT.md**:
The technical contract of the DS: semantic token slots, theming rules, `data-scope`/`data-part` mapping, and implementation guardrails. Neutral — not a brand guide. Lives at the repo root.
_Avoid_: DESIGN.md (for the contract), brand guide, style guide

**DESIGN.md**:
The source of truth for Moderno's **default theme** (`theme-moderno`): token values (google-labs `DESIGN.md` format — YAML front matter + rationale) and the guidance for applying them. Lives at the repo root, paired with `tokens.json` (its DTCG twin). Supplies _values_; `CONTRACT.md` supplies _names and rules_.
_Avoid_: Token contract (that is CONTRACT.md), neutral contract

**Brand guidelines**:
Documentation of the visual identity of a specific brand (typography, tone, aesthetic anti-patterns). For the default theme this lives in `DESIGN.md`; broader narrative identity is referenced from the docs.
_Avoid_: CONTRACT.md (for brand content)

**Token contract**:
The minimal set of shadcn-style semantic variables (`--primary`, `--background`, …) that every component references. Defined in CONTRACT.md, implemented in CSS by each theme.
_Avoid_: Token spec, design tokens file

**Brand token (brand primitive)**:
A CSS variable with a brand prefix (e.g. `--mod-surface-base`) that captures a raw value from the visual identity. Lives in the theme, not in components.
_Avoid_: Raw token, primitive (unqualified — collides with Primitive)

**Semantic alias**:
A mapping in the theme from a contract slot to a brand token (`--background: var(--mod-surface-base)`). The bridge between the shadcn contract and the brand aesthetic.
_Avoid_: Semantic token (use only in technical docs; in CONTEXT prefer "semantic alias")

**@moderno-ui/tokens**:
The npm package that generates the shadcn slot contract, neutral OKLCH defaults, the Tailwind v4 preset and CSS vars. Contains no brand identity.
_Avoid_: Theme package, tokens.json (as a product name)

**@moderno-ui/css**:
A single CSS entrypoint that re-exports tokens + the component stylesheet. The consumer's public API; hides internal paths to `dist/`.
_Avoid_: globals bundle, styles entry (unqualified)

**Init**:
The CLI command (`@moderno-ui/cli init`) that scaffolds `src/styles/moderno.css` in the consumer project with the correct imports. The user does not configure CSS manually.
_Avoid_: Setup, bootstrap (as a domain term)

**Neutral default**:
Placeholder values in `@moderno-ui/tokens` (OKLCH grays, system font stack) that allow developing and previewing components without installing a brand theme.
_Avoid_: Base theme, fallback theme

**Island runtime**:
The single component framework used in the Astro docs and static `.astro` rendering. Chosen: **Svelte**. React/Vue/Solid remain as npm packages; Svelte is additionally the island target.
_Avoid_: Preview framework, docs framework

**Dark mode**:
shadcn convention: `:root` = light, `.dark` = dark. Moderno apps mount `<html class="dark">` by default. `theme-moderno.css` defines brand values in both scopes.
_Avoid_: Dark-first inversion, data-theme attribute

**Component stylesheet**:
A single shared CSS based on Ark's `[data-scope]` / `[data-part]`. Lives in `@moderno-ui/core/styles/components.css`. Imported by all framework packages and the docs.
_Avoid_: Per-framework CSS, styled-components layer

**Theme item**:
A registry unit that delivers brand CSS + associated assets (self-hosted fonts, etc.). Installable via the CLI (`moderno add theme-moderno`). Authoring: `tokens.dtcg.json` + `theme.css` in `registry/themes/{name}/`, generated by the **Theme Builder** or `pnpm theme:build` (`tooling/theme-compile`). Not an npm package.
_Avoid_: Theme package, skin bundle

**Theme Builder**:
An app embedded in the docs (`/[lang]/theme-builder`, a Svelte island). Edits semantic contract slots and brand primitives with live preview; exports `theme.css`, `tokens.dtcg.json` and a CLI snippet. Imports registry themes as a base. v1 persistence: URL + localStorage. The source of truth of the custom themes pipeline in v1.
_Avoid_: External Theme Studio, editing components to theme, accounts/server (v1)

**Multi-brand**:
The ability to scope themes by `[data-brand="…"]` composed with `.dark`. Architecture from Phase 0; a second synthetic theme (`theme-contrast`) in Phase 5 to demonstrate the switch in the docs.
_Avoid_: Multi-tenant theming, white-label mode

**npm namespace**:
The prefix of published packages: `@moderno-ui/*` (`@moderno-ui/tokens`, `@moderno-ui/react`, `@moderno-ui/core`, …). CLI: `@moderno-ui/cli`. All public on npmjs.com; semver via Changesets + GitHub Actions.
_Avoid_: @ds/_, moderno-ds/_ (as an npm scope), private registry (v1)

**Extended contract**:
Beyond shadcn color slots, the contract includes spacing (`--spacing-1…8`), motion (`--motion-instant|fast|normal`), radius (`--radius`, `--radius-full`), a display face (`--font-serif`), elevation (`--shadow-sm|md|lg`) and container breakpoints (`--container-sm|md|lg`). Defined in CONTRACT.md, defaults in `@moderno-ui/tokens`, overrides in themes.
_Avoid_: Hardcoded spacing, magic numbers in CSS, viewport breakpoints as tokens

**Theme Moderno v1**:
Includes complete OKLCH ramps for light (`:root`) and dark (`.dark`), with semantic aliases in both scopes. A functional light/dark toggle from v1.
_Avoid_: Dark-only theme, WIP light mode

**Type scale**:
Sizes and line-heights as CSS vars in `@moderno-ui/tokens`; exposed as Tailwind v4 utilities via `@theme inline` (`text-display`, `text-body-md`, …). No parallel custom CSS classes.
_Avoid_: Typography component, custom .text-\* classes in core

**Component variant**:
An alternative visual style (outline, sm, destructive…) expressed as `data-variant`, `data-size`, etc. on the `[data-part=root]`. CVA in `@moderno-ui/core` resolves props → data attributes; CSS in `components.css`.
_Avoid_: Variant class, CVA Tailwind string

**Predecessor (`moderno`)**:
The earlier design-system repo (`anothernocoder/moderno`: Zag.js directly, `--md-*` tokens, `[data-theme]`, Starlight docs). Its inventory of primitives, blocks, screens and flows is the *source material* being absorbed into this DS; its code is not copied verbatim. Archived once the absorption is complete. Its `styles`, `class-contract`, `chart-core` and `registry` packages are deprecated on npm in favour of `@moderno-ui/css`, `@moderno-ui/core`, `@moderno-ui/charts-core` and `@moderno-ui/cli`.
_Avoid_: "the app", "moderno v1", legacy DS (unqualified)

**Responsive**:
Blocks and screens adapt to the width of their *container* (container queries against `--container-*`), never to the viewport; a block must look right wherever it is placed. Primitives that change shape on small viewports (a dialog becoming a bottom sheet) use viewport media queries. Intrinsic grids (`auto-fit`) are welcome but are not, on their own, "responsive".
_Avoid_: Viewport-only breakpoints in blocks, mobile-specific component families

**Maintainer**:
A single person responsible for the DS. A design constraint that prioritizes DRY and automation over ad-hoc flexibility.
_Avoid_: Team, contributor

**Monorepo toolchain**:
Node 22 LTS, pnpm 9+ workspaces, TypeScript 5 strict, **ESM-only** packages with `exports`, JS bundling via **tsup**, tests with **Vitest**, lint with ESLint + Prettier. No Turborepo in v1.
_Avoid_: Dual CJS/ESM, webpack for libraries

**npm publication**:
`@moderno-ui/*` packages public on npmjs.com. Semver versioning with **Changesets**; automatic publish from GitHub Actions when the Changesets PR is merged into `main`.
_Avoid_: GitHub Packages (v1), manual version bumps

**Registry URL**:
The catalog of copy items served as a static asset from the docs site: `https://moderno.style/r/registry.json`. The CLI uses that URL by default; override in `components.json` or `MODERNO_REGISTRY_URL`.
_Avoid_: Registry-only-on-npm, unversioned raw GitHub URLs as default

**Docs site (hosting)**:
`apps/docs` deployed on **Vercel**, production domain **`moderno.style`**. The same deploy serves MDX docs and registry assets under `/r/`.
_Avoid_: Starlight, separate registry CDN in v1

**Docs search**:
**Pagefind** with a **per-locale index** (`en`, `es`). No Algolia in v1.
_Avoid_: Client-side search SaaS (v1), a single search index mixing languages

**i18n (docs)**:
Two locales from v1: **`en`** (default) and **`es`**. Routes prefixed with `/en/...` and `/es/...`. Parallel Content Collections; the build fails if the translated pair is missing. Site UI translated; API identifiers and code blocks in English in both languages.
_Avoid_: English-only docs, translating prop names

**PropsTable**:
Generated at build time by the `tooling/props-doc` script (ts-morph) → JSON per component; `<PropsTable>` in Astro consumes that JSON. Column labels translated via i18n; prop names in English.
_Avoid_: react-docgen-only, hand-maintained prop tables

**Chart render tree**:
The serializable SVG node tree `@moderno-ui/charts-core` emits per chart
(`lineChartNodes`, …): frame, tick-label anchors and the full
`data-scope`/`data-part` structure, as data. Each framework binding is a thin
_walker_ that maps nodes onto its own elements; `chartNodeToSvg` is the
reference serialization the per-framework parity tests compare SSR output
against.
_Avoid_: per-framework chart markup, ChartFrame (retired)

**Theme compile**:
The `pnpm theme:build` script (`tooling/theme-compile`) validates and emits `theme.css` from `tokens.dtcg.json`. Used by CI, maintainers and the Theme Builder export. Includes WCAG AA warnings.
_Avoid_: themes as npm packages, hand-written CSS without a schema
