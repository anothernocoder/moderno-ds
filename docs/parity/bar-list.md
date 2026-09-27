---
ssr: BarList rows sorted largest first, bar widths + label
---

### BarList (`barListNodes` render tree; no Ark machine)

| State / prop                                                         | React | Vue | Svelte | Solid |
| -------------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| `<svg>` root: `data-scope="chart"`, `data-chart="bar-list"`          |  ✅   | ✅  |   ✅   |  ✅   |
| one row per item, largest first; `viewBox` as tall as the rows       |  ✅   | ✅  |   ✅   |  ✅   |
| no baked colour on `track`, `bar`, `label` or `value`                |  ✅   | ✅  |   ✅   |  ✅   |
| `sort`, `max` and `format` pass through to the render tree           |  ✅   | ✅  |   ✅   |  ✅   |
| consumer attributes forwarded; `data-part="root"` cannot be replaced |  ✅   | ✅  |   ✅   |  ✅   |
| serialises exactly like charts-core's reference SVG                  |  ✅   | ✅  |   ✅   |  ✅   |
