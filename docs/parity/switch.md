---
ssr: Switch on/off state + switch role
---

### Switch (`switchRecipe`: `data-size`; Ark on/off machine)

| State                                     | React | Vue | Svelte | Solid |
| ----------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)          |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                    |  ✅   | ✅  |   ✅   |  ✅   |
| label ↔ hidden input, `role="switch"`     |  ✅   | ✅  |   ✅   |  ✅   |
| consumer `role` on the input wins         |  ✅   | ✅  |   ✅   |  ✅   |
| click turns on → `data-state` on parts    |  ✅   | ✅  |   ✅   |  ✅   |
| hidden input takes keyboard focus         |  ✅   | ✅  |   ✅   |  ✅   |
| disabled → `data-disabled`, inert         |  ✅   | ✅  |   ✅   |  ✅   |
| invalid → `data-invalid` + `aria-invalid` |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded, no baked style    |  ✅   | ✅  |   ✅   |  ✅   |
