---
"@moderno-ui/cli": minor
"@moderno-ui/lint": patch
---

Install a theme's DESIGN.md with the theme.

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
