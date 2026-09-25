---
status: accepted
---

# One source per concept in the token system

Amends [ADR-0001](0001-platform-distribution-docs-theming.md),
[ADR-0002](0002-token-contract-and-design-md.md) and
[ADR-0003](0003-agentic-mcp.md), and extends the pattern of
[ADR-0007](0007-default-theme-single-source-and-type-scale.md). ADR-0007 gave
every theme one hand-edited source (its `tokens.dtcg.json`) and generated the
rest with a drift test. This ADR applies the same rule to the token system
itself: the token contract, the neutral defaults and the packages that ship
them.

## Context

By the time of this ADR, each concept in the token system had more than one
hand-edited home:

- **Adding a slot touched four hand-edited files.** `contract.ts` (the contract
  as data), `tokens.css` (its neutral default), `preset.css` (its Tailwind
  mapping) and `CONTRACT.md` (a table row). Tests caught some of the gaps, but
  every copy was written by hand.
- **Slot roles lived in three places.** `CONTRACT.md`'s slot tables said what
  each slot is for; `tooling/theme-compile/src/design-md.ts` carried its own
  copies (`COLOR_GROUP_ROLES`, `MOTION_ROLES`, `WEIGHT_ROLES` and hand-written
  role lines) to write each theme's `DESIGN.md`; and the contract data, the one
  source every other slot list derives from, had none.
- **Values had two authoring paths.** Every registry theme is a DTCG file that
  `theme-compile` validates and compiles. The neutral defaults were hand-written
  CSS in `@moderno-ui/tokens`, with the reasons for a value kept in CSS
  comments. They were checked, but by tests written for them alone: one in
  `@moderno-ui/tokens` that every contract slot is defined, and ones in
  `theme-compile` that they clear WCAG AA on every contract pair. A failure in
  either already failed CI; what they lacked was the validation path every
  theme goes through.
- **`@moderno-ui/css` was a thin re-export.** Its `index.css` imported the
  variables from `@moderno-ui/tokens` and the component stylesheet from
  `@moderno-ui/core`, and its `preset.css` only re-exported
  `@moderno-ui/tokens/preset`. `@moderno-ui/tokens` owned the variables, the
  preset, the contract and the agent manifest. Two published packages for the
  tokens, one of them pointing at the other, and consumers told to use the
  pointer.

Nobody consumes the published packages yet, so merging them costs no one a
migration. That window closes with the first real consumer.

## Decision

1. **`@moderno-ui/tokens` merges into `@moderno-ui/css`.** One package ships the
   variables and the component stylesheet (`@moderno-ui/css`, as today), the
   Tailwind preset, the contract as data (`@moderno-ui/css/contract`) and the
   agent manifest (`@moderno-ui/css/moderno.agent.json`). `@moderno-ui/css`
   stays the only public CSS specifier, as it already was for consumers. It
   depends on `@moderno-ui/core` for the component stylesheet, and
   `@moderno-ui/core` does not depend on it, so the merge adds no cycle. The published
   `@moderno-ui/tokens` (0.1.0, 0.3.0) is **deprecated on npm, not
   unpublished**, once `@moderno-ui/css` publishes with the merged contents:
   deprecation points anyone who installed it at the new package, and
   unpublishing would break their lockfiles. Why now: nobody consumes either
   package yet, so there is nothing to migrate.
2. **The contract is data.** `contract.ts` is the one hand-edited source of
   slot names, types, groups, contrast pairs and roles: every slot carries a
   one-line role, and the group-level descriptions live beside it.
   `CONTRACT.md` keeps the rules (the golden rule, the layers, the theming
   rules, `data-scope`/`data-part`, the responsive policy, the guardrails). It
   names the groups in prose and points at the contract for the slots, and it
   never enumerates slots or restates values, so it cannot fall behind. Each
   theme's generated `DESIGN.md` takes slot roles from the contract instead of
   its own copy in `design-md.ts`, and the agent manifest carries them too.
3. **The neutral defaults are authored like every theme.** A DTCG file in
   `@moderno-ui/css`, with a light and a dark scope and every slot of the
   contract (the extended ones included, since this is where their defaults
   come from), is compiled by `theme-compile` into the neutral stylesheet. A
   drift test fails when the stylesheet is stale, and `theme-compile` validates
   the file as it does a theme: every slot required and the WCAG AA pairs
   checked. The comments that explain a neutral value move into the file as
   `$description`. There is one way to author values.
4. **Not done: generating `preset.css`.** The Tailwind preset stays
   hand-written. It is stable, about 150 lines, and already guarded by tests
   that compare it with the contract. The `--container-*` block is the reason a
   generator would not pay: it is not `inline` (a container query cannot read
   `var()`, so Tailwind needs literal lengths) and it resets the namespace first
   (`--container-*: initial`), each with a comment saying why. A generator that
   reproduces those exceptions would be harder to read than the CSS it writes.
   Adding a slot still means one line here, and the tests say which.

## Consequences

- Adding a slot is two hand edits: the slot and its role in `contract.ts`, and
  its neutral value in the DTCG file (plus one line in `preset.css` when the
  slot needs a Tailwind utility). The neutral stylesheet, each theme's
  `DESIGN.md` and the agent manifest are generated, and a stale one fails CI.
- A role is written once. `CONTRACT.md`, the themes' `DESIGN.md` and the agent
  manifest can no longer describe a slot three different ways.
- The neutral defaults and the themes share one authoring path and one
  validation path: `theme-compile` checks the neutral file the way it checks a
  theme, instead of the neutral defaults relying on tests written for them
  alone. This ADR does not change what `theme-compile` enforces: a missing slot
  stops the compile, and a failing contrast pair is reported as a warning, for
  the neutral file as for every theme.
- One package for consumers, the CLI's `init` and the MCP server to name.
  Everything that names `@moderno-ui/tokens` (the component stylesheet, the MCP
  server, the lint rules, the tooling, the docs site) moves to
  `@moderno-ui/css` in the same change.
- `npm deprecate @moderno-ui/tokens` is a human step after the first publish of
  the merged `@moderno-ui/css`, not part of the code change.
- `CONTRACT.md` reads as rules, not a reference table. Someone looking for the
  list of slots reads `contract.ts` (or the Theme Builder, or a theme's
  `DESIGN.md`), and the prose says so.
- The `[data-brand="contrast"]` demo block leaves the neutral stylesheet
  before decision 3 (#252). `theme-contrast` in the registry has proven the
  multi-brand switch since Phase 5, and a generated neutral stylesheet has the
  shape of a brand-less theme: `:root` and `.dark` only.
