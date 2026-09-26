import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractProps, type ComponentDoc } from "../src/index.ts";
import { ENTRIES } from "../src/manifest.ts";

const reactTsConfig = fileURLToPath(
  new URL("../../../packages/react/tsconfig.json", import.meta.url),
);

/** The extraction in manifest order; the stability test runs a second one. */
const docs = extractProps({ tsConfigFilePath: reactTsConfig, entries: ENTRIES });

/**
 * The manifest is the wiring between the Primitives and their PropsTables.
 * Resolving it here means a renamed export or moved file fails in tests, not
 * at docs build time.
 */
describe("props-doc manifest", () => {
  it("resolves every entry against the real @moderno-ui/react types", () => {
    expect(docs.map((d) => d.name)).toEqual(ENTRIES.map((e) => e.name));
    for (const doc of docs) {
      // An empty table means the workspace-origin filter dropped everything —
      // the entry points at the wrong type.
      expect(doc.props.length, `${doc.name} extracted no props`).toBeGreaterThan(0);
    }
  });

  it("prints each prop's type the same whatever order the components are extracted in", () => {
    // TypeScript prints a union's members in the order it first met each
    // literal: without a fixed order, resolving Badge ("outline") before
    // Button reorders Button's `variant` union.
    const reversed = extractProps({
      tsConfigFilePath: reactTsConfig,
      entries: [...ENTRIES].reverse(),
    });
    const typesByComponent = (list: ComponentDoc[]) =>
      Object.fromEntries(
        list.map((doc) => [doc.name, doc.props.map((prop) => `${prop.name}: ${prop.type}`)]),
      );
    expect(typesByComponent(reversed)).toEqual(typesByComponent(docs));
  });

  it("lists a variant prop's union members in the order its recipe declares them", () => {
    const button = docs.find((doc) => doc.name === "Button")!;
    expect(button.props.find((prop) => prop.name === "variant")!.type).toBe(
      '"primary" | "secondary" | "outline" | "ghost" | "destructive"',
    );
  });

  it("documents each component once", () => {
    const names = ENTRIES.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
