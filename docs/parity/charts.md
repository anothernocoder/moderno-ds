---
ssr: LineChart, AreaChart, BarChart, ScatterChart drawn SVG + series
---

### LineChart, AreaChart, BarChart, ScatterChart (`@moderno-ui/charts-core` render trees; no Ark machine)

| State / prop                                                  | React | Vue | Svelte | Solid |
| ------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| `<svg>` root: `data-scope="chart"`, `data-chart`, `viewBox`   |  ✅   | ✅  |   ✅   |  ✅   |
| one `series` group per series → `data-series` index           |  ✅   | ✅  |   ✅   |  ✅   |
| no baked colour: no `class`, `style`, `fill` or `stroke`      |  ✅   | ✅  |   ✅   |  ✅   |
| line: grid lines + tick labels from the model                 |  ✅   | ✅  |   ✅   |  ✅   |
| area: a closed filled area plus its top line per series       |  ✅   | ✅  |   ✅   |  ✅   |
| bar: one `bar` rect per category per series                   |  ✅   | ✅  |   ✅   |  ✅   |
| scatter: one `point` circle per point, `radius` → `r`         |  ✅   | ✅  |   ✅   |  ✅   |
| each type serialises exactly like charts-core's reference SVG |  ✅   | ✅  |   ✅   |  ✅   |
| server string is deterministic (two renders, same bytes)      |  ✅   | ✅  |   ✅   |  ✅   |
