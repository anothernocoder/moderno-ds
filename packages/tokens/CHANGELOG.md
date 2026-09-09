# @moderno-ui/tokens

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

- e05ddbc: Extend the token contract with a display face (`--font-serif`), a three-step
  elevation scale (`--shadow-sm|md|lg`) and container breakpoints
  (`--container-sm|md|lg`). Neutral defaults ship in `@moderno-ui/tokens` — the
  elevation scale carries its own `.dark` values — and the Tailwind preset maps
  them to `font-serif`, `shadow-*`, `max-w-*`/`w-*` and the `@sm:`/`@md:`/`@lg:`
  container-query variants. The new slots are extended slots: a theme overrides
  them only if its brand changes them. `get_contract` now reports the `shadow` and
  `container` slot families.

  Note for Tailwind consumers: `--container-*` is Tailwind's own namespace and the
  contract's three steps are not its values, so the preset **replaces** that scale
  (`--container-*: initial`) instead of overriding three keys inside it — keeping
  both would leave `max-w-lg` (48rem) wider than `max-w-xl` (36rem). After this
  release the preset generates `max-w-sm|md|lg`, `w-sm|md|lg` and `@sm:`/`@md:`/
  `@lg:` only; Tailwind's wider container sizes (`max-w-xl` and up, `@xl:` and up)
  are no longer generated. Re-declare them in an app-level `@theme` block if you
  need them.
