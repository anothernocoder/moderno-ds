---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
"@moderno-ui/lint-core": patch
---

Add **SegmentedControl** in all four framework packages, over Ark's
SegmentGroup: `Root > Indicator + Item (> icon + ItemText + ItemHiddenInput)`.
Two to five options sit side by side in one track, one is selected, and a pill
slides behind it (it holds still under `prefers-reduced-motion`). Each segment
is a native radio, so Tab enters the group and the arrow keys move and select.
`SegmentedControl.Root` takes `size` (`sm`, `md`, `lg`, matching Field) and
`fullWidth`; inside a `Field`, the Field's label names it and its helper or
error text describes it. A long label ends in an ellipsis and shows in full as
a tooltip. Ark's `Label` is left out: name the control with `aria-label` or a
`Field.Label`.

`@moderno-ui/core` gains `segmentedControlRecipe`, `segmentedControlAttrs`,
`segmentedControlFieldProps` and `syncTruncationTitle`. `moderno/no-raw-ark`
now also suggests the Moderno component whose scope matches a raw Ark import
(`SegmentGroup` → `SegmentedControl`).
