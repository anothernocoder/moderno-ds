---
ssr: Splitter panel sizes, separator bounds + controls
---

### Splitter (`splitterRecipe`: `data-variant`; Ark splitter machine)

| State                                                                          | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------------------ | :---: | :-: | :----: | :---: |
| variant → root `data-variant` (+ `line`)                                       |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                                         |  ✅   | ✅  |   ✅   |  ✅   |
| panels sized inline from `defaultSize`, with their `minSize` limit             |  ✅   | ✅  |   ✅   |  ✅   |
| trigger is a `separator` (`aria-valuenow`/min/max) controlling both panels     |  ✅   | ✅  |   ✅   |  ✅   |
| arrow keys and End move the boundary; `onResize` reports the sizes             |  ✅   | ✅  |   ✅   |  ✅   |
| Enter collapses a collapsible panel and opens it again                         |  ✅   | ✅  |   ✅   |  ✅   |
| vertical → column layout, `aria-orientation` on the trigger                    |  ✅   | ✅  |   ✅   |  ✅   |
| controlled `size` followed                                                     |  ✅   | ✅  |   ✅   |  ✅   |
| disabled trigger → `data-disabled` on it and its grip, out of the tab order    |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                             |  ✅   | ✅  |   ✅   |  ✅   |
| server render survives teardown (zag's exit action reaches for the document) † |   —   |  —  |   ✅   |  ✅   |

† Zag's Solid and Svelte adapters run the machine's exit action when the server
render is torn down, and the Splitter's looks up its cursor stylesheet in the
document. The Solid and Svelte roots hand Ark `serverDocument` (from
`@moderno-ui/core`) on the server; React and Vue run no exit action there.
