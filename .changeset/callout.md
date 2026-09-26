---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Callout**, a CSS-only soft note in all four framework packages: a tip, a
caveat or a heads-up inside the page's content. The anatomy is `Callout.Root >
Callout.Icon + Callout.Content(Callout.Title + Callout.Description)`, in four
variants (`info`, `success`, `warning`, `error`). Softer than Alert: the surface
stays `--muted` and only a stripe on the inline-start edge and the icon take the
status colour, and the root is `role="note"` instead of a live region.

`@moderno-ui/core` gains `calloutRecipe` and the `CalloutVariant` type.
