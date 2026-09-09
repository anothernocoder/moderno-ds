# @moderno-ui/lint-core

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

### Patch Changes

- 0ed984d: Card — a CSS-only surface primitive with an Ark-style anatomy (`root`, `header`,
  `title`, `description`, `content`, `footer`) in all four framework packages,
  styled from `[data-scope="card"]` in the shared `components.css`.
  `cardRecipe` (`variant` × `size`) resolves props to `data-*`; the surface paints
  from `--card`/`--border` with no shadow, and its corner follows `--radius`
  (which `theme-moderno` pins to 0).

  `@moderno-ui/lint-core` now recognises a compound primitive's `<Name.Root …>`
  invocation as a usage of `Name`, so `valid-props` checks Card's and Select's
  root props instead of skipping them.
