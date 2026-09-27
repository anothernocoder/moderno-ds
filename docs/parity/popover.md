---
ssr: Popover trigger/content ids + content `data-size`
---

### Popover (`popoverRecipe`: `data-size` on the content; Ark popover machine)

| State                                                                     | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size on the Root → content `data-size` (+ `md`)                           |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                    |  ✅   | ✅  |   ✅   |  ✅   |
| closed by default: content hidden, trigger `aria-expanded="false"`        |  ✅   | ✅  |   ✅   |  ✅   |
| opens as a `dialog` labelled by its title and description                 |  ✅   | ✅  |   ✅   |  ✅   |
| focus moves in on open and back to the trigger on close                   |  ✅   | ✅  |   ✅   |  ✅   |
| closes on Escape and via the close trigger                                |  ✅   | ✅  |   ✅   |  ✅   |
| controlled `open` followed (`v-model:open` in Vue, `bind:open` in Svelte) |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the content                                     |  ✅   | ✅  |   ✅   |  ✅   |
