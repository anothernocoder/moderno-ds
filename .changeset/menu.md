---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **Menu** in all four framework packages, over Ark's Menu. A list of actions
that opens from a button, with items, groups, separators, checkbox and radio
items, and submenus (`Root > Trigger + Positioner > Content > Item…`, a
submenu being a nested `Root` opened by a `TriggerItem`; `ContextTrigger` opens
it on right-click). `Menu.Root` takes `size` (`sm`, `md`, `lg`), which lands on
the trigger and the content; a submenu takes its parent's size unless it sets
its own. Every other part and prop is Ark's. Under a 40rem viewport the open
menu is a bottom sheet over an `--overlay` scrim — the first primitive on the
stylesheet's viewport `@media` allow-list (ADR-0005).

`@moderno-ui/core` gains `menuRecipe` and `MenuSize`.
