---
"@moderno-ui/css": minor
---

The neutral defaults are authored as DTCG, like every theme (ADR-0008).
`packages/css/src/tokens.dtcg.json` is the one hand-edited source of every
default, with the reasons for a value kept as `$description`, and
`@moderno-ui/css/tokens.css` is generated from it by `theme-compile`. Every
slot resolves to the same value as before in `:root` and in `.dark`; `.dark`
now also declares `--radius`, `--font-sans` and `--font-mono`, at their `:root`
values, because the compiler requires them in both scopes as it does for a
theme.

New export: `@moderno-ui/css/tokens.dtcg.json`, the neutral defaults as DTCG,
for tooling that needs the values a theme inherits.
