---
status: accepted
---

# Behaviour Ark does not ship is a Zag 1.x machine in core

Extends [ADR-0001](0001-platform-distribution-docs-theming.md) and
[ADR-0004](0004-absorb-predecessor-and-npm-scope.md) (a Primitive is built on
Ark wherever Ark covers it) and
[ADR-0009](0009-one-file-per-component-generated-shared-lists.md) (a component
adds files of its own). It covers what is left: behaviour Ark does not cover.

## Context

Every interactive Primitive gets its behaviour from Ark, and Ark gets it from
Zag: a Zag **machine** holds the state and the transitions, and Ark binds it in
each framework. `packages/core` held only recipes, styles and class helpers.

Epic #301 needs three behaviours Ark does not ship: a reorderable list
(SortableList, #294), a roving-focus toolbar (Toolbar, #295) and a 2D pad
(VectorPad, #297). Without one decision first, each ticket would invent its own
pattern for the same problem, four frameworks at a time.

- **Zag 2 has two of them, but only as prereleases.** `@zag-js/toolbar` and
  `@zag-js/dnd` exist only as `2.0.0-next.*`, on `@zag-js/core` 2.x. Ark 5 runs
  on Zag 1.x (1.41.2 in this repo). Two majors of `@zag-js/core` in one
  lockfile means two runtimes, two sets of types and two copies of every shared
  helper.
- **Several tickets announce changes to screen readers** (#292, #294, #300),
  and there was no shared way to do it.

## Decision

1. **Behaviour Ark does not ship is a Zag 1.x machine in `packages/core`.** It
   is written with `createMachine` from `@zag-js/core`, on the exact Zag version
   Ark resolves, and bound in each framework with `@zag-js/{react,vue,solid,svelte}`
   (`useMachine` + `normalizeProps`), exactly as Ark binds its own machines.
   The logic is written and tested once; a framework package only binds it.
2. **A machine follows Zag's own file split**, one folder per component,
   `packages/core/src/machines/<slug>/`:

   | File                | Holds                                                      |
   | ------------------- | ---------------------------------------------------------- |
   | `<slug>.anatomy.ts` | the parts, with `createAnatomy` from `@zag-js/anatomy`     |
   | `<slug>.types.ts`   | the props, the schema, the `Api` the connect returns       |
   | `<slug>.machine.ts` | the machine                                                |
   | `<slug>.connect.ts` | `connect(service, normalize)`: state → props for each part |
   | `index.ts`          | re-exports the four, as Zag's packages do                  |

   The anatomy uses the same `data-scope` / `data-part` names as the Ark-based
   Primitives, so the component stylesheet styles both the same way.

3. **The machines reach consumers through one generated barrel.** `pnpm gen`
   writes `packages/core/src/machines.ts` from `machines/*/index.ts`, one
   namespace per machine (`export * as sortableList from …`), and
   `@moderno-ui/core` re-exports it. A binding reads it like a Zag package:
   `useMachine(sortableList.machine, props)`, then
   `sortableList.connect(service, normalizeProps)`. A new machine adds its
   folder; it edits no list (ADR-0009).
4. **One version of Zag.** `@zag-js/core`, `@zag-js/anatomy`, `@zag-js/types`,
   `@zag-js/dom-query` and `@zag-js/live-region` are dependencies of
   `@moderno-ui/core`, and `@zag-js/<framework>` of each framework package, all
   pinned to the version Ark resolves, so the lockfile keeps one copy of each.
   Upgrading Ark upgrades these pins in the same change.
5. **Machines are tested once, in core.** `packages/core/test/machine.ts`
   (`runMachine`) runs a machine with Zag's framework-free runtime
   (`@zag-js/vanilla`, a dev dependency): send events, read the state, the
   context and the connected props. A machine's suite is
   `packages/core/test/machines/<slug>.test.ts`; the framework suites only
   check the binding.
6. **Screen-reader announcements go through `announce()`** from
   `@moderno-ui/core`, which wraps `@zag-js/live-region`: one visually hidden
   live region per document, created on first use, `polite` unless told
   `assertive`. On the server it does nothing.
7. **Core's sources may now use the DOM.** A machine's connect and effects read
   elements and events, so `packages/core` type-checks with the DOM lib.
   Everything that touches the DOM still runs only in the browser: nothing in
   core reads `document` while a module loads.

### Rejected: plain TypeScript controllers

A hand-written controller class per component, with a hand-written binding per
framework, needs no new dependency. It was rejected because each component
would then need four bindings for subscribing, cleaning up, spreading props and
SSR, the work `@zag-js/<framework>` already does for Ark. Four hand-written
bindings per component drift apart, which is what a shared machine is meant to
prevent.

### Rejected: the Zag 2 prereleases

`@zag-js/toolbar` and `@zag-js/dnd` would save writing two machines. They were
rejected because they need `@zag-js/core` 2.x next to Ark's 1.x, and they are
prereleases: their API can change in any `next` version.

## Migration

When Ark moves to Zag 2 stable, Toolbar and SortableList move to
`@zag-js/toolbar` and `@zag-js/dnd`, and their folders under
`packages/core/src/machines/` are removed. Their public props and parts stay the
same, so consumers see no change. VectorPad, and any other machine Zag still
lacks, moves to the Zag 2 API.

## Consequences

- A Primitive with no Ark machine adds `packages/core/src/machines/<slug>/` and
  its test `packages/core/test/machines/<slug>.test.ts` to the files it
  registers (`CLAUDE.md`, "Register a component by adding its own files").
- `@moderno-ui/core` is no longer free of dependencies: it depends on Zag.
- A component that announces a change calls `announce()`; none creates its own
  live region.
