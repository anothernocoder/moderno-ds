# CONTRACT.md — Moderno token contract

The **rules** of the technical contract of the design system: how the semantic
token slots every component references are themed, the `data-scope`/`data-part`
styling convention, the responsive policy and the implementation guardrails.

The slots themselves are data. Each slot's name, DTCG type, group and one-line
role are defined once in
[`packages/css/src/contract.ts`](packages/css/src/contract.ts), published as
`@moderno-ui/css/contract`. This file never lists the slots or restates a value,
so it cannot fall behind them: read the contract for the slots, and the neutral
defaults ([`packages/css/src/tokens.css`](packages/css/src/tokens.css)) or a
theme's `DESIGN.md` for the values.

This is **not a brand guide**. Values shipped in `@moderno-ui/css` are neutral
(OKLCH grays + a system font stack). A brand is a _theme_ layered on top: a
registry item authored in `registry/themes/<name>/tokens.dtcg.json`, from which
`pnpm theme:build` generates its `theme.css` and its `DESIGN.md` (the brand's
values, the contract's roles and these rules applied, and its hand-written brand
notes). The Moderno default brand is one such theme, `theme-moderno`.

## Golden rule

> **Components are never edited. They are themed via variables and varied via
> props.**

Consumers change appearance by overriding the contract variables (a theme) and
change behavior/shape by passing props (resolved to `data-*` attributes). They
do not fork component markup or write component CSS. Ejecting a primitive is an
escape hatch, not the path.

## The three layers

| Layer            | Lives in                                              | Brand?  |
| ---------------- | ----------------------------------------------------- | ------- |
| Contract (names) | `@moderno-ui/css/contract` (slots, roles) + this file | neutral |
| Default values   | `@moderno-ui/css` (OKLCH gray, `:root`/`.dark`)       | neutral |
| Brand values     | a theme (`theme-moderno`, …)                          | branded |

Neutrality is a property of the **values in `@moderno-ui/css`**, not of any
document. A theme re-maps the same slot names to brand values; the contract
never changes.

## Minimum contract

Every component may reference only contract slots. The colour slots come in four
groups: **surfaces** (the page, raised surfaces and floating surfaces),
**brand** (actions, from the primary fill to the quieter ones), **support**
(recessed wells, the destructive action, status, lines and focus) and
**charts** (data-viz series, in order). All are OKLCH, defined in `:root`
(light) with a `.dark` override. Each `*-foreground` slot is paired with the
one surface it sits on, and `theme-compile` checks every pair for WCAG AA in
both scopes; `--muted-foreground` alone is also meant for `--background` and
`--card`.

The status slots carry the hue of a _state_, not of an action: an Alert or a
Badge tints its surface with them (`color-mix` against `--card`), while the
error state reuses `--destructive` so a destructive action and an error message
speak with one voice.

Beyond colour, the minimum contract holds the base corner radius and the
interface and code faces. Every theme must define these and all the colour
slots, in both scopes; `theme-compile` fails a theme that omits one.

## Extended contract

The extended contract standardizes everything else a component may reference:
spacing, motion durations, a fully rounded radius, a display face, elevation, a
modal scrim, container breakpoints, a type scale and font weights. No hardcoded
spacing, durations, radii, shadows, widths, font sizes, or font weights in
components — reference the slot.

Extended slots are **optional in a theme**: `@moderno-ui/css` ships a neutral
default for each, and a theme overrides only what its brand actually changes.

Rules the extended slots carry:

- **Display face.** Headings and pull quotes use `--font-serif` when the brand
  has one. Body copy stays on `--font-sans`.
- **Elevation** is for overlays only (popover, menu, drawer, toast), one step
  per layer of float. A theme may compose a hairline ring with the shadow so an
  overlay still separates from a near-black canvas; `theme-moderno` does. The
  `.dark` scope carries its own shadows — a light-mode shadow disappears on a
  dark surface.
- **Modal scrim.** `--overlay` is the wash behind a dialog or command palette,
  painted over a `backdrop-filter: blur()` of the page. It is a colour slot, but
  an extended one: the neutral default is a translucent black, denser in
  `.dark`, never a mix of `--foreground`, which is near-white in dark mode and
  would turn the scrim milky grey. Tailwind: `bg-overlay`.
