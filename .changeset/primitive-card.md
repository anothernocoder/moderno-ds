---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
"@moderno-ui/lint-core": patch
---

Card — a CSS-only surface primitive with an Ark-style anatomy (`root`, `header`,
`title`, `description`, `content`, `footer`) in all four framework packages,
styled from `[data-scope="card"]` in the shared `components.css`.
`cardRecipe` (`variant` × `size`) resolves props to `data-*`; the surface paints
from `--card`/`--border` with no shadow, and its corner follows `--radius`
(which `theme-moderno` pins to 0).

`@moderno-ui/lint-core` now recognises a compound primitive's `<Name.Root …>`
invocation as a usage of `Name`, so `valid-props` checks Card's and Select's
root props instead of skipping them.
