---
ssr: Toolbar roles, names, pressed + disabled items, every item a Tab stop until mounted
---

### Toolbar (`toolbarRecipe`: `data-size`; toolbar machine in `@moderno-ui/core`, no Ark machine)

| State                                                                     | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`); orientation → `aria-orientation`        |  ✅   | ✅  |   ✅   |  ✅   |
| `role="toolbar"` named by `aria-label`; native props forwarded            |  ✅   | ✅  |   ✅   |  ✅   |
| one Tab stop: the first item, then the item focused last                  |  ✅   | ✅  |   ✅   |  ✅   |
| arrows move and wrap (Up/Down when vertical, swapped in `rtl`); Home/End  |  ✅   | ✅  |   ✅   |  ✅   |
| `label` names an icon-only item and shows in a tooltip with its shortcut  |  ✅   | ✅  |   ✅   |  ✅   |
| the tooltip follows focus from item to item                               |  ✅   | ✅  |   ✅   |  ✅   |
| toggle: `aria-pressed` + `data-state`, `onPressedChange`, controlled †    |  ✅   | ✅  |   ✅   |  ✅   |
| disabled item: `aria-disabled`, still reachable, its handlers never run   |  ✅   | ✅  |   ✅   |  ✅   |
| group → `role="group"`; separator → `role="separator"` across the toolbar |  ✅   | ✅  |   ✅   |  ✅   |
| a `Menu.Trigger` (as child) makes a toolbar button a menu button          |  ✅   | ✅  |   ✅   |  ✅   |

† React and Solid follow a controlled `pressed`; Vue binds it with
`v-model:pressed`, and Svelte's `pressed` is bindable (`bind:pressed`).
