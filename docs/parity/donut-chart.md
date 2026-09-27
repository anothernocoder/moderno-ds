---
ssr: DonutChart slices, series index + label
---

### DonutChart (`donutChartNodes` render tree; no Ark machine)

| State / prop                                                   | React | Vue | Svelte | Solid |
| -------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| `<svg>` root: `data-scope="chart"`, `data-chart="donut"`       |  ✅   | ✅  |   ✅   |  ✅   |
| one `slice` per positive value; a zero value draws nothing     |  ✅   | ✅  |   ✅   |  ✅   |
| a slice keeps the `data-series` of its data index              |  ✅   | ✅  |   ✅   |  ✅   |
| no baked colour: slices paint from `--chart-*`                 |  ✅   | ✅  |   ✅   |  ✅   |
| no axes, grid or tick labels                                   |  ✅   | ✅  |   ✅   |  ✅   |
| native props forwarded; `data-chart` cannot be overridden      |  ✅   | ✅  |   ✅   |  ✅   |
| redraws when the data changes                                  |  ✅   | ✅  |   ✅   |  ✅   |
| ring and padded pie serialise like charts-core's reference SVG |  ✅   | ✅  |   ✅   |  ✅   |
