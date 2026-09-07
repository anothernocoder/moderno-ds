---
status: accepted
---

# Absorb the predecessor `moderno` and take over the `@moderno-ui` npm scope

There are two design-system repos with the same brand, the same maintainer and
the same npm scope: `anothernocoder/moderno` (the **predecessor**: Zag.js used
directly, `--md-*` brand tokens, `[data-theme]` dark-by-default, Starlight docs,
39 primitives, 63 blocks, 17 screens, 4 flows) and this repo, `moderno-ds`
(Ark UI, shadcn-style token contract, `.dark`, plain Astro docs, registry + CLI).
This ADR records that **`moderno-ds` is the successor**: the predecessor's
inventory is *source material* to be re-implemented here, not code to be merged,
and its npm packages are superseded under the same scope.

## Context

`moderno` published `@moderno-ui/react|vue|svelte|solid@0.2.1`,
`@moderno-ui/tokens@0.1.0`, plus `@moderno-ui/styles`, `class-contract`,
`chart-core`, `registry` and the unscoped `create-moderno-ui`. `moderno-ds`
renamed itself from `@moderno` to `@moderno-ui` and needed to publish. The two
code bases are not API-compatible (Zag vs Ark anatomy; `--md-*` vs the shadcn
contract), so a consumer upgrading `@moderno-ui/react` from 0.2.1 to the next
version gets a different component library.

Alternatives considered: publish `moderno-ds` under a new scope (keeps 0.2.1
consumers safe, throws away the brand and splits discovery); merge the two repos
(inherits two behaviour engines and two token vocabularies for one maintainer);
keep both alive (two DSs, one person).

## Decision

- **Same scope, one owner.** `moderno-ds` publishes `@moderno-ui/*` from
  **0.3.0**; the 0.x range is used deliberately so the API break is a minor bump,
  with the break called out in the changelog. No jump to 1.0 (that would promise
  stability the DS does not have yet).
- **Superseded packages are deprecated, not unpublished:** `styles` →
  `@moderno-ui/css`, `class-contract` → `@moderno-ui/core`, `chart-core` →
  `@moderno-ui/charts-core`, `registry` and `create-moderno-ui` →
  `@moderno-ui/cli`. Deprecation keeps 0.2.1 installs working.
- **The predecessor repo is frozen, then archived.** Its release workflow is
  removed immediately (an accidental `0.2.2` publish would move npm's `latest`
  below 0.3.0). The repo is archived on GitHub, with a README pointer and a
  redirect from its GitHub Pages docs to `moderno.style`, once the absorption is
  complete.
- **Absorption is a re-implementation, not a port.** Zag-backed primitives are
  rewritten on Ark (ADR-0001 mandates Ark for cross-framework parity); Ark's
  anatomy and naming win wherever Ark covers a component (`Drawer` not `Sheet`,
  `Switch` not `Toggle`, `RadioGroup` not `Radio`, `Field` + `Input` instead of
  a combined `Input`). CSS-only primitives and chart math are carried over and
  restyled onto the token contract. Blocks, screens and flows are re-authored
  against the new primitives and renamed to singular kebab-case.
- **Theme:** the predecessor's Midday-derived `DESIGN.md` is already the source
  of `theme-moderno` here; no new theme is created. The contract gains
  `--font-serif` and a three-step elevation scale so the brand's display face
  and overlay separation are expressible (see CONTRACT.md).

## Consequences

- Consumers on `@moderno-ui/*@0.2.x` must migrate; there is no codemod.
- Until archival, the predecessor is read-only reference material; no fixes land
  there.
- `docs/parity-matrix.md` and the registry grow to cover the absorbed inventory;
  the predecessor's MDX prose (already bilingual) may be reused as a starting
  point for docs pages.
