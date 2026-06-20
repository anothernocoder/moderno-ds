# PRD — Phase 3: Port (Vue, Svelte, Solid)

> Demonstrate the DS thesis: the same state machine (Ark/Zag) + the same stylesheet = parity across 4 frameworks.

## Objective

Port Button, Field, Dialog and Select to `@moderno/vue`, `@moderno/svelte` and `@moderno/solid`, reusing **the same** `components.css` and the same CVA from `@moderno/core`. Prove look and behavior parity against the Phase 2 React reference.

## Scope

- `@moderno/vue` (`@ark-ui/vue`), `@moderno/svelte` (`@ark-ui/svelte`), `@moderno/solid` (`@ark-ui/solid`): the same 4 components.
- Reuse of the single stylesheet — **zero** per-framework CSS. If a component needs new CSS, it is added to the shared `components.css` and benefits all of them.
- Svelte is additionally the docs **islands runtime** (relevant for Phase 6); its port must work as a server-only island.

## Functional requirements

| #    | Requirement                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------ |
| F3.1 | Each framework exposes the 4 components with the same public props API (English names, semantic parity).                 |
| F3.2 | The 4×4 share `data-scope`/`data-part` → the same `components.css` applies identically. No per-framework duplicated CSS. |
| F3.3 | SSR without hydration errors in the 3 new frameworks.                                                                    |
| F3.4 | Behavior parity: focus trap, keyboard, selection, error states identical to React.                                       |
| F3.5 | The Svelte component can render in `.astro` **server-only** (no `client:` directive) → static HTML, zero JS.             |

## Deliverables

- `packages/vue/`, `packages/svelte/`, `packages/solid/` publishable.
- Documented parity matrix (component × framework × state).
- Per-framework tests: render + variants + SSR smoke.

## Acceptance criteria (DoD)

- [ ] Side-by-side visual comparison of the 4 components across the 5 targets (React + 4) → identical with the same theme.
- [ ] Identical behavior verified by interaction in each framework.
- [ ] Brand switch via variables re-themes the 5 targets without touching components.
- [ ] No framework-specific CSS file introduced.
- [ ] Svelte validates static render in `.astro` without a client runtime.

## Dependencies

- Phase 2 (pattern + `components.css` for the 4 components).

## Out of scope

- Charts (Phase 4).
- Distribution / CLI (Phase 5).
- Components beyond the 4 reference ones.
