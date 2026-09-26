---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Accordion** in all four framework packages, over Ark's Accordion
(`Root > Item > ItemTrigger (> ItemIndicator) + ItemContent`). An accordion is
a stack of sections that open and close under their own headers; one item is
open at a time unless `multiple`, and `collapsible` lets the open one close.
The content's height animates open and closed. The root takes `variant`
(`line`, `enclosed`) and `size` (`sm`, `md`, `lg`); every item follows it.
Every other part and prop is Ark's.

`@moderno-ui/core` gains `accordionRecipe`.
