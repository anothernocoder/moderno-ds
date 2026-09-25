---
"@moderno-ui/core": patch
---

Button no longer inherits two browser defaults. The root clears the UA `buttonface`
fill, so `variant="ghost"` is transparent without a consumer preflight, and a
native `disabled` button now gets the same dimmed, non-interactive look as
`[data-disabled]` (previously it looked enabled).
