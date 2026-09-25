# @moderno-ui/lint

## 0.4.0

### Minor Changes

- 45d95a0: Close the block styling pipeline over the registry.

  `moderno-lint` gains `--registry <registry.json>`: it lints every source file a
  registry manifest ships, resolving paths against the manifest's own directory
  and reading each file's framework from its item layout
  (`blocks/pricing/solid/pricing.tsx` is Solid, not React — the only signal that
  separates the two, since both author in `.tsx`). Theme items are skipped: a
  theme's job is to carry literal brand values, and `theme-compile` already
  validates those.

  `moderno/no-hardcoded-dimension` now also flags a raw length smuggled into a
  Tailwind arbitrary value — `w-[320px]`, `max-w-[42rem]`, `-mt-[3px]` — across the
  size, spacing, radius and type families, through variant prefixes. Arbitrary
  values that are not lengths (`grid-cols-[repeat(auto-fit,minmax(0,1fr))]`,
  `bg-[url(…)]`) are untouched: they are the documented escape hatch for things the
  contract does not name.

- 96d1df9: `moderno/no-hardcoded-dimension` now flags type sizes that bypass the contract:
  Tailwind's stock `text-xs` … `text-9xl` (with the matching contract step as the
  suggested fix, e.g. `text-sm` → `text-ui-md`) and literal `font-size` values in
  CSS. Registry blocks and screens now use the contract type steps.

### Patch Changes

- 134e968: Find installed manifests under `node_modules/@moderno-ui`. Discovery looked in
  `node_modules/@moderno`, a directory no real install has since the packages
  moved to the `@moderno-ui` scope, so `@moderno-ui/mcp` and `@moderno-ui/lint`
  found no `moderno.agent.json` in a consumer project.
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

- Updated dependencies [45d95a0]
- Updated dependencies [a15305e]
- Updated dependencies [96d1df9]
- Updated dependencies [134e968]
- Updated dependencies [6078bd9]
- Updated dependencies [0ed984d]
  - @moderno-ui/lint-core@0.4.0
