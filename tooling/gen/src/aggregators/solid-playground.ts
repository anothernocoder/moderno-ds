import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { Aggregator } from "../aggregator.ts";

/** Where each component's playground section lives, one file per component. */
const SECTIONS_DIR = "packages/solid/playground/sections";

const MODULE_DOC = `/**
 * SSR playground — the Solid twin of the React harness.
 *
 * It mounts one section per component, each in its default (closed) state.
 * A section lives in \`sections/<slug>.tsx\` and says which SSR hazard its
 * component exercises; \`test/ssr/<slug>.ssr.test.tsx\` asserts that section's
 * server string on its own.
 *
 * \`open\` mounts the Dialog and Select popovers open so the SSR test can
 * exercise the portal/id path.
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
 * Solid's SSR playground entry: a static import of every section and one
 * mount of each, so a new component adds its section file and no ticket edits
 * this list. Static imports because `pnpm gen` runs without Vite (ADR-0009),
 * and `tsc` and the SSR vitest project read the file as it is.
 */
export default {
  output: "packages/solid/playground/app.tsx",
  source: `${SECTIONS_DIR}/*.tsx`,
  generate: ({ root }) => {
    const slugs = sectionSlugs(root);
    const imports = slugs
      .map((slug) => `import ${componentName(slug)} from "./sections/${slug}.jsx";\n`)
      .join("");
    const mounts = slugs
      .map((slug) => `      <${componentName(slug)} open={props.open ?? false} />\n`)
      .join("");
    return `${MODULE_DOC}${imports}
export interface AppProps {
  /** Mount the Dialog + Select popovers open (exercises the portal/id path). */
  open?: boolean;
}

export function App(props: AppProps) {
  return (
    <main>
${mounts}    </main>
  );
}
`;
  },
} satisfies Aggregator;