- **Container breakpoints.** Blocks and screens respond to the width of their
  _container_, never the viewport (ADR-0005). The contract's three steps are the
  whole scale a block may use: in Tailwind they replace the container namespace
  rather than extend it (see [Theming rules](#theming-rules)).
- **Type scale.** Each step is a size and a line height, `--text-<step>` and
  `--leading-<step>`. The `ui-*` steps are the control ramp, and a component's
  `sm`/`md`/`lg` sizes read `ui-sm`/`ui-md`/`ui-lg`; the other steps set
  content. The step names stay clear of Tailwind's own `text-*` keys, so the
  tokens never resize a stock `text-sm`.
- **Font weights**, unlike the size steps, _are_ Tailwind's own keys at
  Tailwind's own values: the tokens' unlayered `:root` beats Tailwind's
  defaults, so a stock `font-medium` follows a theme that overrides a weight
  and changes nothing when none does.

## Responsive policy

Adapted from
[ADR-0005](docs/adr/0005-responsive-container-queries-and-registry-tiers.md).

**Blocks and screens respond to their container; primitives may respond to the
viewport, but only by exception.** A block does not own the viewport and cannot
know where it is mounted — the same pricing section may land in a sidebar, a
modal or a full page — so it reads the width of its container instead:

```jsx
<section className="@container">
  <ul className="mt-6 grid gap-4 @md:grid-cols-3">…</ul>
</section>
```

- **The vocabulary is three steps.** `@sm:` / `@md:` / `@lg:`, bound to
  `--container-sm|md|lg`, generated by `@moderno-ui/css/preset` (see the Tailwind
  bullet under [Theming rules](#theming-rules) for why they replace Tailwind's
  container scale rather than extend it). There is no `@xl:` here.
- **Viewport `@media` is opt-in per primitive.** It is reserved for a primitive
  that genuinely changes _shape_ on a small screen — a `Dialog` presented as a
  bottom `Drawer`, a `Menu` as a bottom sheet — and there is no separate
  "mobile" component family. `components.css` carries an allow-list of the
  `data-scope`s entitled to one; it starts **empty**, and a primitive is added to
  it in the same change that adds its rule. Queries about the _user_
  (`prefers-reduced-motion`, `prefers-color-scheme`) are not viewport queries and
  are always allowed.
- **Intrinsic layout is not a breakpoint.** `auto-fit` grids are welcome and
  often enough on their own, but reflowing is not the same as changing shape;
  reach for a container query only when the layout must change.
- **Blocks style with the preset.** Utilities resolve to contract slots
  (`bg-card`, `rounded-lg`, `shadow-sm`, `max-w-md`), so a theme re-skins a block
  with no rebuild. A literal has no way in: `moderno-lint` runs over every source
  file the registry ships and rejects both a hardcoded colour and a length
  smuggled into an arbitrary value (a literal length inside `w-[…]`).

## Theming rules

- **Dark mode** follows shadcn: `:root` = light, `.dark` = dark. Apps that are
  dark by default mount `<html class="dark">`.
- **A theme** is a CSS file of variable assignments. It may use brand primitives
  (`--mod-…`) internally and alias them to the contract:
  `--background: var(--mod-surface-base)`.
- **Multi-brand** scopes overrides under `[data-brand="…"]`, composable with
  `.dark`. Switching `[data-brand]` re-maps variables without touching the base
  tokens. The neutral defaults ship no brand scope: `theme-contrast` in the
  registry is the example.
- **Tailwind v4**: import `@moderno-ui/css/preset`. It maps each slot to a theme
  namespace with `@theme inline`, so utilities reference `var(--slot)` directly
  and runtime overrides re-theme without a rebuild — `bg-primary`, `font-serif`,
  `shadow-md`, `rounded-lg`. The one exception is `--container-*`, in two ways:
  - It is not `inline`. A CSS container query condition cannot contain `var()`,
    so the three lengths are registered literally; `@sm:`/`@md:`/`@lg:` fire at
    fixed widths, while `max-w-sm` and friends still read `var(--container-sm)`
    and follow a theme override at runtime.
  - **It replaces Tailwind's container scale, it does not extend it.**
    `--container-*` is Tailwind's own namespace, and the contract's three steps
    are not its sizes, so the preset resets the namespace
    (`--container-*: initial`) before declaring them. Installing Moderno
    therefore leaves `max-w-sm|md|lg`, `w-sm|md|lg` and `@sm:`/`@md:`/`@lg:` and
    **removes** `max-w-xl`, `@2xl:` and the rest of Tailwind's container sizes;
    blocks use the three contract steps only. Without the reset the scale would
    be out of order — the contract's `max-w-lg` wider than Tailwind's
    `max-w-xl`. Note that `@moderno-ui/css` on its own already retunes `md`/`lg`
    (its `:root` is unlayered and beats `@layer theme`), so import the preset
    alongside it to get the ordered three-step scale.

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

**`@moderno-ui/css`** is the one package for the contract and its styles
([ADR-0008](docs/adr/0008-token-system-one-source-per-concept.md)). Consumers
import only this:

- `@import "@moderno-ui/css";` → the variables (`:root` / `.dark`, neutral
  defaults) and the component stylesheet from `@moderno-ui/core`.
- `@import "@moderno-ui/css/preset";` → the Tailwind v4 `@theme inline`
  mapping.
- `@moderno-ui/css/contract` → the contract as data (slot name, DTCG type,
  editor group, WCAG contrast pair, role). Every other slot list —
  theme-compile's required slots, each theme's `DESIGN.md`, the agent manifest,
  the Theme Builder's editor groups, the docs model — derives from it.
- `@moderno-ui/css/moderno.agent.json` → the contract manifest that
  `@moderno-ui/mcp`'s `get_contract` answers from.
- `@moderno-ui/css/tokens.css` → the variables alone, without the component
  stylesheet. For tooling (the docs' Theme Builder reads it as text); an app
  imports `@moderno-ui/css`.

Internal paths (`dist/`, `src/`) are never exposed to consumers.
`@moderno-ui/core` does not depend on `@moderno-ui/css`.

## Guardrails

- **Do** reference contract slots; **don't** hardcode hex, px spacing, or ms.
- **Do** put brand values in a theme; **don't** add brand identity to
  `@moderno-ui/css`.
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
