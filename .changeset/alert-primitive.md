---
"@moderno-ui/tokens": minor
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add the Alert primitive: a CSS-only, inline status message with an
`root > icon + content(> title + description + action)` anatomy, in
`info`/`success`/`warning`/`error` at two densities, in all four framework
packages.

The token contract grows three status slot pairs — `--info`, `--success`,
`--warning` and their foregrounds — so a status surface can be painted from the
contract instead of literals; `error` reuses `--destructive`. Themes now define
all four statuses in both scopes.
