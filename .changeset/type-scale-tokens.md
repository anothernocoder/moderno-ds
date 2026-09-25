---
"@moderno-ui/css": minor
"@moderno-ui/core": patch
"@moderno-ui/mcp": patch
---

Add a type scale to the token contract: a size and a line height per step
(`--text-<step>` / `--leading-<step>`) for `ui-xs|sm|md|lg` (12/13/14/15px) and
`body`, `body-lg`, `heading-sm`, `heading`, `heading-lg` (16/18/20/24/36px).
They are extended slots with neutral defaults in `@moderno-ui/css`, and the
Tailwind preset maps them to `text-ui-sm`, `text-body`… (size and line height
in one class) and `leading-*`. The step names avoid Tailwind's own text keys,
so a stock `text-sm` keeps its size. Component styles in `@moderno-ui/core` now
read these slots instead of literal sizes, with no visual change.
`get_contract` reports them as the `type` slot family.
