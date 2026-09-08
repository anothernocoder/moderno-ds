import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractProps } from "../src/index.ts";
import { ENTRIES } from "../src/manifest.ts";

const reactTsConfig = fileURLToPath(
  new URL("../../../packages/react/tsconfig.json", import.meta.url),
);

/**
 * The manifest is the wiring between the Primitives and their PropsTables.
 * Resolving it here means a renamed export or moved file fails in tests, not
 * at docs build time.
 */
describe("props-doc manifest", () => {
  it("resolves every entry against the real @moderno-ui/react types", () => {
    const docs = extractProps({ tsConfigFilePath: reactTsConfig, entries: ENTRIES });
    expect(docs.map((d) => d.name)).toEqual(ENTRIES.map((e) => e.name));
    // An empty table usually means the workspace-origin filter dropped
    // everything because the entry points at the wrong type. Dialog is the one
    // honest empty: it adds nothing to Ark's machine, and its entry exists so
    // the docs can say that rather than fall back to a generic empty state.
    const empty = docs.filter((d) => d.props.length === 0).map((d) => d.name);
    expect(empty).toEqual(["Dialog"]);
  });

  it("documents each component once", () => {
    const names = ENTRIES.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
