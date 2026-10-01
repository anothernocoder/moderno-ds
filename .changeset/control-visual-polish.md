---
"@moderno-ui/core": minor
"@moderno-ui/css": patch
"@moderno-ui/react": patch
"@moderno-ui/vue": patch
"@moderno-ui/svelte": patch
"@moderno-ui/solid": patch
---

Lighter controls, and no focus ring on a mouse press.

- **Slider:** smaller thumbs (`sm` 12px, `md` 16px, `lg` 20px, were 16/20/24) with a 1px border.
- **Angle Slider:** the knob is 8px with a 1px border.
- **Vector Pad:** the handle is 12px with a 1px border.
- **Color Picker and Radio Group:** the selected swatch outline, the picker thumbs and the tile ring are now 1px.
- **Focus ring:** Slider, Angle Slider and Vector Pad no longer draw it when a thumb is clicked or dragged. Ark focuses the thumb from script on pointerdown, which browsers count as `:focus-visible`. Keyboard focus still shows the ring.

`@moderno-ui/core` gains `trackInputModality()`. It sets `data-input-modality` (`pointer`, `keyboard` or `virtual`) on `<html>` and returns a cleanup. It does nothing on the server. The Slider and Angle Slider roots in every framework package start it on mount, and the Vector Pad machine runs it itself. `@moderno-ui/css` picks up the new styles from core.
