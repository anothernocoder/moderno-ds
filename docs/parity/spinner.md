---
ssr: Spinner `role="status"`, sizes, hidden ring + label
---

### Spinner (`spinnerRecipe`: `data-size`; CSS-only, no Ark machine)

| State / prop                               | React | Vue | Svelte | Solid |
| ------------------------------------------ | :---: | :-: | :----: | :---: |
| scope/part + default size                  |  ✅   | ✅  |   ✅   |  ✅   |
| size → `data-size`                         |  ✅   | ✅  |   ✅   |  ✅   |
| root `role="status"`, consumer role wins   |  ✅   | ✅  |   ✅   |  ✅   |
| `circle` part `aria-hidden`                |  ✅   | ✅  |   ✅   |  ✅   |
| `label` → `label` part (default "Loading") |  ✅   | ✅  |   ✅   |  ✅   |
| no baked class/style                       |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded                     |  ✅   | ✅  |   ✅   |  ✅   |
