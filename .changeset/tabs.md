---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Tabs** in all four framework packages, over Ark's Tabs
(`Root > List > Trigger + Indicator`, then one `Content` per tab). Tabs switch
between panels of content in the same place; they lay out in a row or, with
`orientation="vertical"`, a column. The root takes `variant` (`line`,
`enclosed`) and `size` (`sm`, `md`, `lg`); the list, triggers and indicator
follow it. Every other part and prop is Ark's.

`@moderno-ui/core` gains `tabsRecipe`.
