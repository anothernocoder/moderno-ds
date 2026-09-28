---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Toolbar** in all four framework packages: a bar of icon buttons,
toggles, groups and separators, like the top bar of an editor
(`Root > Button + Toggle + Group > … + Separator`). It follows the WAI-ARIA
toolbar pattern: `role="toolbar"`, one Tab stop (the item used last), the arrow
keys between items (Left/Right in a row, Up/Down with
`orientation="vertical"`, swapped in `rtl`), Home and End to the ends. A
disabled item stays in the arrow-key order, announced as disabled, and does
nothing. An item with a `label` is icon-only: the label is its name and shows
in a tooltip with its `shortcut`. `Toolbar.Toggle` stays pressed
(`pressed` / `defaultPressed` / `onPressedChange`). A `Toolbar.Button` inside a
`Menu.Trigger` (as child) opens a menu with Enter or Space (and ArrowDown in a
row); the toolbar's arrows still move past it. `size` (`sm`, `md`, `lg`) matches
Button's sizes; every item keeps a hit area of at least `--spacing-8` each way.

`@moderno-ui/core` gains the toolbar machine (`toolbar.machine`,
`toolbar.connect`), a Zag machine of its own (ADR-0010), plus
`toolbarRecipe`, `toolbarTooltipText`, `toolbarTooltipTriggerProps`,
`splitToolbarKeyDown` and `withoutEventHandlers`.
