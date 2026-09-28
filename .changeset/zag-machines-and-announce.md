---
"@moderno-ui/core": minor
"@moderno-ui/react": patch
"@moderno-ui/vue": patch
"@moderno-ui/svelte": patch
"@moderno-ui/solid": patch
---

`@moderno-ui/core` gains `announce(message, { politeness })`: it reads a
message to screen-reader users through one visually hidden live region per
document (`@zag-js/live-region`), `polite` unless `assertive` is asked for,
and does nothing on the server. Core now depends on Zag (`@zag-js/core`,
`@zag-js/anatomy`, `@zag-js/types`, `@zag-js/dom-query`,
`@zag-js/live-region`) and is ready to export the Zag machines of Primitives
Ark does not cover (ADR-0010). The framework packages depend on their
`@zag-js/<framework>` binding, pinned to the Zag version Ark uses.
