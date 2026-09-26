---
ssr: Checkbox `data-state` (checked / indeterminate)
---

### Checkbox (`checkboxRecipe`: `data-size`; Ark tri-state machine)

| State                             | React | Vue | Svelte | Solid |
| --------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)  |  ✅   | ✅  |   ✅   |  ✅   |
| label ↔ hidden input (`for`/`id`) |  ✅   | ✅  |   ✅   |  ✅   |
| click toggles → `data-state`      |  ✅   | ✅  |   ✅   |  ✅   |
| indeterminate → `data-state`      |  ✅   | ✅  |   ✅   |  ✅   |
| disabled → `data-disabled`, inert |  ✅   | ✅  |   ✅   |  ✅   |
