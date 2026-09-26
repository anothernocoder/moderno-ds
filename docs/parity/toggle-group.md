---
ssr: ToggleGroup pressed items, roles + orientation
---

### ToggleGroup (`toggleGroupRecipe`: `data-variant` × `data-size`; Ark toggle-group machine)

| State                                              | React | Vue | Svelte | Solid |
| -------------------------------------------------- | :---: | :-: | :----: | :---: |
| variant × size → root `data-*` (+ `ghost`, `md`)   |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                             |  ✅   | ✅  |   ✅   |  ✅   |
| orientation → `data-orientation` (+ horizontal)    |  ✅   | ✅  |   ✅   |  ✅   |
| single: `radiogroup` of `radio` buttons            |  ✅   | ✅  |   ✅   |  ✅   |
| click presses one → `data-state` + `onValueChange` |  ✅   | ✅  |   ✅   |  ✅   |
| `multiple`: `group` of `aria-pressed` buttons      |  ✅   | ✅  |   ✅   |  ✅   |
| arrow keys move focus between items                |  ✅   | ✅  |   ✅   |  ✅   |
| disabled item → `data-disabled`, inert             |  ✅   | ✅  |   ✅   |  ✅   |
| disabled group → every item disabled               |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                 |  ✅   | ✅  |   ✅   |  ✅   |
