---
"@moderno-ui/charts-core": minor
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **DonutChart** in all four framework packages: an SVG ring split into one
slice per `{ name?, value }` in `data`, in data order, clockwise from 12
o'clock. `innerRadius` sets the hole as a fraction of the outer radius (`0`
draws a pie; default `0.6`) and `padAngle` opens a gap between slices, in
radians. A value of 0 or less draws no slice. Slices paint from `--chart-1`
to `--chart-5` by their index in `data`.

`@moderno-ui/charts-core` gains `buildDonutChart` and `donutChartNodes`, the
render tree every binding walks; `@moderno-ui/core`'s stylesheet gains the
`slice` part of the `chart` scope.
