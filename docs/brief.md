# Prompt: Build a framework-agnostic Design System

> Copy this entire document as a prompt for a coding AI (Claude Code, etc.).
> It is written as direct instructions to that AI.

---

## Role and objective

You are a senior design systems engineer. You are going to build, from scratch, a **framework-agnostic design system** distributed as a monorepo. The system must look **identical** and behave **identical** across Astro, React 19, Vue, Svelte and SolidJS, be maintainable by a **single person**, and be consumed with a **shadcn**-style DX.

Do not improvise architecture: the technical decisions are already made (below) and have a rationale. If something is not specified, ask before inventing. Proceed **in phases** and confirm the token contract before writing components.

---

## Hard requirements (non-negotiable)

1. **Same look and same behavior** across all frameworks.
2. **SSR** in all of them.
3. **Fast**: small bundles, tree-shakeable, zero unnecessary runtime CSS.
4. **Custom charts** (not a batteries-included charts library).
5. **Single maintainer**: minimize duplication; logic and style are written once.
6. **shadcn-style DX**: easy to install and use.
7. **CLI** to install and **update**.
8. **Primitives and blocks**.
9. Installable with **bun, pnpm and npm**.
10. **Documentation site / component library** in **Astro**, minimalist, with: preview + code, copy button, copy-as-markdown, props tables, examples, installation per package manager.
11. **Per-project/per-brand theming** without editing components.

---

## Mandatory stack

- **Behavior:** **Ark UI** (headless, built on Zag.js). The state machine is defined once and runs the same in all 4 frameworks. This is the "same behavior" guarantee. Packages: `@ark-ui/react`, `@ark-ui/vue`, `@ark-ui/svelte`, `@ark-ui/solid`.
- **Style:** **Tailwind v4** (CSS-first config with `@theme inline`) + **design tokens as CSS variables** (DTCG format, colors in **OKLCH**). Style is applied via utilities that resolve to semantic variables.
- **Cross-framework styling hook:** use the `data-scope` / `data-part` attributes that Ark exposes to write **a single stylesheet** that applies identically across all frameworks. This is the "looks the same" guarantee.
- **Charts (custom):** **only the D3 math layer** → `d3-scale`, `d3-shape`, `d3-array`, `d3-path` (pure functions, no DOM, SSR-safe). The `<svg>` is rendered with each framework's native templating. The SVG elements read the same theme CSS variables. **Forbidden:** `d3-selection`/`d3-transition`.
- **Distribution:** **shadcn**-style registry + its CLI. Versioned items.
- **Docs:** **plain Astro + MDX + Content Collections**. Live previews as **Svelte or Solid islands** (lightweight runtime). **Starlight forbidden.**

---

## Distribution model (decision made)

**Hybrid:**

- **Primitives → versioned npm packages.** One per framework: `@moderno/react`, `@moderno/vue`, `@moderno/svelte`, `@moderno/solid`. Single source of truth, updates via `npm/pnpm/bun update`. Semver + changelog.
- **Blocks (compositions) → registry/copy.** Items the consumer copies with the CLI and modifies freely.
- **Themes → CSS files, distributed as registry items** (e.g.: `theme-moderno`, `theme-contrast`).
- **Single CSS entrypoint → `@moderno/css`.** Re-exports tokens + component stylesheet. The consumer does not import internal paths (`dist/`, core subpaths).
- **Escape hatch:** also expose the primitives in the registry as "eject" for when a project needs to own the markup of a specific component.

---

## Theming model (decision made)

**The brand lives 100% in the CSS variables, never inside the components.**

- **Two token levels:** primitives (raw palette, OKLCH ramps) and **semantic** (the theme contract: `--primary`, `--background`, `--radius`, etc.). **Components only reference semantics.**
- **Tailwind v4:** the swappable variables live in `:root` / `.dark` / `[data-brand="..."]`; `@theme inline` maps the utilities to those variables (`--color-primary: var(--primary)`) so the runtime override works.
- **Re-theming = redefining variables**, never editing components:
  - Per-project theme → edit/replace `tokens.css`.
  - Multiple brands in one app → scope via `[data-brand="..."]`.
  - Dark mode → scope via `.dark`. Composes with brand.
  - Targeted override of a component → CSS via `[data-brand] [data-scope][data-part]`.
