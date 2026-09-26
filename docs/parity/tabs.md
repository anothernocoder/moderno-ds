---
ssr: Tabs selected tab, hidden panels + tab ids
---

### Tabs (`tabsRecipe`: `data-variant` × `data-size`; Ark tabs machine)

| State                                                     | React | Vue | Svelte | Solid |
| --------------------------------------------------------- | :---: | :-: | :----: | :---: |
| variant × size → root `data-*` (+ `line`, `md`)           |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                    |  ✅   | ✅  |   ✅   |  ✅   |
| orientation → `data-orientation` (+ horizontal)           |  ✅   | ✅  |   ✅   |  ✅   |
| `tablist` of native `tab` buttons, panel labelled by tab  |  ✅   | ✅  |   ✅   |  ✅   |
| click selects → `aria-selected` + panel + `onValueChange` |  ✅   | ✅  |   ✅   |  ✅   |
| arrow keys / Home move focus, skipping a disabled tab     |  ✅   | ✅  |   ✅   |  ✅   |
| vertical → up / down arrows                               |  ✅   | ✅  |   ✅   |  ✅   |
| manual activation → Enter selects the focused tab         |  ✅   | ✅  |   ✅   |  ✅   |
| disabled tab → native `disabled` + `data-disabled`, inert |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                        |  ✅   | ✅  |   ✅   |  ✅   |
