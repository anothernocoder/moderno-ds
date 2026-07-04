---
status: accepted
---

# Agentic-first surface: a local MCP server with a shared validation engine

Moderno already ships LLM-friendly _artifacts_ (per-component `.md`, `llms.txt`,
copy-as-markdown; ADR-0001, Phase 6). This ADR records the decision to go a step
further and make the DS **agentic-first**: a surface designed for coding agents
that _build_ front-ends with Moderno, not just read about it. It introduces a
Phase 7 (see [PRD](../prd/phase-7-agentic.md)) and is consistent with ADR-0001
and [ADR-0002](0002-token-contract-and-design-md.md).

## Context

The failure modes when an agent builds a front-end against a component system are
predictable: it **hallucinates component APIs**, **re-implements primitives that
already exist**, and **fights the theming model** by hardcoding colors/radii
instead of referencing the contract slots. Passive docs mitigate the first only
weakly (the agent must find and trust them) and do nothing to _verify_ output.

Moderno is multi-framework (React/Vue/Svelte/Solid + Astro), single-maintainer,
and already generates structured data the agent surface can reuse: `props-doc`
(ts-morph) JSON for `PropsTable`, `registry.json`, and `CONTRACT.md`. The
question is what interface exposes that knowledge to agents, and how to add a
**verification** loop without creating a second knowledge base that drifts from
the code.

## Decision

- **Primary interface: a local MCP server, `@moderno/mcp` (stdio).** The agent
  runs it via `npx`/`bunx` in its MCP config. Local-stdio (not hosted) because a
  single maintainer wants no ops/uptime/cost, `validate_usage` must process user
  code locally (privacy), and — decisively — a local server pinned to the
  **installed** package version answers about the API actually in the consumer's
  `node_modules`, killing the "latest docs vs installed version" mismatch. A
  hosted `moderno.style/mcp` endpoint is deferred (discovery/marketing later).

- **Scope: read + verify, not write.** Tools:
  `search_components`, `get_component_api`, `get_examples`, `get_contract`,
  `validate_usage`. File mutations stay with the existing, tested `@moderno/cli`
  (the agent shells out to `add`/`init`). The server is the _knowledge +
  verification plane_; the CLI is the _action plane_. This halves maintenance and
  keeps the server safe to host remotely later.

- **Framework-parameterized.** Every retrieval/verify tool takes
  `framework = react | vue | svelte | solid | astro`. Facts, examples and
  validation are framework-specific; the shared layers (contract slots, theming
  rules, `data-part` model, when-to-use judgment) are framework-agnostic. Handing
  an agent React and asking it to translate to Svelte reintroduces the
  hallucination this is meant to remove.

- **Knowledge = generated facts + a thin curated guidance layer.** Facts
  (props/slots/`data-part`/examples) are generated from the existing
  `props-doc` + `registry.json` + `CONTRACT.md` pipeline → **zero drift**. Curated
  guidance (intent, when-to-use-vs-alternative, gotchas, theming do/don'ts) lives
  in an **`agent:` block in each component's docs MDX front-matter** — one source
  feeding human docs, the per-component `.md`, and the manifest. A **CI gate**
  fails the build if a primitive lacks the block or if its generated props hash
  changed without the block being touched (drift becomes a red build).

- **Manifest wiring: per-package, aggregated from `node_modules`.** Each
  `@moderno/*` package emits `moderno.agent.json` in its `dist` at build (fed by
  `props-doc` + the MDX `agent:` block). `@moderno/mcp` discovers and merges these
  from the consumer's installed packages at startup, so a repo on
  `@moderno/react@1.2` gets 1.2's manifest exactly. Shared cross-cutting data
  (contract slots, theming rules) ships in `@moderno/tokens`'s manifest. No central
  bundle to fall out of sync.

- **Validation: a deterministic AST rule engine, authored once, exposed twice.**
  The rules power both the `validate_usage` MCP tool **and** a shippable
  `@moderno/lint` (ESLint plugin + CLI). Human contributors get the same
  guardrails as agents. Starter rules, all from CONTRACT.md: no hardcoded
  colors/radii (use tokens), prop validity vs manifest, no re-implemented
  primitive, `data-part` overrides target real parts, use `@moderno` not raw Ark.
  Deterministic (no LLM-judge) so it can be a CI gate.

- **Discovery: `cli init` writes an `AGENTS.md` stanza.** The stanza carries the
  golden rules + "use the `moderno` MCP for component APIs and run
  `validate_usage` before finishing." (Optional `CLAUDE.md` twin.) MCP tool
  descriptions are the secondary nudge. This is the minimal passive seed that
  points _at_ the server — no large passive knowledge base to maintain.

- **v1 scope: full coverage** (all primitives, all frameworks, validate + lint +
  init stanza) in one release. Internal build order de-risks it: land the vertical
  slice (Button/Field/Dialog/Select) first to lock the manifest schema and rule
  API, then fan out to the rest before cutting v1.

## Consequences

- The end-to-end loop: agent reads `AGENTS.md` → `search`/`get_api`/`get_examples`
  (version-accurate) → writes code → `validate_usage` catches token/prop/Ark
  violations → fixes before finishing. Grounding in, verification out.
- The curated guidance folds into Phase 6 docs authoring — one MDX surface, not a
  parallel one. The CI staleness gate makes drift structurally hard.
- `@moderno/lint` is a byproduct of the validation engine, giving human-authored
  code (and CI) the same guardrails as agents — the "lint-first" option
  deprioritized as the primary interface returns for free.
- Tradeoff (accepted): local-stdio means each consumer configures the MCP once and
  there's no zero-setup hosted reach in v1; chosen for version-accuracy, privacy,
  and zero ops.
- Tradeoff (accepted, mitigated): "everything at once" stamps the novel pieces
  (rule shapes, manifest format) across 28 primitives × 5 frameworks. Mitigation:
  the vertical-slice-first build order proves the schema before fan-out.
- New surface for a single maintainer: `@moderno/mcp`, `@moderno/lint`, the
  per-package `moderno.agent.json` build step, the MDX `agent:` gate, and the
  `init` stanza. Justified by making Moderno usable — and self-correcting — by the
  agents that will increasingly be its consumers.
