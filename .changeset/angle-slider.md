---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **AngleSlider** in all four framework packages, over Ark's Angle Slider: a
round dial to pick an angle from 0° to 359° (0° up, clockwise), with a number
field beside it, for a gradient's direction or a rotation
(`Root > Label + Control > Thumb + MarkerGroup > Marker`, then `Input` and
`HiddenInput`). The root takes `size` (`sm`, `md`, `lg`, matched to the Field
sizes), `step`, snap `marks` (Shift while dragging snaps to them) and
`getAriaValueText` (the thumb says "45 degrees" by default). A drag past 360°
carries on from 0°; Page Up / Page Down turn the dial 15°. Moderno adds
`AngleSlider.Input`, an Ark NumberInput with a `°` suffix kept in step with the
dial both ways.

`@moderno-ui/core` gains `angleSliderRecipe` and the angle helpers the bindings
share (`wrapAngle`, `snapAngleToStep`, `snapAngleToMarks`, `resolveAngle`,
`angleSliderPageValue`, …).
