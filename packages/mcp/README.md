# @moderno-ui/mcp

A local stdio MCP server that tells coding agents how to use Moderno. It reads `moderno.agent.json` from the `@moderno-ui/*` packages installed in your project, once at startup, so every answer matches the installed versions.

## Set up

```json
{
  "mcpServers": {
    "moderno": {
      "command": "npx",
      "args": ["-y", "@moderno-ui/mcp"]
    }
  }
}
```

Start the agent from the project root. Needs Node 22 or later.

## Tools

| Tool                | Input                | Returns                                                                        |
| ------------------- | -------------------- | ------------------------------------------------------------------------------ |
| `search_components` | `query`, `framework` | Primitives and blocks ranked by intent, with how to get them and when to use.  |
| `get_component_api` | `name`, `framework`  | A primitive's props, `data-part`s and variants, or a block's props and shapes. |
| `get_examples`      | `name`, `framework`  | Working snippets in that framework's own syntax.                               |
| `get_contract`      | none                 | Token slots, the dark-mode and multi-brand model, the `data-part` convention.  |
| `validate_usage`    | `code`, `framework`  | Rule findings. An empty list means clean.                                      |

`framework` is one of `react`, `vue`, `svelte`, `solid` or `astro`.

## Blocks

The tools return the registry's blocks next to the primitives: ready-made sections like `KpiCard`, `OrderSummary` or `Table`. A block is copied into your app with the CLI, so it comes with an `install` command instead of an `import`.

```
search_components({ query: "kpi", framework: "react" })
→ { matches: [{ name: "KpiCard", kind: "block", install: "npx @moderno-ui/cli add kpi-card-react", … }, …] }
```

`get_component_api` and `get_examples` take a block name too. Use a block when one fits; compose primitives only for what no block covers.

Full guide: [Using Moderno with agents](https://moderno.style/en/using-with-agents/).
