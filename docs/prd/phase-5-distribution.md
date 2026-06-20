# PRD — Phase 5: Distribution

> Hybrid model operational: primitives via npm (already publishable), blocks/themes via registry + shadcn-style CLI with versioned `update`/`diff`.

## Objective

Make the DS installable and updatable: versioned `registry.json`, `@moderno/cli` (init/add/update/diff + manifest), example blocks, two themes (`theme-moderno` + `theme-contrast`) and the `tooling/theme-compile` pipeline (`pnpm theme:build`).

## Scope

- `registry/registry.json`: versioned items (semver per item) + `registryDependencies`. Source in the repo; public URL served from docs at `/r/` (Phase 6).
- `@moderno/cli` (`@moderno/cli`), a wrapper over shadcn's registry model — not a CLI from scratch:
  - `init` — scaffolds `src/styles/moderno.css` with the correct imports.
  - `add` — installs blocks/themes; allows **eject** of primitives.
  - `update` / `diff` — updates copied items using registry versions + `.moderno/manifest.json`.
  - Runners: bun, pnpm, npm.
- Example blocks (copy items, one variant per framework): subset of auth/pricing/dashboard shell/data table/settings/empty states.
- Themes: `theme-moderno` (complete OKLCH ramps light+dark, semantic aliases in both scopes) and `theme-contrast` (synthetic, to demonstrate the multi-brand switch).
- `tooling/theme-compile`: validates and emits `theme.css` from `tokens.dtcg.json`; WCAG AA warnings. Shared with the Theme Builder (Phase 6) and CI.
- npm publishing via Changesets + GitHub Actions (`pnpm publish -r`).

## Functional requirements

| #    | Requirement                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| F5.1 | `moderno init` creates `src/styles/moderno.css` with `@import "@moderno/css"` (+ a theme line after `add`). The user imports a single file. |
| F5.2 | `moderno add <block\|theme>` copies the item and records the version in `.moderno/manifest.json`.                                           |
| F5.3 | `moderno add` can eject a primitive (escape hatch) into the consumer project.                                                               |
| F5.4 | `moderno update` overwrites an **unedited** primitive/item without conflict; `diff` shows changes vs. the installed version.                |
| F5.5 | The CLI works with bun, pnpm and npm as runners; default registry URL overridable (`components.json` / `MODERNO_REGISTRY_URL`).             |
| F5.6 | `pnpm theme:build` validates `tokens.dtcg.json` → emits `theme.css` with WCAG AA warnings; fails in CI on an invalid schema.                |
| F5.7 | `theme-moderno` and `theme-contrast` coexist via `[data-brand]` composed with `.dark`.                                                      |

## Deliverables

- `registry/registry.json` + items in `registry/blocks/`, `registry/themes/`.
- `tooling/cli/` (`@moderno/cli`).
- `tooling/theme-compile/`.
- Changesets + GitHub Actions release pipeline.
- `.moderno/manifest.json` schema documented.

## Acceptance criteria (DoD)

- [ ] In a clean project: `init` → `add theme-moderno` → `add <block>` leaves a working app with a single CSS import.
- [ ] `update` on an unedited ejected primitive applies without conflict (brief acceptance criterion).
- [ ] `diff` reports changes correctly on an edited item.
- [ ] Installation verified with all 3 runners (bun/pnpm/npm).
- [ ] `pnpm theme:build` produces valid `theme.css` + DTCG and emits contrast warnings.
- [ ] Switching `theme-moderno` ↔ `theme-contrast` via `[data-brand]` works in a demo.
- [ ] Changesets release dry-run publishes the `@moderno/*` set.

## Dependencies

- Phases 2–4 (primitives + charts to compose blocks and validate themes).
- Phase 0 (DTCG tokens + contract for theme-compile).

## Out of scope

- Docs site and Theme Builder UI (Phase 6) — even though they share `theme-compile`.
- Registry hosting on `moderno.style` (Phase 6 serves `/r/`).
- Full block catalog; v1 delivers a representative subset.
