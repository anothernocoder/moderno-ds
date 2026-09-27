---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Popover** in all four framework packages, over Ark's Popover: a
non-modal surface anchored to its trigger, with an optional arrow, title,
description and close button
(`Root > Trigger + Positioner > Content > Arrow > ArrowTip, Title, Description, CloseTrigger`).
The root takes `size` (`sm`, `md`, `lg`); Ark's root renders no element, so the
size reaches the content, which carries `data-size`. Every other part and prop
is Ark's, including `open`, `positioning` and `modal`.

`@moderno-ui/core` gains `popoverRecipe` and the `popover` scope in
`components.css`: the `--popover` surface with its 1px `--border` edge and the
`--shadow-md` drop, an arrow filled and edged to match, and a corner close
button.
