---
"@moderno-ui/css": patch
---

The neutral defaults now clear WCAG AA on every contract pair:
`--destructive-foreground` in `.dark` is ink instead of white on the light
dark-mode red (2.77:1 → 6.84:1), and `--muted-foreground` darkens to
`oklch(0.505 0 0)` (4.34:1 → AA on `--muted`).
