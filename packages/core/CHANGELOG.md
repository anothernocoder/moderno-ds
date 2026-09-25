# @moderno-ui/core

## 0.4.0

### Minor Changes

- 1e64683: Add the Alert primitive: a CSS-only, inline status message with an
  `root > icon + content(> title + description + action)` anatomy, in
  `info`/`success`/`warning`/`error` at two densities, in all four framework
  packages.

  The token contract grows three status slot pairs — `--info`, `--success`,
  `--warning` and their foregrounds — so a status surface can be painted from the
  contract instead of literals; `error` reuses `--destructive`. Themes now define
  all four statuses in both scopes.

- eef00c8: Field gains a `size` recipe (`sm` | `md` | `lg`, default `md`) on `Field.Root`, plus
  Input/Textarea craft in the shared stylesheet.

  `fieldRecipe` in `@moderno-ui/core` resolves the prop to a single `data-size` on the
  root part, and `components.css` sizes every part from it: label, control height and
  padding, and helper/error text. `Field.Root` is now a thin wrapper in all four
  bindings (every other part stays Ark's verbatim). The controls also gain a hover
  border, a transition, a `--destructive`-tinted invalid state that keeps its colour
  while focused, a `--muted` disabled fill, and a per-size minimum height with
  vertical-only resize on the textarea.

- efc795c: Add the Divider primitive: a CSS-only horizontal or vertical rule with an optional label, in all four framework bindings. `dividerRecipe` (`orientation` × `align`) resolves to `data-*` on `[data-scope="divider"][data-part="root"]`; the stroke is drawn by `components.css` from the `--border` slot via the root's `::before`/`::after`, so a bare divider is one continuous line and a captioned one splits around `[data-part="label"]`.
- 2100633: Add the PinInput primitive: a one-time-code input over Ark's PinInput machine —
  focus advances as characters land, a pasted code is distributed across the
  cells, `mask` swaps them to `type="password"`, `otp` asks for
  `autocomplete="one-time-code"`, and `invalid` mirrors onto `aria-invalid` — in
  all four framework packages.

  Anatomy `root > label + control(> input × n) + hiddenInput` under
  `data-scope="pin-input"`, with the new `pinInputRecipe`'s `data-size`
  (`sm`/`md`/`lg`) on the root; the filled, complete and invalid states are Ark's
  own `data-*`, styled in the shared `components.css`.

- 0ed984d: Card — a CSS-only surface primitive with an Ark-style anatomy (`root`, `header`,
  `title`, `description`, `content`, `footer`) in all four framework packages,
  styled from `[data-scope="card"]` in the shared `components.css`.
  `cardRecipe` (`variant` × `size`) resolves props to `data-*`; the surface paints
  from `--card`/`--border` with no shadow, and its corner follows `--radius`
  (which `theme-moderno` pins to 0).

  `@moderno-ui/lint-core` now recognises a compound primitive's `<Name.Root …>`
  invocation as a usage of `Name`, so `valid-props` checks Card's and Select's
  root props instead of skipping them.

### Patch Changes

- 3be5002: Button no longer inherits two browser defaults. The root clears the UA `buttonface`
  fill, so `variant="ghost"` is transparent without a consumer preflight, and a
  native `disabled` button now gets the same dimmed, non-interactive look as
  `[data-disabled]` (previously it looked enabled).
- 36a7aa6: Add font weights to the token contract: `--font-weight-normal` (400),
  `--font-weight-medium` (500), `--font-weight-semibold` (600) and
  `--font-weight-bold` (700), extended slots with the DTCG `$type` `fontWeight`.
  They reuse Tailwind v4's own `--font-weight-*` keys at Tailwind's own values, so
  stock `font-medium` / `font-semibold` utilities follow a theme that overrides a
  weight, with or without the preset and with no change when none does. Component
  styles in `@moderno-ui/core` now read these slots instead of literal weights,
  with no visual change. `get_contract` reports them in the `type` slot family.
- f021f0d: Add a type scale to the token contract: a size and a line height per step
  (`--text-<step>` / `--leading-<step>`) for `ui-xs|sm|md|lg` (12/13/14/15px) and
  `body`, `body-lg`, `heading-sm`, `heading`, `heading-lg` (16/18/20/24/36px).
  They are extended slots with neutral defaults in `@moderno-ui/css`, and the
  Tailwind preset maps them to `text-ui-sm`, `text-body`… (size and line height
  in one class) and `leading-*`. The step names avoid Tailwind's own text keys,
  so a stock `text-sm` keeps its size. Component styles in `@moderno-ui/core` now
  read these slots instead of literal sizes, with no visual change.
  `get_contract` reports them as the `type` slot family.
