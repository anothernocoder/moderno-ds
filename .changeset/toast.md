---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Toast** in all four framework packages, over Ark's Toast: short
messages that appear over the page and go away on their own
(`Toaster > Root > Title, Description, ActionTrigger, CloseTrigger`).
`createToaster({ placement })` makes the store you call from anywhere
(`toaster.create`, `.success`, `.error`, `.warning`, `.info`, `.loading`,
`.promise`, `.dismiss`), and `<Toaster>` renders its live region with one
toast per entry. `Toast.Root` takes `size` (`sm`, `md`, `lg`); every other
part and prop is Ark's, and `Toaster` and `createToaster` are Ark's own.

`@moderno-ui/core` gains `toastRecipe` and the `toast` scope in
`components.css`: the `--popover` surface with its 1px `--border` edge and the
`--shadow-lg` drop, a tint per status from `--success`, `--warning` and
`--destructive` (a plain `info` toast stays neutral), an outline action button
and a corner close button. On a narrow screen a toast spans the width between
the toaster's offsets.
