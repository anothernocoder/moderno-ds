import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { Aggregator } from "../aggregator.ts";

/** Where each component's playground section lives, one file per component. */
const SECTIONS_DIR = "packages/vue/playground/sections";

const MODULE_DOC = `/**
 * SSR playground — the Vue twin of the React harness. It mounts one section
 * per component, each in its default (closed) state, so the SSR suite can
 * assert a stable server string and the open popovers' teleported markup.
 *
 * A section lives in \`sections/<slug>.ts\` and says which SSR hazard its
 * component exercises; \`test/ssr/<slug>.test.ts\` asserts that section's
 * server string on its own. \`open\` mounts the Dialog and Select popovers to
 * exercise the harder portal/id path.
 */
`;

/** The slug of every section module (its file name without `.ts`), sorted. */
function sectionSlugs(root: string): string[] {
  return readdirSync(join(root, SECTIONS_DIR))
    .filter((file) => file.endsWith(".ts"))
    .map((file) => basename(file, ".ts"))
    .sort();
}

/** `radio-group` → `RadioGroupSection`: the name a section is imported under. */
function sectionName(slug: string): string {
  const pascal = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return `${pascal}Section`;
}

/**
 * Vue's SSR playground entry: a static import of every section and one mount
 * of each, so a new component adds its section file and no ticket edits this
 * list. Static imports, like every generated TypeScript file (ADR-0009).
 */
export default {
  output: "packages/vue/playground/app.ts",
  source: `${SECTIONS_DIR}/*.ts`,
  generate: ({ root }) => {
    const names = sectionSlugs(root).map((slug) => ({ slug, name: sectionName(slug) }));
    const imports = names
      .map(({ slug, name }) => `import ${name} from "./sections/${slug}.js";\n`)
      .join("");
    const mounts = names.map(({ name }) => `        h(${name}, { open: props.open }),\n`).join("");
    return `${MODULE_DOC}import { defineComponent, h } from "vue";
${imports}
export const App = defineComponent({
  name: "VueSsrApp",
  props: {
    /** Mount the Dialog + Select popovers open (exercises the portal/id path). */
    open: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h("main", {}, [
${mounts}      ]);
  },
});
`;
  },
} satisfies Aggregator;
