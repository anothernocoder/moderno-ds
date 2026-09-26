---
ssr: Callout `role="note"`, variants + hidden icon
---

### Callout (`calloutRecipe`: `data-variant`; CSS-only, no Ark machine)

| State / prop                          | React | Vue | Svelte | Solid |
| ------------------------------------- | :---: | :-: | :----: | :---: |
| scope/part + default variant, no size |  ✅   | ✅  |   ✅   |  ✅   |
| variant → `data-variant`              |  ✅   | ✅  |   ✅   |  ✅   |
| full anatomy renders                  |  ✅   | ✅  |   ✅   |  ✅   |
| root `role="note"` for every variant  |  ✅   | ✅  |   ✅   |  ✅   |
| consumer `role` overrides             |  ✅   | ✅  |   ✅   |  ✅   |
| icon part `aria-hidden`               |  ✅   | ✅  |   ✅   |  ✅   |
| no baked class/style                  |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded                |  ✅   | ✅  |   ✅   |  ✅   |
