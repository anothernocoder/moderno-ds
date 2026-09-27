---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Carousel** in all four framework packages, over Ark's Carousel. Slides
that scroll one page at a time, with previous and next and one dot per page
(`Root > ItemGroup > Item…` and `Control > PrevTrigger + IndicatorGroup >
Indicator… + NextTrigger`, with `AutoplayTrigger`, `AutoplayIndicator` and
`ProgressText` where they fit). The root takes `size` (`sm`, `md`, `lg`); every
other part and prop is Ark's, including `slideCount`, `slidesPerPage`,
`spacing`, `page`, `loop` and `autoplay`. When the reader prefers reduced
motion, autoplay does not start (the autoplay trigger still starts it) and the
controls do not animate.

`@moderno-ui/core` gains `carouselRecipe`, `carouselMotion` and
`REDUCED_MOTION_QUERY`.
