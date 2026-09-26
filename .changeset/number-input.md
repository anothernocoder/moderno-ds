---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **NumberInput** in all four framework packages, over Ark's NumberInput. A
text box for a number with buttons that step it up and down
(`Root > Label + Control > Input + DecrementTrigger + IncrementTrigger`, with an
optional `Scrubber` and `ValueText`). The root takes `size` (`sm`, `md`, `lg`);
every other part and prop is Ark's, including `min`, `max`, `step` and
`formatOptions`. The control draws its focus ring inside its border, like Field,
Select and Pin Input.

`@moderno-ui/core` gains `numberInputRecipe`.
