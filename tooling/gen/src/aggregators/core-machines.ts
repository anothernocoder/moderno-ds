import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Aggregator } from "../aggregator.ts";

/** Where each machine lives, one folder per component (ADR-0010). */
const MACHINES_DIR = "packages/core/src/machines";

const MODULE_DOC = `/**
 * Component machines — the behaviour Ark does not ship, as Zag 1.x machines
 * (ADR-0010).
 *
 * Each machine sits in \`machines/<slug>/\` with Zag's own file split
 * (\`<slug>.anatomy.ts\`, \`<slug>.types.ts\`, \`<slug>.machine.ts\`,
 * \`<slug>.connect.ts\`) and an \`index.ts\` that re-exports them. It is exported
 * here as one namespace, so a binding reads it like a Zag package:
 * \`useMachine(toolbar.machine, props)\`, then
 * \`toolbar.connect(service, normalizeProps)\`.
 */
`;

/** The slug of every machine folder that has an `index.ts`, sorted. */
function machineSlugs(root: string): string[] {
  const dir = join(root, MACHINES_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, "index.ts")))
    .map((entry) => entry.name)
    .sort();
}

/** `sortable-list` → `sortableList`: the namespace a machine is exported under. */
function namespaceName(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * `@moderno-ui/core`'s machine barrel: one namespace export per machine folder,
 * so a new machine adds its folder and no ticket edits this list. With no
 * machine yet it is an empty module, which `index.ts` can already re-export.
 */
export default {
  output: "packages/core/src/machines.ts",
  source: `${MACHINES_DIR}/*/index.ts`,
  generate: ({ root }) => {
    const slugs = machineSlugs(root);
    const exports = slugs.length
      ? slugs
          .map((slug) => `export * as ${namespaceName(slug)} from "./machines/${slug}/index.js";\n`)
          .join("")
      : "export {};\n";
    return `${MODULE_DOC}\n${exports}`;
  },
} satisfies Aggregator;
