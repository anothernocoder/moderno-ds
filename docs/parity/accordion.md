---
ssr: Accordion open items, hidden contents + ids
---

### Accordion (`accordionRecipe`: `data-variant` × `data-size`; Ark accordion machine)

| State                                                        | React | Vue | Svelte | Solid |
| ------------------------------------------------------------ | :---: | :-: | :----: | :---: |
| variant × size → root `data-*` (+ `line`, `md`)              |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                       |  ✅   | ✅  |   ✅   |  ✅   |
| native `button` trigger (`aria-expanded`) labels its region  |  ✅   | ✅  |   ✅   |  ✅   |
| click opens one item → `data-state` + `onValueChange`        |  ✅   | ✅  |   ✅   |  ✅   |
| `multiple` → several items open                              |  ✅   | ✅  |   ✅   |  ✅   |
| `collapsible` → the open item closes                         |  ✅   | ✅  |   ✅   |  ✅   |
| arrow keys / Home / End move focus, skipping a disabled item |  ✅   | ✅  |   ✅   |  ✅   |
| disabled item → native `disabled` + `data-disabled`, inert   |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                           |  ✅   | ✅  |   ✅   |  ✅   |
