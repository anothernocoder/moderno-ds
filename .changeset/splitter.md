---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Splitter** in all four framework packages, over Ark's Splitter. Panels
sit side by side, or stacked, and the user resizes them by dragging the handle
between them or with the keyboard
(`Root > Panel + ResizeTrigger > ResizeTriggerIndicator + Panel …`). The root
takes `variant` (`line`, `enclosed`); every other part and prop is Ark's,
including `panels`, `defaultSize`, `size` and `orientation`.

`@moderno-ui/core` gains `splitterRecipe`, and `serverDocument`: the
document-shaped stand-in the Solid and Svelte roots hand Ark on the server,
where zag's exit action would otherwise reach for a missing `document`.
