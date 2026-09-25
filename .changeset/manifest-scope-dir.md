---
"@moderno-ui/lint-core": patch
"@moderno-ui/mcp": patch
"@moderno-ui/lint": patch
---

Find installed manifests under `node_modules/@moderno-ui`. Discovery looked in
`node_modules/@moderno`, a directory no real install has since the packages
moved to the `@moderno-ui` scope, so `@moderno-ui/mcp` and `@moderno-ui/lint`
found no `moderno.agent.json` in a consumer project.
