---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Toggle** and **ToggleGroup** in all four framework packages, over Ark's
Toggle (`Root > Indicator`) and ToggleGroup (`Root > Item`). A Toggle is a
button that stays pressed until it is pressed again; a ToggleGroup is a row of
them where one item (or, with `multiple`, several) stays pressed. Both roots
take `variant` (`ghost`, `outline`) and `size` (`sm`, `md`, `lg`); a group's
items follow its root. Every other part and prop is Ark's.

`@moderno-ui/core` gains `toggleRecipe` and `toggleGroupRecipe`.
