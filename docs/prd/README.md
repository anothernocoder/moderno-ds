# PRDs by phase — Moderno DS

One PRD per phase of the plan in [`docs/brief.md`](../brief.md). Each PRD translates the plan (what/order) into a verifiable contract: scope, deliverables, requirements, acceptance criteria (DoD) and out of scope.

Platform decisions already made live in [ADR-0001](../adr/0001-platform-distribution-docs-theming.md) and the glossary in [`CONTEXT.md`](../../CONTEXT.md). The PRDs do **not** re-decide architecture; they reference it.

| Phase | PRD                                                      | Summary                                                                         | Gate                                     |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------- |
| 0     | [phase-0-foundation.md](phase-0-foundation.md)           | Monorepo, `@moderno/tokens`, `@moderno/css`, CONTRACT.md + DESIGN.md            | Token contract confirmed                 |
| 1     | [phase-1-core.md](phase-1-core.md)                       | `@moderno/core` (CVA, utils, components.css) + `@moderno/charts-core` (d3-math) | Pure helpers + math with tests           |
| 2     | [phase-2-react-reference.md](phase-2-react-reference.md) | Button, Field, Dialog, Select in React 19 end-to-end                            | SSR + theming validated                  |
| 3     | [phase-3-port.md](phase-3-port.md)                       | Port of those 4 to Vue, Svelte, Solid                                           | Look + behavior parity                   |
| 4     | [phase-4-charts.md](phase-4-charts.md)                   | line/area/bar/scatter (math + SVG per framework)                                | SSR + theming via `--chart-*`            |
| 5     | [phase-5-distribution.md](phase-5-distribution.md)       | `registry.json`, `@moderno/cli`, blocks, 2 themes, theme-compile                | `add`/`update`/`diff` work               |
| 6     | [phase-6-docs.md](phase-6-docs.md)                       | Bilingual Astro site + Theme Builder + registry `/r/`                           | en/es docs with parity + builder exports |

## Convention

Each phase confirms its DoD before moving on to the next (brief rule: "proceed in order, confirm at the end of each one"). Phase 0 has an explicit human gate: confirm the token contract before writing components.
