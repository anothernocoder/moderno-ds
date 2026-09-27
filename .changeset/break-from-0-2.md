---
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
"@moderno-ui/css": minor
---

**If you are upgrading from 0.2.x: 0.3.0 and later is a different library.**
0.3.0 and 0.4.0 should have said so and did not. The 0.2.x packages came from an
earlier repo, `anothernocoder/moderno`. From 0.3.0, `@moderno-ui/*` is built
from `anothernocoder/moderno-ds` and every component was rewritten. There is no
codemod; plan a migration.

- **Zag → Ark anatomy.** Components are built on Ark UI and use Ark's parts and
  names: `Sheet` is now `Drawer` (with `placement`), an on/off `Toggle` is now
  `Switch`, `Radio` is now `RadioGroup`, and the combined `Input` is now `Field`
  with `Field.Label`, `Field.Input` and the rest.
- **`--md-*` → the token contract.** Themes set semantic slots (`--background`,
  `--primary`, `--border`, …) instead of `--md-*` variables, and dark mode is the
  `.dark` class instead of `[data-theme]`. See `CONTRACT.md`.
- **`@moderno-ui/tokens` → `@moderno-ui/css`.** One package ships the variables,
  the component styles, the Tailwind preset and the contract. `styles` also moved
  to `@moderno-ui/css`, `class-contract` to `@moderno-ui/core`, `chart-core` to
  `@moderno-ui/charts-core`, and `registry` and `create-moderno-ui` to
  `@moderno-ui/cli`.

The root README has the full migration note.
