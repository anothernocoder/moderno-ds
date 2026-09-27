---
"@moderno-ui/core": patch
---

Stop the Chip label from clipping glyph descenders ("g", "p", "y"). The label
takes its size's leading (`--leading-ui-sm`, `--leading-ui-xs` for `sm`)
instead of the root's `line-height: 1`, so the box that truncates a long label
fits the font's ascent and descent. Chip heights are unchanged.
