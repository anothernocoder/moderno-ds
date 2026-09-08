---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add the PinInput primitive: a one-time-code input over Ark's PinInput machine —
focus advances as characters land, a pasted code is distributed across the
cells, `mask` swaps them to `type="password"`, `otp` asks for
`autocomplete="one-time-code"`, and `invalid` mirrors onto `aria-invalid` — in
all four framework packages.

Anatomy `root > label + control(> input × n) + hiddenInput` under
`data-scope="pin-input"`, with the new `pinInputRecipe`'s `data-size`
(`sm`/`md`/`lg`) on the root; the filled, complete and invalid states are Ark's
own `data-*`, styled in the shared `components.css`.
