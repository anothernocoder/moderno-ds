---
"@moderno/cli": minor
---

Phase 5 — Distribution. Introduce `@moderno/cli` (`init` / `add` / `update` /
`diff`) over the versioned shadcn-style registry, with a `.moderno/manifest.json`
that tracks installed versions and a content-hash guard so `update` never
clobbers locally edited files. Ships the `theme-moderno` and `theme-contrast`
registry themes (compiled by `@moderno/theme-compile`) and example blocks.
