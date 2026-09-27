---
ssr: Menu trigger + hidden content wired by id; items, separator, submenu size
---

### Menu (`menuRecipe`: `data-size`; Ark menu machine)

| State                                                               | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size on Root → trigger + content `data-size` (+ `md`)               |  ✅   | ✅  |   ✅   |  ✅   |
| a submenu takes its parent's size unless it sets its own            |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                              |  ✅   | ✅  |   ✅   |  ✅   |
| trigger opens a menu labelled by it (`aria-expanded`, `data-state`) |  ✅   | ✅  |   ✅   |  ✅   |
| group labelled by its label; separator                              |  ✅   | ✅  |   ✅   |  ✅   |
| choosing an item reports its value (`onSelect`) and closes          |  ✅   | ✅  |   ✅   |  ✅   |
| disabled item → `aria-disabled` + `data-disabled`, not selectable   |  ✅   | ✅  |   ✅   |  ✅   |
| checkbox item toggles; radio item group checks one (`data-state`)   |  ✅   | ✅  |   ✅   |  ✅   |
| opens from the keyboard                                             |  ✅   | ✅  |   ✅   |  ✅   |
| trigger item opens a submenu (`data-part="trigger-item"`)           |  ✅   | ✅  |   ✅   |  ✅   |
