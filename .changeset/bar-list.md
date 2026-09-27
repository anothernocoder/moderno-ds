---
"@moderno-ui/charts-core": minor
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add **BarList** in all four framework packages: a ranking drawn as one SVG,
one row per item with its name, a track, the bar filling it and its value
(`root > series > row > label + track + bar + value`). It takes `width` and
`data` (`{ name, value }[]`), plus `max`, `sort` (`descending` by default,
`ascending`, `none`), `format`, `labelWidth`, `valueWidth`, `rowHeight` and
`barHeight`. The list is as tall as its rows.

`@moderno-ui/charts-core` gains `buildBarList` and `barListNodes`, the render
tree the four bindings walk. The track and the bar paint from `--chart-1`
through the series colour; the name and value read `--foreground` and
`--muted-foreground`.
