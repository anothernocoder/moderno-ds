---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Editable** in all four framework packages, over Ark's Editable: text that
turns into an input to rename something in place — a layer, a slide, a file
(`Root > Label + Area > Input + Preview`, then an optional
`Control > EditTrigger + SubmitTrigger + CancelTrigger`). A double click starts
an edit by default (`activationMode`: `focus`, `click`, `dblclick`), and so do
Enter, F2 and Space on the focused text. The whole text is selected; Enter or a
click away saves (`submitMode`), Escape cancels and puts back the value from
before the edit. Focus goes back to the text afterwards. The root takes `size`
(`sm`, `md`, `lg`, matched to the Field sizes); the text and the input are one
box, so nothing moves when an edit starts. A long value is cut with an ellipsis
and shows in full as a tooltip. Inside a Field, its label names the text and
the input, and its helper and error text describe them.

`@moderno-ui/core` gains `editableRecipe` and what the bindings share
(`EDITABLE_DEFAULT_ACTIVATION_MODE`, `isEditableStartKey`,
`editableTranslations`, `createEditableFocusReturn`, `editablePreviewTitle`, …).
