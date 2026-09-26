---
ssr: Progress value, state + circle geometry
---

### Progress (`progressRecipe`: `data-size`; Ark progress machine)

| State                                                               | React | Vue | Svelte | Solid |
| ------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size` (+ `md`)                                    |  ✅   | ✅  |   ✅   |  ✅   |
| every Ark part exposed                                              |  ✅   | ✅  |   ✅   |  ✅   |
| linear: track is the `progressbar` (`aria-valuenow`/min/max)        |  ✅   | ✅  |   ✅   |  ✅   |
| range width + value text follow the value, measured against min/max |  ✅   | ✅  |   ✅   |  ✅   |
| controlled value → `data-state="complete"` at max, `View` shows     |  ✅   | ✅  |   ✅   |  ✅   |
| `null` value → `data-state="indeterminate"`, no value, no width †   |  ✅   | ✅  |   ✅   |  ✅   |
| circular: `<svg>` circle is the `progressbar`, track + range inside |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded to the root                                  |  ✅   | ✅  |   ✅   |  ✅   |

† Zag's Solid binding reads a `null` value as "uncontrolled", so in Solid an
indeterminate progress is `defaultValue={null}`; React, Vue and Svelte take
`value={null}` too.
