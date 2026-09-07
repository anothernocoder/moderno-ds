---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/solid": minor
"@moderno-ui/svelte": minor
"@moderno-ui/vue": minor
---

Add the Divider primitive: a CSS-only horizontal or vertical rule with an optional label, in all four framework bindings. `dividerRecipe` (`orientation` × `align`) resolves to `data-*` on `[data-scope="divider"][data-part="root"]`; the stroke is drawn by `components.css` from the `--border` slot via the root's `::before`/`::after`, so a bare divider is one continuous line and a captioned one splits around `[data-part="label"]`.
