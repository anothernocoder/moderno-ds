# PRD — Phase 7: Agentic-first

> A surface for coding agents that _build_ front-ends with Moderno: a local MCP
> server (read + verify) over version-accurate per-package manifests, plus a
> shared validation engine. Architecture in
> [ADR-0003](../adr/0003-agentic-mcp.md); do not re-decide it here.

## Reference artifacts

- [`phase-7/moderno.agent.schema.json`](phase-7/moderno.agent.schema.json) — JSON Schema for the per-package manifest (components + contract variants).
- [`phase-7/example.react.moderno.agent.json`](phase-7/example.react.moderno.agent.json) — filled example with real Button/Select/Dialog/Field data (props, parts, variants, guidance).
- [`phase-7/validate-rules.md`](phase-7/validate-rules.md) — the starter deterministic rule set behind `validate_usage` and `@moderno/lint`.

## Objective

Let an agent build a Moderno front-end without hallucinating APIs, re-implementing
existing primitives, or fighting the theming model — and let it **verify** its own
output before finishing. Grounding in (accurate, version-pinned retrieval),
verification out (deterministic lint).

## Scope

- **`@moderno/mcp`** — local stdio MCP server. Five tools, all framework-parameterized
  (`framework = react | vue | svelte | solid | astro`):
  - `search_components` — find the right primitive by intent.
  - `get_component_api` — props/slots/`data-part`s (generated facts).
  - `get_examples` — framework-specific snippets.
  - `get_contract` — theming rules, token slots, `data-part` model (shared).
  - `validate_usage` — deterministic AST lint of a snippet/file.
- **Per-package manifest** — each `@moderno/*` package emits `moderno.agent.json`
  in `dist` at build (from `props-doc` + the MDX `agent:` block). The MCP aggregates
  them from the consumer's `node_modules` at startup. Shared contract data rides in
  `@moderno/tokens`.
- **`@moderno/lint`** — ESLint plugin + CLI over the same rule engine that powers
  `validate_usage`. Same rules for humans, CI, and agents.
- **Curated guidance** — an `agent:` block in each component's docs MDX front-matter
  (intent, when-to-use-vs-alternative, gotchas, theming notes). One source for human
  docs, per-component `.md`, and the manifest.
- **CI drift gate** — build fails if a primitive lacks an `agent:` block, or if its
  generated props hash changed without the block being touched.
- **Discovery** — `@moderno/cli init` writes an `AGENTS.md` stanza (golden rules +
  "use the `moderno` MCP; run `validate_usage` before finishing"); optional `CLAUDE.md` twin.

## Functional requirements

| #    | Requirement                                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| F7.1 | `npx @moderno/mcp` (and `bunx`) starts a stdio MCP server exposing the five tools with valid schemas.                                              |
| F7.2 | Every tool accepts and honors a `framework` argument; examples/validation returned are correct for that framework.                                 |
| F7.3 | The server reads `moderno.agent.json` from the consumer's `node_modules`; answers reflect the **installed** version of each `@moderno/*` package.  |
| F7.4 | Each shipped `@moderno/*` package contains a generated `moderno.agent.json` in `dist`; `@moderno/tokens` carries the shared contract/theming data. |
| F7.5 | `validate_usage` flags, deterministically: hardcoded colors/radii, invalid props vs manifest, re-implemented primitives, bad `data-part` targets, raw Ark usage. |
| F7.6 | The same rules run via `@moderno/lint` as an ESLint plugin and a CLI; results match `validate_usage`.                                              |
| F7.7 | Every primitive's docs MDX has an `agent:` front-matter block; the manifest exposes its guidance.                                                  |
| F7.8 | CI fails on a missing `agent:` block or a stale one (props hash changed, block untouched).                                                         |
| F7.9 | `moderno init` writes an `AGENTS.md` stanza with the golden rules and MCP/validate instructions.                                                   |

## Deliverables

- `packages/mcp/` — `@moderno/mcp`, publishable, runnable via npx/bunx.
- `packages/lint/` — `@moderno/lint` (ESLint plugin + CLI) over the shared rule engine.
- Per-package `moderno.agent.json` emit wired into each package's build (extends `tooling/props-doc`).
- `agent:` MDX front-matter across all primitive docs + the CI drift gate.
- `moderno init` extended to write the `AGENTS.md` stanza.
- Docs page: "Using Moderno with agents" (MCP setup, the loop, the golden rules).

## Acceptance criteria (DoD)

- [ ] Vertical slice (Button/Field/Dialog/Select) proves the loop end-to-end first; manifest schema + rule API frozen before fan-out.
- [ ] An agent in a sample repo installs Moderno, configures `@moderno/mcp`, and builds a screen using only server-retrieved APIs — no hallucinated props.
- [ ] `get_component_api` for a repo pinned to an older `@moderno/react` returns that version's API, not latest.
- [ ] `validate_usage` catches a hardcoded color, an invalid prop, and a raw-Ark import in a sample snippet; `@moderno/lint` reports the same three.
- [ ] Removing an `agent:` block or bumping props without updating it turns CI red.
- [ ] `moderno init` produces an `AGENTS.md` that, when present, leads a fresh agent to call the MCP and run `validate_usage`.
- [ ] Full coverage: all primitives × all frameworks present in the manifests.

## Dependencies

- Phase 5 (`registry.json`, `@moderno/cli`) — `init` stanza + CLI action plane.
- Phase 6 (docs MDX, `props-doc`, per-component `.md`) — the `agent:` block rides docs authoring; manifest reuses `props-doc`.

## Out of scope

- Hosted remote MCP (`moderno.style/mcp`) — deferred discovery/marketing surface.
- Write tools in the MCP (scaffold/add/init) — mutations stay with `@moderno/cli`.
- LLM-judge validation — `validate_usage` is deterministic only.
- Blocks/charts guidance depth beyond primitives (widen after v1 loop is proven).
