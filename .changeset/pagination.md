---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Pagination** in all four framework packages, over Ark's Pagination. A row
of page buttons with previous and next that skips far pages behind an ellipsis
(`Root > FirstTrigger? + PrevTrigger + Item… / Ellipsis… + NextTrigger +
LastTrigger?`, with the page list from `Context`). The root takes `size` (`sm`,
`md`, `lg`); every other part and prop is Ark's, including `count`, `pageSize`,
`page` and `siblingCount`. The current page is outlined, and every button draws
its focus ring inside its edge.

`@moderno-ui/core` gains `paginationRecipe`.
