## Notes on the bindings

- **Portal**: React/Solid use a framework-native portal (`@ark-ui/react`,
  `solid-js/web`); Svelte uses Ark's `Portal`; Vue has no Ark portal, so
  `@moderno-ui/vue` ships a thin `<Teleport to="body">` wrapper for API parity.
- **Authoring style** mirrors each ecosystem: React/Solid JSX, Vue `h()` render
  functions (no SFC → tsup builds it), Svelte 5 `.svelte` runes (built with
  `svelte-package`).
- **Typing**: every export that wraps an Ark namespace (Field, Checkbox, Select,
  PinInput and the rest) is annotated in every package so the emitted `.d.ts`
  never inlines an un-nameable `@zag-js` type (TS2742).
- **PinInput cells** are authored by the consumer — one `PinInput.Input` per
  index inside `PinInput.Control` — so the cell count is the same declaration in
  all four bindings; `count` on the Root is what makes the server render the
  right aria labels.
