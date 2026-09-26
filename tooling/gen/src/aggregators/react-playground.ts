import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { Aggregator } from "../aggregator.ts";

/** Where each component's playground section lives, one file per component. */
const SECTIONS_DIR = "packages/react/playground/sections";

const MODULE_DOC = `/**
 * SSR playground — the reusable harness that validates Moderno's second
 * guarantee: server-render + hydrate with zero React warnings.
 *
 * It mounts one section per component, each in its default (closed) state.
 * A section lives in \`sections/<slug>.tsx\` and says which SSR hazard its
 * component exercises; \`test/ssr/<slug>.test.tsx\` asserts that section's
 * server string on its own.
 *
 * The same tree is \`renderToString\`-ed on the server and \`hydrateRoot\`-ed on the
 * client. \`open\` mounts the Dialog and Select popovers so the SSR test can
 * exercise the harder hazard the spec calls out — portal content + \`useId\`-based
 * \`aria-controls\`/\`aria-activedescendant\` wiring must still hydrate clean.
 * Phases 3–4 reuse this shape for the other frameworks.
 */
`;

/** The slug of every section module (its file name without `.tsx`), sorted. */
function sectionSlugs(root: string): string[] {
  return readdirSync(join(root, SECTIONS_DIR))
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => basename(file, ".tsx"))
    .sort();
}

/** `radio-group` → `RadioGroupSection`: the name a section is imported under. */
function componentName(slug: string): string {
  const pascal = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return `${pascal}Section`;
}

/**
 * React's SSR playground entry: a static import of every section and one
 * mount of each, so a new component adds its section file and no ticket edits
 * this list. Static imports because React's tsconfig type-checks the
 * playground with `types: ["node"]`, where `import.meta.glob` does not exist.
 */
export default {
  output: "packages/react/playground/app.tsx",
  source: `${SECTIONS_DIR}/*.tsx`,
  generate: ({ root }) => {
    const slugs = sectionSlugs(root);
    const imports = slugs
      .map((slug) => `import ${componentName(slug)} from "./sections/${slug}.js";\n`)
      .join("");
    const mounts = slugs.map((slug) => `      <${componentName(slug)} open={open} />\n`).join("");
    return `${MODULE_DOC}${imports}
export interface AppProps {
  /** Mount the Dialog + Select popovers open (exercises the portal/id path). */
  open?: boolean;
}

export function App({ open = false }: AppProps) {
  return (
    <main>
${mounts}    </main>
  );
}
`;
  },
} satisfies Aggregator;
