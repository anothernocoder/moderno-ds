---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **RadioGroup** in all four framework packages, over Ark's RadioGroup:
`Root > Label + Item (> ItemControl + ItemText + ItemHiddenInput)` plus Ark's
`Indicator`. The user picks exactly one option from a short list, laid out in a
column or a row (Ark's `orientation`). `RadioGroup.Root` takes `size` (`sm`,
`md`, `lg`), and Moderno adds `RadioGroup.ItemDescription`, a hint that goes
inside `ItemText` so screen readers read it with the label. Every other part is
Ark's. It replaces the predecessor's Radio.

`@moderno-ui/core` gains `radioGroupRecipe`.
