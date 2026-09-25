# @moderno-ui/cli

## 0.4.0

### Minor Changes

- 4ef0acf: Install a theme's DESIGN.md with the theme.

  Every registry theme now ships a generated DESIGN.md beside its `theme.css`, as
  a `registry:file`. `moderno add` writes it where the theme's scope says: a
  brand-less theme (the one that replaces the default) to the project's root
  `DESIGN.md`, a branded theme to `design/<theme>/DESIGN.md`. Only a theme's
  stylesheet is appended to `moderno.css`, never its other files.

  `add` no longer overwrites a file it did not write: a different file already at
  a target (a project's own `DESIGN.md`, say) is kept and reported in the new
  `AddResult.kept`, and `update` preserves it like a local edit. `moderno diff`
  still shows the registry version.

  `moderno-lint --registry` skips every file of a theme item, not only its
  stylesheet, so the DESIGN.md is not linted as code.

### Patch Changes

- 6078bd9: `@moderno-ui/tokens` merges into `@moderno-ui/css` (ADR-0008). One package now
  ships everything the two did:

  - `@moderno-ui/css` — the token variables with their neutral defaults (`:root`
    / `.dark`) and the component stylesheet, as before.
  - `@moderno-ui/css/preset` — the Tailwind v4 preset, now defined here instead of
    re-exported.
  - `@moderno-ui/css/contract` — the token contract as data (was
    `@moderno-ui/tokens/contract`).
  - `@moderno-ui/css/moderno.agent.json` — the contract manifest `get_contract`
    answers from (was `@moderno-ui/tokens`'s). Its `package` field is now
    `@moderno-ui/css`.
  - `@moderno-ui/css/tokens.css` — the variables alone, without the component
    stylesheet, for tooling that reads them as text.

  `@moderno-ui/css` no longer depends on `@moderno-ui/tokens`, and
  `@moderno-ui/tokens` gets no further releases: it will be deprecated on npm in
  favour of `@moderno-ui/css`. If you imported `@moderno-ui/tokens/css`, its exact
  equivalent is `@moderno-ui/css/tokens.css` (the variables alone); an app that
  also wants the component stylesheet imports `@moderno-ui/css`. Replace
  `@moderno-ui/tokens/preset` and `@moderno-ui/tokens/contract` with the
  `@moderno-ui/css` subpaths above.

  The contract manifest's `package` is `@moderno-ui/css` in `@moderno-ui/lint-core`'s
  `ContractManifest` type too, `get_contract`'s not-installed error names
  `@moderno-ui/css`, and the `AGENTS.md` stanza `moderno init` writes says to keep
  brand values out of `@moderno-ui/css`.

## 0.1.0

### Minor Changes

- 464f2dc: Phase 5 — Distribution. Introduce `@moderno-ui/cli` (`init` / `add` / `update` /
  `diff`) over the versioned shadcn-style registry, with a `.moderno/manifest.json`
  that tracks installed versions and a content-hash guard so `update` never
  clobbers locally edited files. Ships the `theme-moderno` and `theme-contrast`
  registry themes (compiled by `@moderno-ui/theme-compile`) and example blocks.
