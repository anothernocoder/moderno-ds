/**
 * What one Primitive tells props-doc about itself, in a file of its own:
 * `src/components/<slug>.ts` (ADR-0009). A new component adds that file and
 * edits no list: `pnpm gen` writes `components.generated.ts`, which imports
 * every file and hands them to `assembleComponents`.
 */
import type { ComponentEntry } from "./index.ts";
import type { AgentComponentSpec, AgentExample, Framework } from "./agent-manifest.ts";

/** Curated usage snippets per framework, keyed by component name. */
export type AgentExamples = Record<string, Partial<Record<Framework, AgentExample[]>>>;

export interface ComponentDefinition extends Omit<AgentComponentSpec, "propsEntry"> {
  /**
   * Where the component's own props interface lives in `@moderno-ui/react`.
   * Omitted when it declares none (Dialog): it then gets no PropsTable and an
   * empty `props` list in `moderno.agent.json`.
   */
  props?: Pick<ComponentEntry, "file" | "type">;
  /**
   * Framework-specific usage for `moderno.agent.json`'s `examples`. Syntax
   * differs per framework, so each snippet is hand-written and checked
   * against that binding's own tests.
   */
  examples: Partial<Record<Framework, AgentExample[]>>;
}

/** The three lists the rest of props-doc reads, built from the component files. */
export interface ComponentLists {
  /** Components with a props interface worth a PropsTable (`manifest.ts`). */
  ENTRIES: ComponentEntry[];
  /** One agent spec per component (`agent-manifest.ts`). */
  AGENT_COMPONENTS: AgentComponentSpec[];
  /** Usage snippets per component and framework (`agent-examples.ts`). */
  AGENT_EXAMPLES: AgentExamples;
}

/** Splits the component files into the lists, keeping their order. */
export function assembleComponents(definitions: readonly ComponentDefinition[]): ComponentLists {
  const lists: ComponentLists = { ENTRIES: [], AGENT_COMPONENTS: [], AGENT_EXAMPLES: {} };
  for (const { props, examples, ...spec } of definitions) {
    const propsEntry: ComponentEntry | undefined = props
      ? { name: spec.name, ...props, ...(spec.variants ? { variants: spec.variants } : {}) }
      : undefined;
    if (propsEntry) lists.ENTRIES.push(propsEntry);
    lists.AGENT_COMPONENTS.push(propsEntry ? { ...spec, propsEntry } : spec);
    lists.AGENT_EXAMPLES[spec.name] = examples;
  }
  return lists;
}
