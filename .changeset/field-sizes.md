---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Field gains a `size` recipe (`sm` | `md` | `lg`, default `md`) on `Field.Root`, plus
Input/Textarea craft in the shared stylesheet.

`fieldRecipe` in `@moderno-ui/core` resolves the prop to a single `data-size` on the
root part, and `components.css` sizes every part from it: label, control height and
padding, and helper/error text. `Field.Root` is now a thin wrapper in all four
bindings (every other part stays Ark's verbatim). The controls also gain a hover
border, a transition, a `--destructive`-tinted invalid state that keeps its colour
while focused, a `--muted` disabled fill, and a per-size minimum height with
vertical-only resize on the textarea.
