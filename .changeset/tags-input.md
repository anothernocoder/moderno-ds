---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **TagsInput** in all four framework packages, over Ark's TagsInput. A text
box that turns what the user types into tags they can edit and remove
(`Root > Label + Control > Item* + Input`, each
`Item > ItemPreview > ItemText + ItemDeleteTrigger` plus `ItemInput`, with an
optional `ClearTrigger` and a `HiddenInput` for forms). The root takes `size`
(`sm`, `md`, `lg`); every other part and prop is Ark's, including `max`,
`delimiter`, `editable` and `validate`. The control draws its focus ring inside
its border, like Field, Select, Pin Input and Number Input.

`@moderno-ui/core` gains `tagsInputRecipe`.
