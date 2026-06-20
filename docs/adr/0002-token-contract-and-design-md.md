---
status: accepted
---

# Token contract (CONTRACT.md), neutral defaults, and the default theme (DESIGN.md)

Phase 0 establishes the styling single-source-of-truth. This ADR records where
the technical contract, the neutral package defaults, and the brand each live,
and how the two root Markdown files are named. It refines, and is consistent
with, [ADR-0001](0001-platform-distribution-docs-theming.md).

## Context

A theme-factory run produced a brand artifact pair — a `DESIGN.md` in the
**google-labs `DESIGN.md` format** (YAML front matter of token values + rationale;
monochrome, Hedvig Letters Sans) and `tokens.json` (its DTCG twin). Independently,
the Phase 0 work authored a _technical contract_: semantic slots, theming rules,
`data-scope`/`data-part`, and guardrails.

Both wanted the filename `DESIGN.md`. That collision is the source of recurring
confusion: `DESIGN.md` as a Google Labs **visual-identity format** is a different
artifact from a shadcn-style **slot contract**. Forcing both under one name makes
one masquerade as the other.

> An earlier revision of this ADR resolved the collision the opposite way — root
> `DESIGN.md` = technical contract, brand relocated to `docs/brand/`. That is now
> **reversed** (see Decision), because the root file should match the published
> `DESIGN.md` spec rather than redefine it.

## Decision

- **`CONTRACT.md` (root) is the neutral technical contract** — semantic slots,
  theming rules, `data-scope`/`data-part` convention, extended contract
  (spacing/motion/radius), and guardrails. Names and rules, no visual identity.
  The document every component must obey.
- **`DESIGN.md` (root) is the source of truth for the Moderno default theme**
  (`theme-moderno`), authored in the **google-labs `DESIGN.md` format**: YAML
  front-matter token values + human-readable rationale. Paired with **`tokens.json`**
  (DTCG twin) at the root. It supplies _values_; `CONTRACT.md` supplies _names
  and rules_.
- **`@moderno/tokens` still ships neutral values** — OKLCH grays + a system font
  stack. Components stay developable and previewable without a brand, and
  multi-brand swapping is preserved. The Moderno default theme layers on top as
  a theme, exactly like any other brand.
- **Multi-brand from day 0**: contract values may be re-mapped under
  `[data-brand="…"]`, composable with `.dark`. `@moderno/tokens` ships a
  `contrast` demo scope to exercise the mechanism.
- **CSS-first authoring in Phase 0**: tokens are written directly as `.css` (no
  JS bundler). The DTCG + `theme-compile` pipeline is deferred to themes in
  Phase 5, per ADR-0001. The root `tokens.json` is the authoring DTCG for
  `theme-moderno`, consumed by that pipeline in Phase 5.

## Consequences

- The `DESIGN.md` filename now matches the published google-labs spec, so its
  CLI (validate / compare / export) and the broader tooling recognize it.
- `CONTRACT.md` is the highest-value AI- and human-discoverable document for the
  "rules every component obeys" slot, free of brand noise.
- `CONTEXT.md` glossary updated: `CONTRACT.md` and `DESIGN.md` are now distinct
  terms, and the "Brand guidelines" entry no longer claims brand content lives
  outside the root design file.
- Phase 5's `theme-moderno` has a concrete, spec-shaped starting point
  (`DESIGN.md` + `tokens.json`) rather than a relocated reference.
- Tradeoff: bare `@moderno/tokens` previews neutral (gray), not branded, until
  `theme-moderno` loads — accepted as the price of clean multi-brand separation.
  Naming `DESIGN.md` as the _default theme_ (not the contract) keeps that
  separation explicit.
