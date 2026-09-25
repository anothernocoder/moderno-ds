---
"@moderno-ui/css": minor
"@moderno-ui/core": patch
"@moderno-ui/mcp": patch
---

Add font weights to the token contract: `--font-weight-normal` (400),
`--font-weight-medium` (500), `--font-weight-semibold` (600) and
`--font-weight-bold` (700), extended slots with the DTCG `$type` `fontWeight`.
They reuse Tailwind v4's own `--font-weight-*` keys at Tailwind's own values, so
stock `font-medium` / `font-semibold` utilities follow a theme that overrides a
weight, with or without the preset and with no change when none does. Component
styles in `@moderno-ui/core` now read these slots instead of literal weights,
with no visual change. `get_contract` reports them in the `type` slot family.