- **Golden rule written in CONTRACT.md:** _components are not edited; they are themed via variables and varied via props._ This is what lets the CLI's `update` overwrite primitives without conflict.

**Minimum contract of semantic tokens** (define them all in OKLCH, with a dark variant):
`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--radius`, `--font-sans`, `--font-mono`, and `--chart-1`…`--chart-5`.

---

## Monorepo structure (target)

```
moderno-ds/
├── packages/
│   ├── tokens/            # @moderno/tokens — tokens DTCG → CSS vars + preset Tailwind v4
│   ├── core/              # @moderno/core — CVA, utils, styles/components.css
│   ├── css/               # @moderno/css — entrypoint único (re-export tokens + components)
│   ├── charts-core/       # @moderno/charts-core — d3-math puro
│   ├── react/             # @moderno/react — primitivas React 19 (Ark) + charts SVG
│   ├── vue/               # @moderno/vue
│   ├── svelte/            # @moderno/svelte — runtime de islas en docs/Astro
│   └── solid/             # @moderno/solid
├── registry/
│   ├── blocks/            # composiciones (copy items), una variante por framework
│   ├── themes/            # theme-*.css (registry items)
│   └── registry.json      # items versionados + registryDependencies
├── apps/
│   └── docs/              # Astro plano + MDX (component library)
├── tooling/
│   └── cli/               # @moderno/cli — init / add / update / diff + manifest
├── CONTEXT.md             # glosario del dominio
├── CONTRACT.md            # contrato técnico: slots + reglas + data-part (neutro, no marca)
├── DESIGN.md              # fuente de verdad del theme default (formato google-labs DESIGN.md)
├── tokens.json            # DTCG del theme default (par de DESIGN.md)
├── pnpm-workspace.yaml
└── package.json
```

---

## Component scope

**Primitives (package, via Ark)** — start with: Button, Input, Field/Label, Textarea, Checkbox, Radio Group, Switch, Select, Combobox, Menu, Dialog, Drawer, Popover, Tooltip, Tabs, Accordion, Slider, Toast, Avatar, Badge, Card, Separator, Progress, Tags Input, Date Picker, Pagination, Toggle, Toggle Group.

**Pure primitives (CSS class only, no component)** — Typography, surfaces, utility layout. Usable in any framework and in `.astro` without duplication.

**Charts (custom, d3-math + SVG)** — start with: line, area, bar, scatter. Each one: math layer in `@moderno/charts-core` (pure) + SVG render per framework. Themed via `--chart-*`.

**Blocks (registry/copy)** — examples: auth (login/signup), pricing, dashboard shell, data table, checkout, settings, empty states.

---

## Documentation site (Astro)

Plain Astro + MDX + Content Collections. Build these custom components:

- `<Preview>` — island (Svelte or Solid) that renders the real, interactive component.
- `<Code>` — code block with a **copy** button.
- **Preview / Code** tabs.
- `<PropsTable>` — auto-generated from the component's types.
- **Copy-as-markdown** per page + an `llms.txt` and a `.md` per component (for LLM consumption).
- **Copy component** — button that provides the install command (`bunx`/`pnpm dlx`/`npx`) and/or the source.
- Installation block with **bun / pnpm / npm** tabs.
- Minimalist aesthetic (reference: shadcn). No docs-framework chrome.
- **i18n in en + es** — routes `/en/...` and `/es/...`, parallel Content Collections, language switcher, Pagefind per locale. See ADR-0001.
- **Theme Builder** — `/[lang]/theme-builder` (Svelte island): edits semantic tokens with live preview; exports `theme.css`, `tokens.dtcg.json` and a CLI snippet. See ADR-0001.

---

## CLI

Based on the **shadcn registry + CLI** (do not build a CLI from scratch beyond the wrapper). Package: `@moderno/cli`.

- `init` — scaffolds CSS and config into the consuming project. Creates `src/styles/moderno.css`:
  ```css
  @import "@moderno/css";
  @import "./theme-moderno.css"; /* tras add theme */
  ```
  The user imports a single file in their layout: `import "@/styles/moderno.css"`.
