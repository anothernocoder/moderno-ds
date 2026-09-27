---
ssr: Drawer trigger/content ids + `data-placement`, drawer scope
---

### Drawer (`drawerRecipe`: `data-placement` on the positioner and content; Ark dialog machine)

| State                                                                     | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| every part of Ark's Dialog exposed, each under `data-scope="drawer"`      |  ✅   | ✅  |   ✅   |  ✅   |
| placement on the Root → positioner + content `data-placement` (+ `right`) |  ✅   | ✅  |   ✅   |  ✅   |
| placement on a RootProvider driven by `useDialog()`                       |  ✅   | ✅  |   ✅   |  ✅   |
| closed by default: content hidden, trigger `aria-expanded="false"`        |  ✅   | ✅  |   ✅   |  ✅   |
| opens as a modal `dialog` labelled by its title and description           |  ✅   | ✅  |   ✅   |  ✅   |
| focus moves in on open and back to the trigger on close                   |  ✅   | ✅  |   ✅   |  ✅   |
| closes on Escape and via the close trigger                                |  ✅   | ✅  |   ✅   |  ✅   |
| controlled `open` followed (`v-model:open` in Vue, `bind:open` in Svelte) |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the content                                     |  ✅   | ✅  |   ✅   |  ✅   |
