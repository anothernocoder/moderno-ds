---
status: accepted
---

# One source for the default theme's values; the type scale joins the contract

Amends [ADR-0002](0002-token-contract-and-design-md.md). ADR-0002 made `DESIGN.md`
plus its DTCG twin `tokens.json` the source of truth for `theme-moderno`. It did
not say how that source reached the code, and in practice it never did.

## Context

By the time of this ADR, the default theme's values lived in three files that
disagreed:

- `registry/themes/theme-moderno/tokens.dtcg.json`: contract slot names, OKLCH,
  light and dark. The only one the code read: `theme-compile` built `theme.css`
  from it, and the Theme Builder imported it.
- `tokens.json` (root): the theme-factory export from Phase 0. It used its own
  names (`text-primary`, `surface-base`), hex values and a dark-only palette, and
  nothing read it.
- `DESIGN.md`'s front matter: the same Phase 0 values in YAML. Its prose described
  a theme that no longer shipped: dark-first, no shadows, and a 6px spacing step.

Type sizes had no single source either. The contract had no size slot, so
`components.css`, the docs site and the registry blocks each carried their own
literals: a 13/14/15px control ramp, Tailwind's stock scale, and one-off sizes.

## Decision

- **`tokens.json` at the repo root is the one hand-edited source of
  `theme-moderno`'s values.** It is a DTCG file in the contract's slot names,
  with a `light` and a `dark` scope: the shape `theme-compile` already consumes.
  Its `style.moderno.theme` extension names the theme it authors.
- **Everything else is derived by `pnpm theme:build`, and a test fails on
  drift:**
  - `registry/themes/theme-moderno/tokens.dtcg.json`, a byte-for-byte copy (what
    the registry publishes and the Theme Builder imports);
  - `registry/themes/theme-moderno/theme.css`, compiled as for every theme;
  - `DESIGN.md`'s front matter, rendered from `tokens.json` plus the neutral
    defaults it inherits. The google-labs format has no dark mode, so the light
    scope uses the contract names and the dark scope is listed as `dark-*`.
- **`DESIGN.md`'s body is rationale only.** It names slots and explains them, and
  does not restate values, so it cannot drift from them. Its `version`, `name`
  and `description` stay hand-written, because they describe the document rather
  than the theme.
- **The type scale is part of the contract.** `--text-<step>` / `--leading-<step>`
  are extended slots for `ui-xs|sm|md|lg` (the control ramp) and `body`,
  `body-lg`, `heading-sm`, `heading`, `heading-lg`. Components, the docs site and
  registry blocks read them. The Tailwind preset maps them beside Tailwind's own
  `text-*` keys, not over them. `moderno/no-hardcoded-dimension` flags stock
  Tailwind sizes and literal `font-size` values.

Other registry themes are unchanged: each is still authored as the
`tokens.dtcg.json` in its own directory. Only the default theme is authored at
the root, beside the `DESIGN.md` that explains it.

## Consequences

- Changing a brand value is one edit and one command. A stale `DESIGN.md`, theme
  file or registry copy fails CI instead of shipping.
- `DESIGN.md` loses its Phase 0 values: the hex palette, the `display` 96px and
  `label-sm` 10px styles, and the 6px spacing step. None of them reached the
  code, and a style comes back as a contract step once a surface needs it.
- The registry copy duplicates `tokens.json` on disk. That is accepted because
  the registry publishes theme files from the theme's directory, and the copy is
  generated and guarded, never edited.
