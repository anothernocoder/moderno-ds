---
ssr: Card scope + every part
---

### Card (`cardRecipe`: `data-variant` × `data-size`; CSS-only, no Ark machine)

| State / prop                           | React | Vue | Svelte | Solid |
| -------------------------------------- | :---: | :-: | :----: | :---: |
| root scope/part + recipe defaults      |  ✅   | ✅  |   ✅   |  ✅   |
| every part carries scope + `data-part` |  ✅   | ✅  |   ✅   |  ✅   |
| variant → `data-variant`               |  ✅   | ✅  |   ✅   |  ✅   |
| size → `data-size`                     |  ✅   | ✅  |   ✅   |  ✅   |
| title renders as a heading (`h3`)      |  ✅   | ✅  |   ✅   |  ✅   |
| no baked class/style                   |  ✅   | ✅  |   ✅   |  ✅   |
| native props + events on every part    |  ✅   | ✅  |   ✅   |  ✅   |
