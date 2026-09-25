---
status: accepted
---

# One source per theme, a generated DESIGN.md per theme; the type scale joins the contract

Amends [ADR-0002](0002-token-contract-and-design-md.md). ADR-0002 made a root
`DESIGN.md`, plus its DTCG twin `tokens.json`, the source of truth for the
default theme, `theme-moderno`. It did not say how that source reached the
code, and in practice it never did. This ADR reverses that placement: there is
no root `DESIGN.md` or `tokens.json`, and every theme gets its own `DESIGN.md`.

## Context

By the time of this ADR, the default theme's values lived in three files that
disagreed:

- `registry/themes/theme-moderno/tokens.dtcg.json`: contract slot names, OKLCH,
  light and dark. The only one the code read: `theme-compile` built `theme.css`
  from it, and the Theme Builder imported it.
- `tokens.json` (root): the theme-factory export from Phase 0. It used its own
  names (`text-primary`, `surface-base`), hex values and a dark-only palette, and
  nothing read it.
- `DESIGN.md`'s front matter (root): the same Phase 0 values in YAML. Its prose
  described a theme that no longer shipped: dark-first, no shadows, and a 6px
  spacing step.

A root `DESIGN.md` also described one brand, in a design system that is
brand-agnostic and ships several themes (`theme-moderno`, `theme-contrast`, and
whatever the Theme Builder makes). Other themes had no guide at all, and a
project that installed one got nothing an agent could read for its rules.

Type sizes had no single source either. The contract had no size slot, so
`components.css`, the docs site and the registry blocks each carried their own
literals: a 13/14/15px control ramp, Tailwind's stock scale, and one-off sizes.

## Decision

- **A theme's `tokens.dtcg.json` is the one hand-edited source of its values**,
  `theme-moderno` included: `registry/themes/<name>/tokens.dtcg.json`, a DTCG
  file in the contract's slot names with a `light` and a `dark` scope. The
  Phase 0 root `tokens.json` is deleted, not kept as a second copy.
- **Every theme has its own `DESIGN.md`** beside its `theme.css`, in the
  google-labs format. `pnpm theme:build` writes both, and a test fails on
  drift. The `DESIGN.md` has three parts:
  - **Front matter**: the theme's values, from its `tokens.dtcg.json` plus the
    neutral defaults it inherits. The format has no dark mode, so the light
    scope uses the contract names and the dark scope is listed as `dark-*`.
    `name` and `description` come from the theme (its `name` and
    `$description`), not from hand-written YAML.
  - **System rules**: how any Moderno theme is applied (colour roles, type,
    layout, elevation, components, do's and don'ts, accessibility). They are
    derived from the token contract, identical for every theme, and name slots
    without restating values, so they cannot drift.
  - **Brand notes**: the only hand-written part, between
    `<!-- brand-notes:start -->` and `<!-- brand-notes:end -->`. A rebuild
    keeps them verbatim; a theme without notes gets a draft read off its
    values, for a person to review and rewrite.
- **There is no root `DESIGN.md`.** `CONTRACT.md` stays the root document:
  global, brand-agnostic names and rules.
- **The registry distributes each theme's `DESIGN.md`** as a `registry:file` of
  the theme item. A brand-less theme (`brand: null`) replaces the default, so a
  project installs one, and its `DESIGN.md` goes to the project root. A branded
  theme sits beside the default, so its `DESIGN.md` goes to
  `design/<name>/DESIGN.md`. Only the stylesheet is `@import`ed; `moderno add`
  never overwrites a file it did not write, so a project's own `DESIGN.md` is
  kept. The Theme Builder also exports the theme's `DESIGN.md`.
- **The type scale is part of the contract.** `--text-<step>` / `--leading-<step>`
  are extended slots for `ui-xs|sm|md|lg` (the control ramp) and `body`,
  `body-lg`, `heading-sm`, `heading`, `heading-lg`. Components, the docs site and
  registry blocks read them. The Tailwind preset maps them beside Tailwind's own
  `text-*` keys, not over them. `moderno/no-hardcoded-dimension` flags stock
  Tailwind sizes and literal `font-size` values.
- **So are font weights.** `--font-weight-normal|medium|semibold|bold` reuse
  Tailwind's own keys at its own values, on purpose: the unlayered contract
  defaults beat Tailwind's layered ones, so a stock `font-semibold` follows a
  theme that overrides the weight and changes nothing when none does.

## Consequences

- Changing a brand value is one edit and one command. A stale `theme.css` or
  `DESIGN.md` fails CI instead of shipping.
- The default theme is authored like every other theme, and no theme has a
  copy to keep in sync. The registry publishes, and the Theme Builder imports,
  the file maintainers edit.
- Every installed theme brings a guide that people and coding agents can read,
  and the rules in it match the contract the components obey.
- A new theme needs its brand notes reviewed: the first build drafts them, and
  the draft is descriptive, not the brand's voice.
- The Phase 0 values are gone: the hex palette, the `display` 96px and
  `label-sm` 10px styles, and the 6px spacing step. None of them reached the
  code, and a style comes back as a contract step once a surface needs it.
- Because a theme now writes to a consumer's project root, `add` checks the
  manifest before writing, and `update` treats a file it never wrote as a local
  edit.
