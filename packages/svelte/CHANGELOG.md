# @moderno-ui/svelte

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

- Updated dependencies [1e64683]
- Updated dependencies [eef00c8]
- Updated dependencies [efc795c]
- Updated dependencies [2100633]
- Updated dependencies [0ed984d]
  - @moderno-ui/core@0.4.0
  - @moderno-ui/css@0.3.1
