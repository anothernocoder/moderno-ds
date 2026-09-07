---
"@moderno-ui/tokens": minor
"@moderno-ui/mcp": patch
---

Extend the token contract with a display face (`--font-serif`), a three-step
elevation scale (`--shadow-sm|md|lg`) and container breakpoints
(`--container-sm|md|lg`). Neutral defaults ship in `@moderno-ui/tokens` — the
elevation scale carries its own `.dark` values — and the Tailwind preset maps
them to `font-serif`, `shadow-*`, `max-w-*`/`w-*` and the `@sm:`/`@md:`/`@lg:`
container-query variants. The new slots are extended slots: a theme overrides
them only if its brand changes them. `get_contract` now reports the `shadow` and
`container` slot families.
