---
ssr: Indicator bare `data-pulse`, dot + label parts
---

### Indicator (`indicatorAttrs`: `data-variant` × `data-size` + bare `data-pulse`; CSS-only)

| State / prop                              | React | Vue | Svelte | Solid |
| ----------------------------------------- | :---: | :-: | :----: | :---: |
| scope/part + defaults, no pulse           |  ✅   | ✅  |   ✅   |  ✅   |
| variant → `data-variant`                  |  ✅   | ✅  |   ✅   |  ✅   |
| size → `data-size`                        |  ✅   | ✅  |   ✅   |  ✅   |
| `pulse` → `data-pulse`                    |  ✅   | ✅  |   ✅   |  ✅   |
| dot always rendered, `aria-hidden`        |  ✅   | ✅  |   ✅   |  ✅   |
| children → `[data-part="label"]`          |  ✅   | ✅  |   ✅   |  ✅   |
| bare dot with `aria-label` → `role="img"` |  ✅   | ✅  |   ✅   |  ✅   |
| no role when labelled or unnamed          |  ✅   | ✅  |   ✅   |  ✅   |
| consumer `role` wins                      |  ✅   | ✅  |   ✅   |  ✅   |
| no baked class/style                      |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded                    |  ✅   | ✅  |   ✅   |  ✅   |
