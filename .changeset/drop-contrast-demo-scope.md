---
"@moderno-ui/tokens": minor
"@moderno-ui/css": patch
---

The neutral token stylesheet no longer ships the `[data-brand="contrast"]` demo
scope: it defines `:root` and `.dark` only. A brand is a registry theme; install
`theme-contrast` (`moderno add theme-contrast`) for the maximum-contrast brand
the demo used to approximate.
