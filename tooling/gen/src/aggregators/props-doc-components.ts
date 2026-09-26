import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { Aggregator } from "../aggregator.ts";

/** Where each component's props-doc source lives, one file per component. */
const COMPONENTS_DIR = "tooling/props-doc/src/components";

const MODULE_DOC = `/**
 * Every component file in \`components/\`, sorted by slug, split into the lists
 * props-doc reads: \`ENTRIES\` (\`manifest.ts\`), \`AGENT_COMPONENTS\`
 * (\`agent-manifest.ts\`) and \`AGENT_EXAMPLES\` (\`agent-examples.ts\`).
 *
 * Static imports, not a glob or a \`readdir\`: the bins run under
 * \`node --experimental-strip-types\` and tsup bundles \`agent-manifest\` into
 * \`dist\`, and both only follow imports they can see.
 */
`;

/** The slug of every component file (its file name without `.ts`), sorted. */
function componentSlugs(root: string): string[] {
  return readdirSync(join(root, COMPONENTS_DIR))
    .filter((file) => file.endsWith(".ts"))
    .map((file) => basename(file, ".ts"))
    .sort();
}

/**
 * A slug as an import name: `pin-input` → `pinInputComponent`. The suffix
 * keeps a slug that is a reserved word (`switch`) a valid identifier.
 */
function importName(slug: string): string {
  const camel = slug.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
  return `${camel}Component`;
}

/**
 * props-doc's component lists, generated so a new component adds its file in
 * `tooling/props-doc/src/components/` and no ticket edits a list.
 */
export default {
  output: "tooling/props-doc/src/components.generated.ts",
  source: `${COMPONENTS_DIR}/*.ts`,
  generate: ({ root }) => {
    const slugs = componentSlugs(root);
    const imports = slugs
      .map((slug) => `import ${importName(slug)} from "./components/${slug}.ts";\n`)
      .join("");
    const list = slugs.map((slug) => `  ${importName(slug)},\n`).join("");
    return (
      `${MODULE_DOC}import { assembleComponents } from "./component-definition.ts";\n` +
      `${imports}\n` +
      `export const { ENTRIES, AGENT_COMPONENTS, AGENT_EXAMPLES } = assembleComponents([\n` +
      `${list}]);\n`
    );
  },
} satisfies Aggregator;