- `add` — installs blocks/themes (and allows ejecting primitives).
- `update` / `diff` — updates copied items; requires **versioned items in the registry** + a **manifest** (`.moderno/manifest.json`) that records installed versions.
- Compatible with **bun, pnpm and npm** as runners.

## Consumer DX (CSS)

The consumer **never** imports internal paths (`@moderno/tokens/dist/...`, `@moderno/core/styles/...`).

| Layer                               | Import                 | Who manages it                 |
| ----------------------------------- | ---------------------- | ------------------------------ |
| DS base (tokens + component styles) | `@moderno/css`         | npm package                    |
| Brand                               | `./theme-moderno.css`  | CLI `add theme-moderno` (copy) |
| App                                 | `@/styles/moderno.css` | CLI `init` (scaffold)          |

`@moderno/css` is a thin package whose `index.css` re-exports `@moderno/tokens/css` + `@moderno/core/css` via `package.json` exports.

---

## Guardrails (mistakes NOT to make)

- Do **NOT** use Starlight or a generic docs framework. Plain Astro + MDX.
- Do **NOT** use a charts library (Unovis, Recharts, etc.) for the custom charts. Only d3-math + your own SVG. (Unovis only if a generic, non-custom chart is requested later.)
- Do **NOT** use `d3-selection`/`d3-transition`.
- Do **NOT** use Zag.js directly except for a targeted opt-out for bundle reasons in a specific component; use Ark.
- Do **NOT** use Panda CSS unless typed slot recipes are explicitly requested; use Tailwind v4.
- Do **NOT** bake colors, radii or fonts into the components. Only references to semantic tokens.
- Do **NOT** make customization require editing the component's file. Customization = props + CSS variables + CSS via `data-part`.
- Do **NOT** duplicate primitives in `.astro`: in Astro, reuse the Svelte/Solid component rendered server-only (without a `client:` directive) → static HTML, zero JS.
- In Astro, use **a single** island framework for the whole DS (Svelte or Solid) so as not to load two runtimes.

---

## Phased plan (proceed in order, confirm at the end of each one)

- **Phase 0 — Foundation:** monorepo (pnpm workspaces), `@moderno/tokens` + `@moderno/css` (entrypoint), DTCG tokens in OKLCH → CSS vars + preset Tailwind v4, and **CONTRACT.md** with the token contract and the rules (the Moderno default theme is authored in `DESIGN.md`). _Confirm the token contract with me before continuing._
- **Phase 1 — Core:** `@moderno/core` (utils, CVA, helpers, components.css) and `@moderno/charts-core` (pure d3-math).
- **Phase 2 — Reference implementation (React 19):** Button, Field, Dialog and Select end-to-end, with the single `data-part`-based stylesheet. Validate SSR and theming via variables.
- **Phase 3 — Port:** Vue, Svelte, Solid of those same components, reusing the stylesheet. Demonstrate look and behavior parity.
- **Phase 4 — Charts:** line/area/bar/scatter (math in core + SVG per framework), themed via `--chart-*`, with SSR.
- **Phase 5 — Distribution:** versioned registry.json, `@moderno/cli` (init/add/update/diff + manifest), example blocks, 2 themes (`theme-moderno` + `theme-contrast`), `tooling/theme-compile` (`pnpm theme:build`).
- **Phase 6 — Docs:** bilingual Astro site (en/es) with Preview/Code, copy, copy-as-markdown, PropsTable, bun/pnpm/npm installation, **Theme Builder**, and static registry at `/r/`.

---

## Acceptance criteria

- The same component looks and behaves identically across the 5 targets.
- Changing brand = changing CSS variables, without touching components.
- The CLI's `update` overwrites an unedited primitive without conflict.
- Everything SSRs without hydration errors.
- Custom charts fully controlled (own SVG) and themed via tokens.
- Installation works with bun, pnpm and npm.
- Minimalist docs with working preview/code, copy and copy-as-markdown.
- Docs available in **English and Spanish** with slug parity.
- **Theme Builder** exports valid CSS + DTCG and a preview consistent with the real components.

---

**Start with Phase 0 and show me the CONTRACT.md with the token contract before writing components.**
