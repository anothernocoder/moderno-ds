---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **VectorPad** in all four framework packages: a square pad with a handle
you drag to set two values at once (x and y: a position, an offset, a light
direction), with a number field per axis
(`Root > Label + Control > Grid + Crosshair + Thumb`, then `Input axis="x"` and
`Input axis="y"`). The value is `{ x, y }`; `min`, `max` and `step` take one
number or one per axis (default -100 to 100, step 1, starting at the centre).
y grows upward as on a graph; `invertY` makes it grow downward as on screen.
A press anywhere on the pad moves the handle there, a drag follows the pointer
live and stays at the edge when it leaves the pad, and mouse, touch and pen all
work. The handle is a `role="slider"` that says both values ("X 20, Y -10",
`getAriaValueText` rewords it); the arrows move it one step (ten with Shift),
and Home or a double-click return it to `defaultValue`. `onValueChangeEnd`
reports each change once it ends: the pointer lets go, a key on the handle sets
the value, or a number field that changed it is committed (Enter, or leaving
the field). The root takes `size` (`sm`, `md`, `lg`, matched to the Field
sizes).

`@moderno-ui/core` gains a machine of its own (ADR-0010), `vectorPad`
(`vectorPad.machine`, `vectorPad.connect`, …), and `vectorPadRecipe`.
