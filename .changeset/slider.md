---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Slider** in all four framework packages, over Ark's Slider. One thumb
picks a number; two pick a range
(`Root > Label + ValueText + Control > (Track > Range) + Thumb`, with marks in
`MarkerGroup > Marker` and an optional `DraggingIndicator` bubble in a thumb).
The root takes `size` (`sm`, `md`, `lg`); every other part and prop is Ark's,
including `min`, `max`, `step` and `orientation`.

`@moderno-ui/core` gains `sliderRecipe`.
