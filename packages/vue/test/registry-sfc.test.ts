// @vitest-environment node
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import { describe, expect, it } from "vitest";
import { registryFiles } from "../../lint/src/registry.ts";

/**
 * (`node` rather than the project's jsdom default: under jsdom `import.meta.url`
 * is not a `file:` URL, and this suite only reads files.)
 *
 * Every `.vue` file the registry ships has to survive `compileScript` and
 * `compileTemplate` — the passes `@vitejs/plugin-vue` runs on every
 * `<script setup>` SFC before a consumer's build sees it.
 *
 * This gate exists because three tickets shipped Vue items that do not compile
 * at all. `moderno-lint --registry` reads the sources as *text*, and the docs
 * only ever mount the Svelte copies, so nothing in CI ever handed a registry
 * SFC to the Vue compiler. The failure was `withDefaults` factory defaults
 * pointing at a `const` in the same `<script setup>`
 * (`checkInvalidScopeReference`, an unconditional guard): four files, one
 * three-line shape, invisible to every other gate and fatal on the consumer's
 * first `vite build`.
 *
 * Compiling is the floor, not the bar — `registry-render.ssr.test.ts` runs the
 * same files, because a `<script setup>` can compile and still throw the first
 * time it paints. This suite is the half that names *which* compiler pass
 * rejected the file.
 *
 * The registry manifest is the set, for the reason `registry.ts` gives: what
 * CI compiles is exactly what the CLI would copy into a consumer project.
 *
 * It lives in `packages/vue` rather than beside the other registry gates in
 * `packages/lint` because `vue/compiler-sfc` is resolvable here and nowhere
 * else in the workspace — the compiler is the whole point of the check, so the
 * check goes where the compiler is.
 */

const manifest = fileURLToPath(new URL("../../../registry/registry.json", import.meta.url));
const root = fileURLToPath(new URL("../../../", import.meta.url));

const sfcs = registryFiles(manifest)
  .filter((file) => file.path.endsWith(".vue"))
  .map((file) => ({ item: file.item, path: file.path, label: relative(root, file.path) }));

describe("registry Vue SFCs compile", () => {
  it("ships at least one Vue item, so an empty set cannot pass this gate", () => {
    expect(sfcs.length).toBeGreaterThan(0);
  });

  it.each(sfcs)("$label ($item)", ({ path, label }) => {
    const { descriptor, errors } = parse(readFileSync(path, "utf8"), { filename: path });
    expect(errors.map(String), `${label} failed to parse`).toEqual([]);
    expect(() => compileScript(descriptor, { id: label })).not.toThrow();

    const template = compileTemplate({
      source: descriptor.template?.content ?? "",
      filename: path,
      id: label,
    });
    expect(template.errors.map(String), `${label} failed to compile its template`).toEqual([]);
  });
});
