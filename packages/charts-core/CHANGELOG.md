# @moderno-ui/charts-core

## 0.4.0

### Minor Changes

- 2ed7eb4: Add **BarList** in all four framework packages: a ranking drawn as one SVG,
  one row per item with its name, a track, the bar filling it and its value
  (`root > series > row > label + track + bar + value`). It takes `width` and
  `data` (`{ name, value }[]`), plus `max`, `sort` (`descending` by default,
  `ascending`, `none`), `format`, `labelWidth`, `valueWidth`, `rowHeight` and
  `barHeight`. The list is as tall as its rows.

  `@moderno-ui/charts-core` gains `buildBarList` and `barListNodes`, the render
  tree the four bindings walk. The track and the bar paint from `--chart-1`
  through the series colour; the name and value read `--foreground` and
  `--muted-foreground`.

- d817e03: Add **DonutChart** in all four framework packages: an SVG ring split into one
  slice per `{ name?, value }` in `data`, in data order, clockwise from 12
  o'clock. `innerRadius` sets the hole as a fraction of the outer radius (`0`
  draws a pie; default `0.6`) and `padAngle` opens a gap between slices, in
  radians. A value of 0 or less draws no slice. Slices paint from `--chart-1`
  to `--chart-5` by their index in `data`.

  `@moderno-ui/charts-core` gains `buildDonutChart` and `donutChartNodes`, the
  render tree every binding walks; `@moderno-ui/core`'s stylesheet gains the
  `slice` part of the `chart` scope.
