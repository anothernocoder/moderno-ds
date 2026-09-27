---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add a **tile** variant to RadioGroup, for picking by picture (an image picker).
`RadioGroup.Root` takes `variant` (`list` by default, or `tile`); a tile group
lays its items out as selectable cards in a grid that follows the group's own
width. Unset, each row holds as many cards as fit; `columns` (1 to 6) fixes the
count, and `aspectRatio` (`16:9` by default) sets the shape of every picture.
Moderno adds `RadioGroup.ItemMedia`, the slot for a card's image or other
content. The checked card shows a doubled `--primary` edge and a check badge,
and every radio key and name works as before. `list` groups are unchanged.

`@moderno-ui/core` gains `radioGroupAttrs` and `radioGroupColumns`, and
`radioGroupRecipe` gains the `variant` and `aspectRatio` variants.
