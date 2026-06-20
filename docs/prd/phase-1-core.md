# PRD — Phase 1: Core

> Shared logic without DOM: variant resolution and chart math. Done once, reused by all 4 frameworks.

## Objective

Build the two framework-agnostic layers that all primitives and charts will depend on: `@moderno/core` (utils, CVA, helpers, `components.css`) and `@moderno/charts-core` (pure d3-math, SSR-safe).

## Scope

- `@moderno/core`:
  - CVA helpers that resolve props → `data-variant` / `data-size` / etc. on `[data-part=root]`.
  - Shared utils (class merging, state helpers, common types).
  - `styles/components.css`: a single stylesheet based on Ark's `[data-scope]` / `[data-part]`. In Phase 1 the skeleton + base layers land; the per-component rules grow in Phase 2+.
  - Connection to `@moderno/css`: the entrypoint re-exports `@moderno/core/css`.
- `@moderno/charts-core`:
  - Pure functions over `d3-scale`, `d3-shape`, `d3-array`, `d3-path`. No DOM.
  - **Forbidden** `d3-selection` / `d3-transition`.
  - Outputs: scales, path generators, domain/tick helpers — consumable by each framework's `<svg>`.

## Functional requirements

| #    | Requirement                                                                                                                      |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| F1.1 | CVA resolves a combination of props to a deterministic set of data-attributes (same input → same output, SSR-safe).              |
| F1.2 | `components.css` is mounted on `[data-scope][data-part]`; zero baked-in colors/radii/fonts — only references to semantic tokens. |
| F1.3 | `@moderno/charts-core` exposes pure math: given data + dimensions, it returns scales and paths without touching the DOM.         |
| F1.4 | No import of `d3-selection` or `d3-transition` in the dependency tree.                                                           |
| F1.5 | `@moderno/css` re-exports tokens + `components.css` via `exports`; the consumer does not import internal subpaths.               |

## Deliverables

- `packages/core/` (tsup for JS, CSS source via `exports`).
- `packages/charts-core/`.
- Vitest tests: CVA (variant table → attributes) and charts-math (scales/paths with numeric snapshots).

## Acceptance criteria (DoD)

- [ ] Green Vitest suite for `core` and `charts-core`.
- [ ] CVA covered with cases for each variant/size defined in CONTRACT.md.
- [ ] charts-core produces correct paths/scales in Node (no DOM) → SSR-safety proof.
- [ ] `components.css` importable via `@moderno/css` and respects the Phase 0 tokens.
- [ ] Guardrail verified: grep the bundle for no `d3-selection`/`d3-transition`.

## Dependencies

- Phase 0 (tokens + `@moderno/css` + CONTRACT.md confirmed).

## Out of scope

- Components with per-framework render (Phase 2).
- Chart SVG (Phase 4 uses this math).
