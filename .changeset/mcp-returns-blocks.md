---
"@moderno-ui/mcp": minor
"@moderno-ui/lint-core": minor
---

The MCP returns Blocks. `search_components` ranks the registry's blocks next to the primitives and gives each match a `kind`: a primitive has its `import`, a block its `install` command, and a block wins a tie with a primitive. `get_component_api` and `get_examples` accept a block name. `rankComponents` ranks any entry with a name, scope or description, and guidance.
