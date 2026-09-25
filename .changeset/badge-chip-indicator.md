---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
"@moderno-ui/lint-core": patch
---

Add three CSS-only primitives in all four framework packages:

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
