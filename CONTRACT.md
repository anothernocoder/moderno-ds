# CONTRACT.md — Moderno token contract

The **technical contract** of the design system: the semantic token slots every
component references, the rules for theming them, the `data-scope`/`data-part`
styling convention, and the implementation guardrails.

This is **not a brand guide**. Values shipped in `@moderno/tokens` are neutral
(OKLCH grays + a system font stack). A brand is a _theme_ layered on top — the
Moderno **default theme** is authored in [`DESIGN.md`](DESIGN.md) (the source of
truth for its tokens and rationale) and shipped as the `theme-moderno` registry
item in Phase 5.

## Golden rule

> **Components are never edited. They are themed via variables and varied via
> props.**

Consumers change appearance by overriding the contract variables (a theme) and
change behavior/shape by passing props (resolved to `data-*` attributes). They
do not fork component markup or write component CSS. Ejecting a primitive is an
escape hatch, not the path.

## The three layers

| Layer            | Lives in                       | Brand?  |
| ---------------- | ------------------------------ | ------- |
| Contract (names) | this file + `@moderno/tokens`  | neutral |
| Default values   | `@moderno/tokens` (OKLCH gray) | neutral |
| Brand values     | a theme (`theme-moderno`, …)   | branded |

Neutrality is a property of the **values in `@moderno/tokens`**, not of any
document. A theme re-maps the same slot names to brand values; the contract
never changes.

## Minimum color contract

Every component may reference only these semantic slots. All are OKLCH, defined
in `:root` (light) with a `.dark` override.

| Slot                                         | Role                         |
| -------------------------------------------- | ---------------------------- |
| `--background` / `--foreground`              | page surface + text          |
| `--card` / `--card-foreground`               | raised surface               |
| `--popover` / `--popover-foreground`         | floating surface             |
| `--primary` / `--primary-foreground`         | primary action               |
| `--secondary` / `--secondary-foreground`     | secondary action             |
| `--muted` / `--muted-foreground`             | muted surface + subdued text |
| `--accent` / `--accent-foreground`           | accent surface               |
| `--destructive` / `--destructive-foreground` | destructive action           |
| `--border`                                   | borders / separators         |
| `--input`                                    | form control borders         |
| `--ring`                                     | focus ring                   |
| `--chart-1` … `--chart-5`                    | data-viz series              |

Non-color contract slots: `--radius`, `--font-sans`, `--font-mono`.

## Extended contract

Beyond color, the contract also standardizes:

- **Spacing** — `--spacing-1` … `--spacing-8`.
- **Motion** — `--motion-instant` (150ms), `--motion-fast` (200ms),
  `--motion-normal` (300ms).
- **Radius** — `--radius` (base) and `--radius-full` (pills/dots).

No hardcoded spacing, durations, or radii in components — reference the slot.

## Theming rules

- **Dark mode** follows shadcn: `:root` = light, `.dark` = dark. Apps that are
  dark by default mount `<html class="dark">`.
- **A theme** is a CSS file of variable assignments. It may use brand primitives
  (`--mod-…`) internally and alias them to the contract:
  `--background: var(--mod-surface-base)`.
- **Multi-brand** scopes overrides under `[data-brand="…"]`, composable with
  `.dark`. Switching `[data-brand]` re-maps variables without touching the base
  tokens. (`@moderno/tokens` ships a `contrast` demo scope.)
- **Tailwind v4**: import `@moderno/css/preset`. It maps each slot to a theme
  namespace with `@theme inline`, so utilities reference `var(--slot)` directly
  and runtime overrides re-theme without a rebuild.

## Styling convention: `data-scope` / `data-part`

Component styles target Ark-style attributes, never component-owned class names:

```css
[data-scope="dialog"][data-part="content"] {
  /* … */
}
```

Variants are expressed as data attributes on the root part
(`data-variant="outline"`, `data-size="sm"`), resolved from props by CVA in
`@moderno/core`. This keeps one shared stylesheet framework-agnostic.

## Package surface

- **`@moderno/tokens`** — the contract.
  - `@moderno/tokens/css` → the variables (`:root` / `.dark` / `[data-brand]`).
  - `@moderno/tokens/preset` → the Tailwind v4 `@theme inline` mapping.
- **`@moderno/css`** — the public entrypoint. Consumers import only this:
  - `@import "@moderno/css";` (contract values; Phase 1 also adds components)
  - `@import "@moderno/css/preset";` (Tailwind preset)
  - Internal paths (`dist/`, package subpaths) are never exposed to consumers.

## Guardrails

- **Do** reference contract slots; **don't** hardcode hex, px spacing, or ms.
- **Do** put brand values in a theme; **don't** add brand identity to
  `@moderno/tokens`.
- **Do** theme via variables and vary via props; **don't** edit component
  markup or write per-component CSS in consumer projects.
- **Do** keep `:root` light / `.dark` dark; **don't** invent a third theming
  mechanism (`data-theme`, dark-first inversion).
- **Do** keep `@moderno/css` the only public CSS specifier.

## Notes

- Phase 0 authors tokens **directly as CSS** (CSS-first, no JS bundler). The
  DTCG authoring + `theme-compile` pipeline arrives with themes in Phase 5
  (see [ADR-0001](docs/adr/0001-platform-distribution-docs-theming.md),
  [ADR-0002](docs/adr/0002-token-contract-and-design-md.md)).
