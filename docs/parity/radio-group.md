---
ssr: RadioGroup checked item + orientation
---

### RadioGroup (`radioGroupRecipe`: `data-size`; Ark radio machine)

| State                                         | React | Vue | Svelte | Solid |
| --------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)              |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed + `ItemDescription`    |  ✅   | ✅  |   ✅   |  ✅   |
| orientation → `data-orientation` (+ vertical) |  ✅   | ✅  |   ✅   |  ✅   |
| group named by label, radio by text + desc.   |  ✅   | ✅  |   ✅   |  ✅   |
| click picks → `data-state` + `onValueChange`  |  ✅   | ✅  |   ✅   |  ✅   |
| checked radio takes keyboard focus            |  ✅   | ✅  |   ✅   |  ✅   |
| arrow keys move the choice                    |  ✅   | ✅  |   ✅   |  ✅   |
| disabled option → `data-disabled`, inert      |  ✅   | ✅  |   ✅   |  ✅   |
| disabled group → every radio disabled         |  ✅   | ✅  |   ✅   |  ✅   |
| invalid → `data-invalid` + `aria-invalid`     |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root            |  ✅   | ✅  |   ✅   |  ✅   |
