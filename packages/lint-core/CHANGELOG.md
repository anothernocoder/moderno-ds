# @moderno-ui/lint-core

## 0.4.1

### Patch Changes

- c7d3d87: Add three CSS-only primitives in all four framework packages:

  - **Badge** — a short status label (`neutral`, `solid`, `outline`, and the
    `info`/`success`/`warning`/`error` statuses) at two sizes, with an optional
    leading `dot`.
  - **Chip** — a compact token (`outline`, `muted`, `solid`) whose `removable`
    flag adds a named remove button reporting through `onRemove` (Vue: `@remove`).
  - **Indicator** — a status dot with an optional label and a `pulse` ring that
    stops under `prefers-reduced-motion`. A bare dot named by `aria-label` gets
    `role="img"`, so screen readers read its status.

  `@moderno-ui/core` gains `badgeRecipe`, `chipRecipe`, `indicatorRecipe`,
  `indicatorAttrs` and `indicatorRole`. `moderno/valid-props` no longer folds a Vue `aria-*`/`data-*`
  attribute to camelCase and reports it as an unknown prop.

## 0.4.0

### Minor Changes

- 45d95a0: Close the block styling pipeline over the registry.

  `moderno-lint` gains `--registry <registry.json>`: it lints every source file a
  registry manifest ships, resolving paths against the manifest's own directory
  and reading each file's framework from its item layout
  (`blocks/pricing/solid/pricing.tsx` is Solid, not React — the only signal that
  separates the two, since both author in `.tsx`). Theme items are skipped: a
  theme's job is to carry literal brand values, and `theme-compile` already
  validates those.

  `moderno/no-hardcoded-dimension` now also flags a raw length smuggled into a
  Tailwind arbitrary value — `w-[320px]`, `max-w-[42rem]`, `-mt-[3px]` — across the
  size, spacing, radius and type families, through variant prefixes. Arbitrary
  values that are not lengths (`grid-cols-[repeat(auto-fit,minmax(0,1fr))]`,
  `bg-[url(…)]`) are untouched: they are the documented escape hatch for things the
  contract does not name.

- 96d1df9: `moderno/no-hardcoded-dimension` now flags type sizes that bypass the contract:
  Tailwind's stock `text-xs` … `text-9xl` (with the matching contract step as the
  suggested fix, e.g. `text-sm` → `text-ui-md`) and literal `font-size` values in
  CSS. Registry blocks and screens now use the contract type steps.

### Patch Changes

- a15305e: Every slot in `@moderno-ui/css/contract` now carries a one-line `role`, and the
  contract exports `GROUP_ROLES` (what each group holds) and `TYPE_STEP_ROLES`
  (what each type step sets). The contract manifest (`moderno.agent.json`, and so
  `get_contract`) gains a `roles` map from each slot to its role.
- 134e968: Find installed manifests under `node_modules/@moderno-ui`. Discovery looked in
  `node_modules/@moderno`, a directory no real install has since the packages
  moved to the `@moderno-ui` scope, so `@moderno-ui/mcp` and `@moderno-ui/lint`
  found no `moderno.agent.json` in a consumer project.
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

- 0ed984d: Card — a CSS-only surface primitive with an Ark-style anatomy (`root`, `header`,
  `title`, `description`, `content`, `footer`) in all four framework packages,
  styled from `[data-scope="card"]` in the shared `components.css`.
  `cardRecipe` (`variant` × `size`) resolves props to `data-*`; the surface paints
  from `--card`/`--border` with no shadow, and its corner follows `--radius`
  (which `theme-moderno` pins to 0).

  `@moderno-ui/lint-core` now recognises a compound primitive's `<Name.Root …>`
  invocation as a usage of `Name`, so `valid-props` checks Card's and Select's
  root props instead of skipping them.
