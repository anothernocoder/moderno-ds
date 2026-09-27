---
ssr: SparkChart line, optional fill + last point
---

### SparkChart (`sparkChartNodes` render tree; no Ark machine)

| State / prop                                                      | React | Vue | Svelte | Solid |
| ----------------------------------------------------------------- | :---: | :-: | :----: | :---: |
| `<svg>` root: `data-scope="chart"`, `data-chart="spark"`          |  ✅   | ✅  |   ✅   |  ✅   |
| one series, drawn as one `line`                                   |  ✅   | ✅  |   ✅   |  ✅   |
| `area` → a filled `area` under the line                           |  ✅   | ✅  |   ✅   |  ✅   |
| `showLastPoint` → a single `point` marker                         |  ✅   | ✅  |   ✅   |  ✅   |
| plain and filled lines serialise like charts-core's reference SVG |  ✅   | ✅  |   ✅   |  ✅   |
