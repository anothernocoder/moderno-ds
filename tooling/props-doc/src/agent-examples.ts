/**
 * Curated, framework-specific usage snippets for `moderno.agent.json`'s
 * `components[].examples` (schema: `docs/prd/phase-7/moderno.agent.schema.json`).
 *
 * Unlike `props`/`parts`/`variants` (identical across bindings by contract,
 * resolved once against the canonical React source in `agent-manifest.ts`),
 * example *syntax* is inherently framework-specific — a Vue template isn't a
 * JSX snippet with the tags renamed. So each component's `examples` are
 * hand-authored in its own file, `src/components/<slug>.ts`, one entry per
 * framework, verified against each binding's own test fixtures so the snippets
 * stay real, working usage rather than aspirational markup. `AGENT_EXAMPLES` is
 * generated from those files. `@moderno-ui/mcp`'s `get_examples` tool reads
 * these straight off the built manifest — no separate example store to keep in
 * sync.
 */
export { AGENT_EXAMPLES } from "./components.generated.ts";
