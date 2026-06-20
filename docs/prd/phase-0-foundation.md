# PRD — Phase 0: Foundation

> Monorepo + token contract. **Human gate:** confirm the token contract before writing any component (Phase 2+).

## Objective

Establish the monorepo skeleton and the single source of truth for styling: DTCG tokens in OKLCH → CSS vars + Tailwind v4 preset, with a public CSS entrypoint (`@moderno/css`) and the technical contract written in `CONTRACT.md`. Everything else depends on this layer.

## Scope

- Monorepo scaffold: pnpm workspaces, Node 22 LTS (`engines.node >= 22`), TypeScript 5 strict, ESM-only, Prettier + ESLint, Vitest configured at the root level. No Turborepo.
- `@moderno/tokens` package: shadcn-style semantic slot contract, neutral OKLCH defaults (light `:root` + dark `.dark`), Tailwind v4 preset (`@theme inline`), CSS vars output. **No brand identity.**
- `@moderno/css` package: thin entrypoint that re-exports `@moderno/tokens/css` (+ placeholder for `@moderno/core/css` arriving in Phase 1) via `package.json` `exports`.
- `CONTRACT.md`: token contract, extended contract (spacing/motion/radius), theming rules, `data-scope`/`data-part` mapping, guardrails. **Not** a brand guide.
- `DESIGN.md` (+ `tokens.json`): source of truth for the Moderno **default theme** (`theme-moderno`) — token values + rationale, in google-labs `DESIGN.md` format. Supplies values for the contract slots defined in `CONTRACT.md`.
- Multi-brand architecture from day 0: swappable variables in `:root` / `.dark` / `[data-brand="…"]`.

## Functional requirements

| #    | Requirement                                                                                                                                                                                                                                                                                                                                                                             |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F0.1 | `pnpm install` from the root resolves the workspace without errors.                                                                                                                                                                                                                                                                                                                     |
| F0.2 | `@moderno/tokens` exports CSS vars for the **entire** minimum contract: `--background`, `--foreground`, `--card(-foreground)`, `--popover(-foreground)`, `--primary(-foreground)`, `--secondary(-foreground)`, `--muted(-foreground)`, `--accent(-foreground)`, `--destructive(-foreground)`, `--border`, `--input`, `--ring`, `--radius`, `--font-sans`, `--font-mono`, `--chart-1…5`. |
| F0.3 | Extended contract present: `--spacing-1…8`, `--motion-instant\|fast\|normal`, `--radius`, `--radius-full`.                                                                                                                                                                                                                                                                              |
| F0.4 | All colors in OKLCH, with a dark variant in `.dark`.                                                                                                                                                                                                                                                                                                                                    |
| F0.5 | The Tailwind v4 preset maps utilities → variables (`--color-primary: var(--primary)`) so that runtime override works.                                                                                                                                                                                                                                                                   |
| F0.6 | `@moderno/css` importable as `@import "@moderno/css"` without exposing internal paths (`dist/`, subpaths).                                                                                                                                                                                                                                                                              |
| F0.7 | `CONTRACT.md` documents the golden rule: _components are not edited; they are themed via variables and varied via props._                                                                                                                                                                                                                                                               |

## Deliverables

- `packages/tokens/` publishable (CSS-first, no JS bundler).
- `packages/css/` publishable.
- `CONTRACT.md` at the root (neutral technical contract).
- `DESIGN.md` + `tokens.json` at the root (default-theme source of truth).
- `pnpm-workspace.yaml`, root `package.json`, base tsconfig, lint/format configs.

## Acceptance criteria (DoD)

- [ ] Token contract **confirmed with the maintainer** (explicit brief gate).
- [ ] A test HTML importing only `@moderno/css` renders with the neutral defaults and responds to `.dark`.
- [ ] Changing `[data-brand="x"]` re-maps variables without touching the base tokens.
- [ ] The Tailwind v4 preset generates utilities that resolve to the semantic variables.
- [ ] `CONTRACT.md` covers the contract + theming rules + guardrails.

## Dependencies

None (initial phase).

## Out of scope

- Components, CVA, charts (Phase 1+).
- Brand identity / `theme-moderno` (lives in the registry, Phase 5).
- CLI, docs, registry.
