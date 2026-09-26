---
ssr: Chip sizes + named remove trigger
---

### Chip (`chipRecipe`: `data-variant` × `data-size`; CSS-only, no Ark machine)

| State / prop                              | React | Vue | Svelte | Solid |
| ----------------------------------------- | :---: | :-: | :----: | :---: |
| scope/part + defaults                     |  ✅   | ✅  |   ✅   |  ✅   |
| variant → `data-variant`                  |  ✅   | ✅  |   ✅   |  ✅   |
| size → `data-size`                        |  ✅   | ✅  |   ✅   |  ✅   |
| children → `[data-part="label"]`          |  ✅   | ✅  |   ✅   |  ✅   |
| no remove button unless `removable`       |  ✅   | ✅  |   ✅   |  ✅   |
| `removable` → `remove-trigger` `<button>` |  ✅   | ✅  |   ✅   |  ✅   |
| `removeLabel` names it (default "Remove") |  ✅   | ✅  |   ✅   |  ✅   |
| press → `onRemove` (Vue: `remove` event)  |  ✅   | ✅  |   ✅   |  ✅   |
| no baked class/style                      |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded                    |  ✅   | ✅  |   ✅   |  ✅   |
