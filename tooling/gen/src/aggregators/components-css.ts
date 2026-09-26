import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Aggregator } from "../aggregator.ts";

const PARTIALS_DIR = "packages/core/src/styles/components";

/** Opens the stylesheet: header comment, layer order and the base layer. */
const BASE = "_base.css";
/** The `[hidden]` rule that must outrank every part rule, so it closes the layer. */
const HIDDEN = "_hidden.css";

/**
 * The shared stylesheet every framework imports (`@moderno-ui/core/styles/components.css`).
 *
 * One partial per scope holds that scope's bare rules; this wraps them in
 * `@layer moderno.components`, sorted by scope, between `_base.css` and
 * `_hidden.css`. The result stays one flat file at the published path, with no
 * `@import`, so a consumer's bundler needs nothing to resolve.
 */
export default {
  output: "packages/core/src/styles/components.css",
  source: `${PARTIALS_DIR}/*.css`,
  generate: ({ root }) => {
    const dir = join(root, PARTIALS_DIR);
    const read = (file: string) => readFileSync(join(dir, file), "utf8");
    const scopes = readdirSync(dir)
      .filter((file) => file.endsWith(".css") && !file.startsWith("_"))
      .sort();
    const layer = [...scopes, HIDDEN].map((file) => indent(read(file))).join("\n");
    return `${read(BASE)}\n@layer moderno.components {\n${layer}}\n`;
  },
} satisfies Aggregator;

/** Nests a partial one level, inside the layer block; blank lines stay blank. */
function indent(css: string): string {
  return css.replace(/^(?=.)/gm, "  ");
}
