---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Switch** in all four framework packages, over Ark's Switch: `Root > Control
(> Thumb) + Label + HiddenInput`. It turns one setting on or off, and the change
applies at once. `Switch.Root` takes `size` (`sm`, `md`, `lg`);
`Switch.HiddenInput` gets `role="switch"` so screen readers announce a switch,
not a checkbox. Every other part is Ark's. It replaces the predecessor's Toggle.

`@moderno-ui/core` gains `switchRecipe`.
