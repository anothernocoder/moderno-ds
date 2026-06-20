# PRD — Phase 4: Custom charts

> Charts controlled 100%: pure math from `@moderno/charts-core` + `<svg>` rendered with each framework's native templating, themed via `--chart-*`.

## Objective

Deliver 4 custom charts — **line, area, bar, scatter** — without a batteries-included chart library. The math layer lives in `@moderno/charts-core` (Phase 1); each framework renders its own SVG that reads the theme's CSS variables.

## Scope

- For each chart: math helpers in `@moderno/charts-core` (scales, paths, ticks, domains) + SVG render in `@moderno/react`, `@moderno/vue`, `@moderno/svelte`, `@moderno/solid`.
- Themed via `--chart-1…5` (and semantic tokens for axes/grid/text). No baked-in colors.
- SSR: the SVG is serialized server-side (math is pure) without hydration errors.

## Functional requirements

| #    | Requirement                                                                                                     |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| F4.1 | line, area, bar, scatter available in the 4 frameworks, fed by the same `charts-core`.                          |
| F4.2 | All computation (scales, paths, layout) happens in pure `charts-core`; the component only maps to SVG elements. |
| F4.3 | Series colors from `--chart-1…5`; axes/grid/labels from semantic tokens. Changing theme re-colors the charts.   |
| F4.4 | SSR without errors: the chart renders the same SVG on server and client.                                        |
| F4.5 | Guardrail: no use of `d3-selection`/`d3-transition` nor a chart library (Recharts/Unovis/etc.).                 |

## Deliverables

- Per-chart math functions in `packages/charts-core/`.
- Per-framework SVG components (4 charts × 4 frameworks).
- Tests: numeric snapshots of math; SVG render smoke per framework.
- Examples of the 4 charts with a sample dataset.

## Acceptance criteria (DoD)

- [ ] The 4 charts render identically across the 4 frameworks with the same dataset.
- [ ] Changing `--chart-*` (via theme/brand) re-colors without touching components.
- [ ] SSR of each chart without hydration warnings.
- [ ] Math with test coverage (includes edge cases: empty dataset, negative values, a single point).
- [ ] Verified: no forbidden D3 dependencies nor chart libraries.

## Dependencies

- Phase 1 (`@moderno/charts-core`).
- Phase 3 (multi-framework render pattern established).

## Out of scope

- Advanced interaction (rich tooltips, zoom, brush) beyond what is needed for v1.
- Generic non-custom charts (Unovis only if explicitly requested later).
- Dashboard blocks that consume them (Phase 5).
