---
ssr: Avatar fallback shown / image hidden
---

### Avatar (`avatarRecipe`: `data-size` × `data-shape`; Ark image-loading machine)

| State                                      | React | Vue | Svelte | Solid |
| ------------------------------------------ | :---: | :-: | :----: | :---: |
| size/shape → root `data-*` (+ md, circle)  |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                     |  ✅   | ✅  |   ✅   |  ✅   |
| loading → fallback visible, image `hidden` |  ✅   | ✅  |   ✅   |  ✅   |
| image loads → image visible, `loaded`      |  ✅   | ✅  |   ✅   |  ✅   |
| image fails → fallback stays, `error`      |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded, no baked style     |  ✅   | ✅  |   ✅   |  ✅   |
