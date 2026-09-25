---
"@moderno-ui/css": minor
"@moderno-ui/mcp": patch
"@moderno-ui/lint-core": patch
"@moderno-ui/cli": patch
---

`@moderno-ui/tokens` merges into `@moderno-ui/css` (ADR-0008). One package now
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
