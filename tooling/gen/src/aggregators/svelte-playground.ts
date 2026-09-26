import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { Aggregator } from "../aggregator.ts";

/** Where each component's playground section lives, one file per component. */
const SECTIONS_DIR = "packages/svelte/playground/sections";

const MODULE_DOC = `<!--
  SSR playground — the Svelte twin of the React harness, and the proof of F3.5:
  this component renders server-only (no client: directive) to static HTML, i.e.
  it works as an Astro island with zero client runtime. \`open\` mounts the Dialog
  + Select popovers.

  It mounts one section per component. A section lives in
  \`sections/<Name>.svelte\` and says what its component proves on the server;
  \`test/ssr/<slug>.ssr.test.ts\` asserts that section's server string on its own.
-->
`;

/** `RadioGroup` → `radio-group`: the slug a section is sorted by. */
function slugOf(sectionName: string): string {
  return sectionName.replace(/(?<=[a-z0-9])([A-Z])/g, "-$1").toLowerCase();
}

/** The name of every section component (its file name without `.svelte`), sorted by slug. */
function sectionNames(root: string): string[] {
  return readdirSync(join(root, SECTIONS_DIR))
    .filter((file) => file.endsWith(".svelte"))
    .map((file) => basename(file, ".svelte"))
    .map((name) => ({ name, slug: slugOf(name) }))
    .sort((a, b) => (a.slug < b.slug ? -1 : 1))
    .map(({ name }) => name);
}

/**
 * Svelte's SSR playground entry: an import of every section and one mount of
 * each, handed `open`, so a new component adds its section file and no ticket
 * edits this list.
 */
export default {
  output: "packages/svelte/playground/App.svelte",
  source: `${SECTIONS_DIR}/*.svelte`,
  generate: ({ root }) => {
    const names = sectionNames(root);
    const imports = names
      .map((name) => `  import ${name} from "./sections/${name}.svelte";\n`)
      .join("");
    const mounts = names.map((name) => `  <${name} {open} />\n`).join("");
    return `${MODULE_DOC}<script lang="ts">
${imports}
  let { open = false }: { open?: boolean } = $props();
</script>

<main>
${mounts}</main>
`;
  },
} satisfies Aggregator;
