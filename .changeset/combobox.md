---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Combobox** in all four framework packages, over Ark's Combobox. A text
input that filters a list of options as the user types
(`Root > Label + Control > Input + Trigger + ClearTrigger`, and
`Positioner > Content > Item > ItemText + ItemIndicator`, with optional
`ItemGroup`, `ItemGroupLabel`, `List` and an `Empty` state). The root takes
`size` (`sm`, `md`, `lg`); every other part and prop is Ark's, including
`multiple`. Each package also re-exports Ark's `useListCollection` and
`useFilter`, the two helpers that narrow the list. The control draws its focus
ring inside its border, like Field, Select, Pin Input, Number Input and Tags
Input.

`@moderno-ui/core` gains `comboboxRecipe`.
