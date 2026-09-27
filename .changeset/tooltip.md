---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Tooltip** in all four framework packages, over Ark's Tooltip. A short
label shows while the pointer rests on its trigger or the trigger has keyboard
focus, with an arrow pointing at it
(`Root > Trigger + Positioner > Content > Arrow > ArrowTip`). The root takes
`size` (`sm`, `md`, `lg`), which lands on the content as `data-size`, since
Ark's Root renders no element; every other part and prop is Ark's, including
`openDelay`, `closeDelay`, `positioning` and `open`.

The content is a `--popover` surface edged by its own 1px `--border`, lifted
by `--shadow-md`; it fades in and out over `--motion-instant`, and holds still
under reduced motion. `@moderno-ui/core` gains `tooltipRecipe`.

In Svelte, a controlled `open` now works: the binding passes it to the machine,
which Ark's own Svelte Tooltip.Root does not.
