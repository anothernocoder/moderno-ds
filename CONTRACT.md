# CONTRACT.md — Moderno token contract

The **technical contract** of the design system: the semantic token slots every
component references, the rules for theming them, the `data-scope`/`data-part`
styling convention, and the implementation guardrails.

This is **not a brand guide**. Values shipped in `@moderno-ui/tokens` are neutral
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

| Layer            | Lives in                          | Brand?  |
| ---------------- | --------------------------------- | ------- |
| Contract (names) | this file + `@moderno-ui/tokens`  | neutral |
| Default values   | `@moderno-ui/tokens` (OKLCH gray) | neutral |
| Brand values     | a theme (`theme-moderno`, …)      | branded |

Neutrality is a property of the **values in `@moderno-ui/tokens`**, not of any
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

Non-color contract slots: `--radius`, `--font-sans`, `--font-mono`. Every theme
must define these and all the color slots above, in both scopes.

## Extended contract

Beyond color, the contract also standardizes:

- **Spacing** — `--spacing-1` … `--spacing-8`.
- **Motion** — `--motion-instant` (150ms), `--motion-fast` (200ms),
  `--motion-normal` (300ms).
- **Radius** — `--radius` (base) and `--radius-full` (pills/dots).
- **Display face** — `--font-serif`, the face headings and pull quotes use when
  the brand has one (`theme-moderno`: Hedvig Letters Serif). Body copy stays on
  `--font-sans`.
- **Elevation** — `--shadow-sm` / `--shadow-md` / `--shadow-lg`, three steps for
  overlays (popover, menu, drawer, toast). A theme may compose a hairline ring
  with the shadow so an overlay still separates from a near-black canvas;
  `theme-moderno` does. The `.dark` scope carries its own three values — a
  light-mode shadow disappears on a dark surface.
- **Container breakpoints** — `--container-sm` (24rem), `--container-md` (36rem),
  `--container-lg` (48rem). Blocks and screens respond to the width of their
  _container_, never the viewport (ADR-0005). These three are the whole scale a
  block may use: in Tailwind they replace the container namespace rather than
  extend it (see below).

No hardcoded spacing, durations, radii, shadows, or widths in components —
reference the slot.

Extended slots are **optional in a theme**: `@moderno-ui/tokens` ships a neutral
default for each, and a theme overrides only what its brand actually changes.
The color and non-color slots above are mandatory; `theme-compile` fails a
theme that omits one.

## Theming rules

- **Dark mode** follows shadcn: `:root` = light, `.dark` = dark. Apps that are
  dark by default mount `<html class="dark">`.
- **A theme** is a CSS file of variable assignments. It may use brand primitives
  (`--mod-…`) internally and alias them to the contract:
  `--background: var(--mod-surface-base)`.
- **Multi-brand** scopes overrides under `[data-brand="…"]`, composable with
  `.dark`. Switching `[data-brand]` re-maps variables without touching the base
  tokens. (`@moderno-ui/tokens` ships a `contrast` demo scope.)
- **Tailwind v4**: import `@moderno-ui/css/preset`. It maps each slot to a theme
  namespace with `@theme inline`, so utilities reference `var(--slot)` directly
  and runtime overrides re-theme without a rebuild — `bg-primary`, `font-serif`,
  `shadow-md`, `rounded-lg`. The one exception is `--container-*`, in two ways:
  - It is not `inline`. A CSS container query condition cannot contain `var()`,
    so the three lengths are registered literally; `@sm:`/`@md:`/`@lg:` fire at
    fixed widths, while `max-w-sm` and friends still read `var(--container-sm)`
    and follow a theme override at runtime.
  - **It replaces Tailwind's container scale, it does not extend it.**
    `--container-*` is Tailwind's own namespace — its `md` is 28rem, its `lg`
    32rem, its `xl` 36rem — and the contract's three steps are not those values,
    so the preset resets the namespace (`--container-*: initial`) before
    declaring them. Installing Moderno therefore leaves `max-w-sm|md|lg`,
    `w-sm|md|lg` and `@sm:`/`@md:`/`@lg:` and **removes** `max-w-xl`, `@2xl:` and
    the rest of Tailwind's container sizes; blocks use the three contract steps
    only. Without the reset the scale would be out of order — `max-w-lg` (48rem)
    wider than `max-w-xl` (36rem). Note that `@moderno-ui/css` on its own already
    retunes `md`/`lg` (its `:root` is unlayered and beats `@layer theme`), so
    import the preset alongside it to get the ordered three-step scale.

## Styling convention: `data-scope` / `data-part`

Component styles target Ark-style attributes, never component-owned class names:

```css
[data-scope="dialog"][data-part="content"] {
  /* … */
}
```

Variants are expressed as data attributes on the root part
(`data-variant="outline"`, `data-size="sm"`), resolved from props by CVA in
`@moderno-ui/core`. This keeps one shared stylesheet framework-agnostic.

## Package surface

- **`@moderno-ui/tokens`** — the contract.
  - `@moderno-ui/tokens/css` → the variables (`:root` / `.dark` / `[data-brand]`).
  - `@moderno-ui/tokens/preset` → the Tailwind v4 `@theme inline` mapping.
  - `@moderno-ui/tokens/contract` → the contract as data (slot name, DTCG type,
    editor group, WCAG contrast pair). Every other slot list — theme-compile's
    required slots, the Theme Builder's editor groups, the docs model — derives
    from it; adding a slot is a single edit here.
- **`@moderno-ui/css`** — the public entrypoint. Consumers import only this:
  - `@import "@moderno-ui/css";` (contract values; Phase 1 also adds components)
  - `@import "@moderno-ui/css/preset";` (Tailwind preset)
  - Internal paths (`dist/`, package subpaths) are never exposed to consumers.

## Guardrails

- **Do** reference contract slots; **don't** hardcode hex, px spacing, or ms.
- **Do** put brand values in a theme; **don't** add brand identity to
  `@moderno-ui/tokens`.
- **Do** theme via variables and vary via props; **don't** edit component
  markup or write per-component CSS in consumer projects.
- **Do** keep `:root` light / `.dark` dark; **don't** invent a third theming
  mechanism (`data-theme`, dark-first inversion).
- **Do** keep `@moderno-ui/css` the only public CSS specifier.

## Notes

- Phase 0 authors tokens **directly as CSS** (CSS-first, no JS bundler). The
  DTCG authoring + `theme-compile` pipeline arrives with themes in Phase 5
  (see [ADR-0001](docs/adr/0001-platform-distribution-docs-theming.md),
  [ADR-0002](docs/adr/0002-token-contract-and-design-md.md)).
