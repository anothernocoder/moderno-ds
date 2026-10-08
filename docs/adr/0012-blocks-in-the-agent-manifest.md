---
status: accepted
---

# Blocks join the agent manifest as their own kind

Extends [ADR-0003](0003-agentic-mcp.md) (agents learn the design system from
`moderno.agent.json`) and [ADR-0011](0011-generative-ui-openui.md) (genui's
library is derived from that manifest), and follows
[ADR-0009](0009-one-file-per-component-generated-shared-lists.md) (no
hand-written lists).

## Context

The manifest lists only Primitives. So the MCP cannot point a coding agent at
`kpi-card`, and genui builds KPI cards, order summaries and tables by hand out
of `Card`, `Badge` and `Stack`. The registry already ships those as designed,
container-responsive Blocks (epic #325).

## Decision

1. **Blocks are a second list in each framework's manifest, `blocks`**, next
   to `components`. A block is not a primitive: it is installed with the CLI
   and then owned by the app, not imported from the package. Its entry says
   so: `kind: "block"` and an `install` command
   (`npx @moderno-ui/cli add kpi-card-react`) instead of an `import`.
2. **Every field is generated from the block's own files.**
   - `name`, `slug`, `description`, `frameworks` come from
     `registry/blocks/<slug>/item.json`.
   - `props` come from the React block's `<Name>Props` interface, through
     `extractProps`. The object types the props use (`KpiCardMetric`) are
     expanded into their fields under `shapes`, so a caller fills a structured
     prop without reading the source. A literal union is spelled out
     (`"negative" | "neutral" | "positive"`), not printed as its alias.
   - `composes` is the primitives the React block imports.
   - `examples` is the registry item itself, in that framework (the Example
     rule).
   - `guidance` is the docs page's `agent:` front matter, read from the
     English page, like a primitive's.
3. **A new block adds no manifest code.** props-doc finds it by its folder in
   `registry/blocks/`, and `pnpm gen` records its props hash in
   `tooling/props-doc/src/blocks.generated.ts`.
4. **`agent:check-drift` covers blocks.** It recomputes each block's props
   hash and fails when it differs from the one `pnpm gen` recorded, or when a
   block is missing from the list or still in it after deletion.
5. **genui and the MCP read the same manifest.** genui never calls the MCP at
   run time.

### Rejected: genui calls the MCP at run time

The MCP is a stdio tool for agents writing code. Calling it on every chat turn
adds round trips to a turn that already takes 10–12 s. Reading the same
manifest gives genui the same answers with no extra call, and the two cannot
drift.

### Rejected: blocks as entries of `components`

A block has no `scope`, no `parts` and no package import, and the app may
change it after install. Mixing them would make every consumer filter by kind
before using an entry.

## Consequences

- Each framework's manifest grows by every block it ships, mostly their
  source (`examples`): React's goes from about 0.2 MB to 1.1 MB. Consumers
  read it once at startup.
- `pnpm gen` runs ts-morph over the React blocks (`tsconfig.blocks.json`
  resolves their imports through `@moderno-ui/react`'s own dependencies).
- Changing a block's props interface, or a type it uses, needs `pnpm gen` in
  the same commit.
