---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **ColorPicker** in all four framework packages, over Ark's ColorPicker: a
trigger showing the colour and its hex, and a popover with a saturation and
brightness area, a hue slider, an optional alpha slider (`alpha`), a hex box,
an eyedropper where the browser has one, and optional preset `swatches`. The
value in and out is a hex string (`#RRGGBB`, or `#RRGGBBAA` with `alpha` while
see-through): `value` / `defaultValue` / `onValueChange` (`v-model` in Vue,
`bind:value` in Svelte). Inside a `Field`, the Field's label names the trigger
and its helper and error text describe it. `size` (`sm`, `md`, `lg`) sizes the
trigger; `name` submits the hex with a form; `translations` renames the parts.

`@moderno-ui/core` gains `colorPickerRecipe`, `parseHexColor`,
`colorPickerSwatches`, `supportsEyeDropper`, the English
`COLOR_PICKER_TRANSLATIONS`, and the `color-picker` scope in
`components.css`: the trigger rings inside its border, the popover is the
`--popover` surface with its 1px `--border` edge and the `--shadow-md` drop,
and a see-through colour sits on a checkerboard of `--muted` and
`--background`.
