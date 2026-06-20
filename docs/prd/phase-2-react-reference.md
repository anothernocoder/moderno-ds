# PRD — Phase 2: Reference implementation (React 19)

> Prove the full pattern in a single framework before porting. Button, Field, Dialog, Select end-to-end.

## Objective

Implement 4 primitives in `@moderno/react` with Ark UI + the single `data-part`-based stylesheet, validating the DS's two central guarantees against a real target: **same look via variables** and **SSR with no hydration errors**. This phase locks down the pattern that Phases 3 and 4 replicate.

## Scope

- `@moderno/react` (React 19, Ark `@ark-ui/react`): **Button, Field/Label, Dialog, Select**.
- Each component: Ark headless markup + CVA from `@moderno/core` for props → data-attributes; zero inline styling.
- Styling 100% from `@moderno/core/styles/components.css` via `[data-scope][data-part]` — the same CSS the other frameworks will use.
- Deliberate selection of the 4: covers static (Button), form + a11y (Field), portal + focus-trap + SSR (Dialog), and collection + popover + keyboard (Select) — the spectrum of Ark complexity.

## Functional requirements

| #    | Requirement                                                                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- |
| F2.1 | All 4 components render with Ark; public props map to `data-variant`/`data-size`/etc. via CVA.                                    |
| F2.2 | Styling comes only from `components.css`; no color/radius/font baked into the component.                                          |
| F2.3 | Switching brand (`[data-brand]` / replacing tokens) re-themes all 4 without editing their source.                                 |
| F2.4 | SSR (renderToString) + hydration without warnings in React 19. Dialog/Select (portal, ids) hydrate clean.                         |
| F2.5 | Ark behavior intact: Dialog focus trap, Select keyboard navigation and selection, Field label/control association + error states. |

## Deliverables

- `packages/react/` publishable with the 4 components exported.
- Minimal SSR app/playground (e.g. a test route) to validate hydration.
- `components.css` rules for `button`, `field`, `dialog`, `select` (shareable).
- Tests: render + variants; SSR smoke.

## Acceptance criteria (DoD)

- [ ] All 4 look correct with neutral defaults and with a test brand theme, **without touching components**.
- [ ] SSR string + hydrate with no console errors in React 19.
- [ ] Key interactions verified (focus trap, keyboard in Select, error state in Field).
- [ ] `components.css` for these 4 is written in a framework-agnostic way (conceptually validated for reuse in Phase 3).
- [ ] Maintainer confirms the pattern before porting.

## Dependencies

- Phase 1 (`@moderno/core` CVA + `components.css`).
- Phase 0 (tokens).

## Out of scope

- Vue/Svelte/Solid (Phase 3).
- The rest of the catalog primitives (post-v1 or iteration after parity).
- Charts, blocks, CLI, docs.
