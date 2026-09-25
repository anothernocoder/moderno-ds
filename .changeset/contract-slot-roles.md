---
"@moderno-ui/css": minor
"@moderno-ui/lint-core": patch
"@moderno-ui/mcp": patch
---

Every slot in `@moderno-ui/css/contract` now carries a one-line `role`, and the
contract exports `GROUP_ROLES` (what each group holds) and `TYPE_STEP_ROLES`
(what each type step sets). The contract manifest (`moderno.agent.json`, and so
`get_contract`) gains a `roles` map from each slot to its role.
