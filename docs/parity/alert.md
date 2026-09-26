---
ssr: Alert anatomy + resolved `role` (status / alert)
---

### Alert (`alertRecipe`: `data-variant` × `data-size`; no Ark machine)

| State / prop                   | React | Vue | Svelte | Solid |
| ------------------------------ | :---: | :-: | :----: | :---: |
| scope/part + defaults          |  ✅   | ✅  |   ✅   |  ✅   |
| variant → `data-variant`       |  ✅   | ✅  |   ✅   |  ✅   |
| size → `data-size`             |  ✅   | ✅  |   ✅   |  ✅   |
| full anatomy renders           |  ✅   | ✅  |   ✅   |  ✅   |
| status → `role` (alert/status) |  ✅   | ✅  |   ✅   |  ✅   |
| consumer `role` overrides      |  ✅   | ✅  |   ✅   |  ✅   |
| icon part `aria-hidden`        |  ✅   | ✅  |   ✅   |  ✅   |
| no baked class/style           |  ✅   | ✅  |   ✅   |  ✅   |
