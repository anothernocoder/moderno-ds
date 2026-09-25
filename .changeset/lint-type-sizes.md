---
"@moderno-ui/lint-core": minor
"@moderno-ui/lint": minor
"@moderno-ui/mcp": patch
---

`moderno/no-hardcoded-dimension` now flags type sizes that bypass the contract:
Tailwind's stock `text-xs` … `text-9xl` (with the matching contract step as the
suggested fix, e.g. `text-sm` → `text-ui-md`) and literal `font-size` values in
CSS. Registry blocks and screens now use the contract type steps.
