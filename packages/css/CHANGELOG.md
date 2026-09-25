# @moderno-ui/css

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

- a15305e: Every slot in `@moderno-ui/css/contract` now carries a one-line `role`, and the
  contract exports `GROUP_ROLES` (what each group holds) and `TYPE_STEP_ROLES`
  (what each type step sets). The contract manifest (`moderno.agent.json`, and so
  `get_contract`) gains a `roles` map from each slot to its role.
- d64e468: The neutral token stylesheet no longer ships the `[data-brand="contrast"]` demo
  scope: it defines `:root` and `.dark` only. A brand is a registry theme; install
  `theme-contrast` (`moderno add theme-contrast`) for the maximum-contrast brand
  the demo used to approximate.
- e05ddbc: Extend the token contract with a display face (`--font-serif`), a three-step
  elevation scale (`--shadow-sm|md|lg`) and container breakpoints
  (`--container-sm|md|lg`). Neutral defaults ship in `@moderno-ui/css` — the
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

- 36a7aa6: Add font weights to the token contract: `--font-weight-normal` (400),
  `--font-weight-medium` (500), `--font-weight-semibold` (600) and
  `--font-weight-bold` (700), extended slots with the DTCG `$type` `fontWeight`.
  They reuse Tailwind v4's own `--font-weight-*` keys at Tailwind's own values, so
  stock `font-medium` / `font-semibold` utilities follow a theme that overrides a
  weight, with or without the preset and with no change when none does. Component
  styles in `@moderno-ui/core` now read these slots instead of literal weights,
  with no visual change. `get_contract` reports them in the `type` slot family.
- 6078bd9: `@moderno-ui/tokens` merges into `@moderno-ui/css` (ADR-0008). One package now
  ships everything the two did:

  - `@moderno-ui/css` — the token variables with their neutral defaults (`:root`
    / `.dark`) and the component stylesheet, as before.
  - `@moderno-ui/css/preset` — the Tailwind v4 preset, now defined here instead of
    re-exported.
  - `@moderno-ui/css/contract` — the token contract as data (was
    `@moderno-ui/tokens/contract`).
  - `@moderno-ui/css/moderno.agent.json` — the contract manifest `get_contract`
    answers from (was `@moderno-ui/tokens`'s). Its `package` field is now
    `@moderno-ui/css`.
  - `@moderno-ui/css/tokens.css` — the variables alone, without the component
    stylesheet, for tooling that reads them as text.

  `@moderno-ui/css` no longer depends on `@moderno-ui/tokens`, and
  `@moderno-ui/tokens` gets no further releases: it will be deprecated on npm in
  favour of `@moderno-ui/css`. If you imported `@moderno-ui/tokens/css`, its exact
  equivalent is `@moderno-ui/css/tokens.css` (the variables alone); an app that
  also wants the component stylesheet imports `@moderno-ui/css`. Replace
  `@moderno-ui/tokens/preset` and `@moderno-ui/tokens/contract` with the
  `@moderno-ui/css` subpaths above.

  The contract manifest's `package` is `@moderno-ui/css` in `@moderno-ui/lint-core`'s
  `ContractManifest` type too, `get_contract`'s not-installed error names
  `@moderno-ui/css`, and the `AGENTS.md` stanza `moderno init` writes says to keep
  brand values out of `@moderno-ui/css`.

- e01612e: The neutral defaults are authored as DTCG, like every theme (ADR-0008).
  `packages/css/src/tokens.dtcg.json` is the one hand-edited source of every
  default, with the reasons for a value kept as `$description`, and
  `@moderno-ui/css/tokens.css` is generated from it by `theme-compile`. Every
  slot resolves to the same value as before in `:root` and in `.dark`; `.dark`
  now also declares `--radius`, `--font-sans` and `--font-mono`, at their `:root`
  values, because the compiler requires them in both scopes as it does for a
  theme.

  New export: `@moderno-ui/css/tokens.dtcg.json`, the neutral defaults as DTCG,
  for tooling that needs the values a theme inherits.

- f021f0d: Add a type scale to the token contract: a size and a line height per step
  (`--text-<step>` / `--leading-<step>`) for `ui-xs|sm|md|lg` (12/13/14/15px) and
  `body`, `body-lg`, `heading-sm`, `heading`, `heading-lg` (16/18/20/24/36px).
  They are extended slots with neutral defaults in `@moderno-ui/css`, and the
  Tailwind preset maps them to `text-ui-sm`, `text-body`… (size and line height
  in one class) and `leading-*`. The step names avoid Tailwind's own text keys,
  so a stock `text-sm` keeps its size. Component styles in `@moderno-ui/core` now
  read these slots instead of literal sizes, with no visual change.
  `get_contract` reports them as the `type` slot family.

### Patch Changes

- 8934849: The neutral defaults now clear WCAG AA on every contract pair:
  `--destructive-foreground` in `.dark` is ink instead of white on the light
  dark-mode red (2.77:1 → 6.84:1), and `--muted-foreground` darkens to
  `oklch(0.505 0 0)` (4.34:1 → AA on `--muted`).
- Updated dependencies [1e64683]
- Updated dependencies [3be5002]
- Updated dependencies [eef00c8]
- Updated dependencies [36a7aa6]
- Updated dependencies [efc795c]
- Updated dependencies [2100633]
- Updated dependencies [0ed984d]
- Updated dependencies [f021f0d]
  - @moderno-ui/core@0.4.0
