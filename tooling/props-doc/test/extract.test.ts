import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractProps, type ComponentDoc } from "../src/index.ts";

const reactTsConfig = fileURLToPath(
  new URL("../../../packages/react/tsconfig.json", import.meta.url),
);

function selectDoc(): ComponentDoc {
  const [doc] = extractProps({
    tsConfigFilePath: reactTsConfig,
    entries: [{ name: "Select", file: "src/select.tsx", type: "ModernoSelectRootProps" }],
  });
  return doc!;
}

function buttonDoc(): ComponentDoc {
  const [doc] = extractProps({
    tsConfigFilePath: reactTsConfig,
    entries: [{ name: "Button", file: "src/button.tsx", type: "ButtonProps" }],
  });
  return doc!;
}

describe("extractProps (react)", () => {
  it("keeps the recipe variant props the consumer sets", () => {
    const doc = buttonDoc();
    const names = doc.props.map((p) => p.name);
    expect(names).toContain("variant");
    expect(names).toContain("size");
  });

  it("drops inherited DOM/React attributes", () => {
    const names = buttonDoc().props.map((p) => p.name);
    expect(names).not.toContain("onClick");
    expect(names).not.toContain("className");
  });

  it("calls the list complete when only native attributes were dropped", () => {
    expect(buttonDoc().propsComplete).toBe(true);
  });

  it("keeps the headless machine's props on a wrapped root", () => {
    // Select.Root is Ark's, wrapped only to fold in the `size` recipe, so
    // `collection` and `onValueChange` are as much its API as `size` is — and
    // nothing real is left to drop.
    const doc = selectDoc();
    const names = doc.props.map((p) => p.name);
    expect(names).toContain("size");
    expect(names).toContain("collection");
    expect(names).toContain("onValueChange");
    expect(names).not.toContain("className");
    expect(doc.propsComplete).toBe(true);
  });

  it("calls the list incomplete when a real prop's origin is filtered out", () => {
    // The same root under a filter that keeps only the binding's own file:
    // Ark's props are dropped and they are not native attributes, so the list
    // is no longer the whole API and `valid-props` must not judge by it.
    const [doc] = extractProps({
      tsConfigFilePath: reactTsConfig,
      entries: [{ name: "Select", file: "src/select.tsx", type: "ModernoSelectRootProps" }],
      include: (declFilePath) => declFilePath.endsWith("/packages/react/src/select.tsx"),
    });
    expect(doc!.props.map((p) => p.name)).toEqual(["size"]);
    expect(doc!.propsComplete).toBe(false);
  });

  it("resolves a type the binding only re-exports", () => {
    // Dialog adds no props of its own: `DialogRootProps` is Ark's, re-exported.
    const [doc] = extractProps({
      tsConfigFilePath: reactTsConfig,
      entries: [{ name: "Dialog", file: "src/dialog.tsx", type: "DialogRootProps" }],
    });
    expect(doc!.props.map((p) => p.name)).toContain("modal");
  });

  it("unfolds an aliased literal union into the values a consumer can type", () => {
    // `size?: SelectSize` prints as `SelectSize`, which documents nothing.
    const size = selectDoc().props.find((p) => p.name === "size")!;
    expect(size.type).toBe('"sm" | "md" | "lg"');
  });

  it("keeps a named non-literal type as its name", () => {
    // Expanding `ListCollection<T>` would trade a name the reader can look up
    // for a wall of structure.
    const collection = selectDoc().props.find((p) => p.name === "collection")!;
    expect(collection.type).toContain("ListCollection");
  });

  it("collapses a multi-line JSDoc summary onto one line", () => {
    const defaultValue = selectDoc().props.find((p) => p.name === "defaultValue")!;
    expect(defaultValue.description).toBeDefined();
    expect(defaultValue.description).not.toContain("\n");
  });

  it("strips import() path qualifiers from cross-package types", () => {
    const [chart] = extractProps({
      tsConfigFilePath: reactTsConfig,
      entries: [{ name: "LineChart", file: "src/charts.tsx", type: "LineChartProps" }],
    });
    const curve = chart!.props.find((p) => p.name === "curve")!;
    expect(curve.type).toBe("CurveFactory");
    const series = chart!.props.find((p) => p.name === "series")!;
    expect(series.type).not.toContain("import(");
  });

  it("resolves the variant union type and marks it optional", () => {
    const variant = buttonDoc().props.find((p) => p.name === "variant")!;
    expect(variant.required).toBe(false);
    expect(variant.type).toContain('"primary"');
    expect(variant.type).toContain('"destructive"');
    expect(variant.type).not.toContain("undefined");
  });
});
