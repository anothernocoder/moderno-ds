import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { Aggregator } from "../aggregator.ts";

/** Where each component's recipe lives, one file per component. */
const RECIPES_DIR = "packages/core/src/recipes";

const MODULE_DOC = `/**
 * Component recipes — the variant tables shared by every framework binding.
 *
 * A recipe is just a \`cva\` instance: it maps public props to deterministic
 * \`data-*\` attributes on a component's root part. Recipes live in \`@moderno-ui/core\`
 * (not in the React/Vue/Svelte/Solid packages) so all bindings resolve variants
 * identically — the framework only differs in how it spreads the attributes onto
 * markup. \`components.css\` styles those attributes; the recipe and the stylesheet
 * are the two halves of one contract.
 *
 * Visual states that Ark already tracks (invalid, disabled, highlighted, open)
 * are NOT recipe variants — they surface as Ark's own \`data-*\` attributes and
 * are styled directly. Recipes only carry the choices a consumer makes via props.
 *
 * Each component's recipe sits in \`recipes/<slug>.ts\` with the variant unions
 * derived from it. Bindings import those names instead of re-deriving them from
 * the recipe tables, so a recipe change ripples to every framework through this
 * seam.
 */
`;

/** The slug of every recipe module (its file name without `.ts`), sorted. */
function recipeSlugs(root: string): string[] {
  return readdirSync(join(root, RECIPES_DIR))
    .filter((file) => file.endsWith(".ts"))
    .map((file) => basename(file, ".ts"))
    .sort();
}

/**
 * `@moderno-ui/core`'s recipe barrel: one `export *` per recipe module, so a
 * new component adds its recipe file and no ticket edits this list.
 */
export default {
  output: "packages/core/src/recipes.ts",
  source: `${RECIPES_DIR}/*.ts`,
  generate: ({ root }) =>
    `${MODULE_DOC}\n${recipeSlugs(root)
      .map((slug) => `export * from "./recipes/${slug}.js";\n`)
      .join("")}`,
} satisfies Aggregator;
