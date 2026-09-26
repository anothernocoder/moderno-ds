---
"@moderno-ui/react": patch
"@moderno-ui/vue": patch
"@moderno-ui/svelte": patch
"@moderno-ui/solid": patch
---

`moderno.agent.json` now lists `components[]` sorted by docs slug (`accordion`,
`alert`, `area-chart`, …) instead of in the order the components were added.
MCP search already breaks ties by name, so its results keep the same order.

A prop's `type` now lists its union members in a fixed order: the order the
component's recipe declares them, and sorted order for any other union. Before,
the order depended on which other components were extracted first, so adding a
component could change another component's `type` and `propsHash`. This changes
the text once for four props, and those components' `propsHash` with it: Badge
`variant`, Card `variant`, Divider `align` and Skeleton `shape`. The allowed
values are the same. Nothing else in any entry changes.
