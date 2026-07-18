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
  it("resolves every entry against the real @moderno/react types", () => {
    const docs = extractProps({ tsConfigFilePath: reactTsConfig, entries: ENTRIES });
    expect(docs.map((d) => d.name)).toEqual(ENTRIES.map((e) => e.name));
    for (const doc of docs) {
      // An empty table means the workspace-origin filter dropped everything —
      // the entry points at the wrong type.
      expect(doc.props.length, `${doc.name} extracted no props`).toBeGreaterThan(0);
    }
  });

  it("documents each component once", () => {
    const names = ENTRIES.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
