---
ssr: Toggle pressed state + indicator content
---

### Toggle (`toggleRecipe`: `data-variant` × `data-size`; Ark toggle machine)

| State                                            | React | Vue | Svelte | Solid |
| ------------------------------------------------ | :---: | :-: | :----: | :---: |
| variant × size → root `data-*` (+ `ghost`, `md`) |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                           |  ✅   | ✅  |   ✅   |  ✅   |
| native `<button>`, `aria-pressed` + `data-state` |  ✅   | ✅  |   ✅   |  ✅   |
| click presses → `data-state="on"` + callback     |  ✅   | ✅  |   ✅   |  ✅   |
| Indicator shows children on, `fallback` off      |  ✅   | ✅  |   ✅   |  ✅   |
| `defaultPressed` starts it pressed               |  ✅   | ✅  |   ✅   |  ✅   |
| Space / Enter toggle it                          |  ✅   | ✅  |   ✅   |  ✅   |
| disabled → native `disabled` + `data-disabled`   |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded, no baked style           |  ✅   | ✅  |   ✅   |  ✅   |
