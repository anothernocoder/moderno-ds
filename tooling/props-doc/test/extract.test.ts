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

  it("keeps only what Moderno adds to a wrapped root, and says the list is partial", () => {
    // Select.Root is Ark's, wrapped for the `size` recipe: `collection`,
    // `value` and the rest are declared in @ark-ui / @zag-js and dropped with
    // the DOM noise, so `props` is what this DS adds — not the whole API.
    const doc = selectDoc();
    expect(doc.props.map((p) => p.name)).toEqual(["size"]);
    expect(doc.propsComplete).toBe(false);
  });

  it("resolves a type the binding only re-exports", () => {
    // Dialog adds nothing to Ark's machine, so `DialogRootProps` is Ark's,
    // re-exported. Resolving it is what tells the docs "no props of our own"
    // rather than "this component was never resolved".
    const [doc] = extractProps({
      tsConfigFilePath: reactTsConfig,
      entries: [{ name: "Dialog", file: "src/dialog.tsx", type: "DialogRootProps" }],
    });
    expect(doc!.props).toEqual([]);
    expect(doc!.propsComplete).toBe(false);
  });

  it("takes a prop's default from the recipe that resolves it", () => {
    // `defaultVariants` is a value, not a type: without the entry handing it in
    // the Default column has nothing to show for a prop that plainly has one.
    const [doc] = extractProps({
      tsConfigFilePath: reactTsConfig,
      entries: [
        {
          name: "Button",
          file: "src/button.tsx",
          type: "ButtonProps",
          defaults: { size: "md", variant: "primary" },
        },
      ],
    });
    expect(doc!.props.find((p) => p.name === "size")!.default).toBe('"md"');
    expect(doc!.props.find((p) => p.name === "variant")!.default).toBe('"primary"');
  });

  it("unfolds an aliased literal union into the values a consumer can type", () => {
    // `size?: SelectSize` prints as `SelectSize`, which documents nothing.
    const size = selectDoc().props.find((p) => p.name === "size")!;
    expect(size.type).toBe('"sm" | "md" | "lg"');
  });

  it("prints a callback the way the consumer writes it", () => {
    // The printer parenthesises a function type to sit in a union with
    // `undefined`, and names a type through the file's own import alias, so a
    // chart's formatter arrived as `((value: number) => string)`.
    const [chart] = extractProps({
      tsConfigFilePath: reactTsConfig,
      entries: [{ name: "LineChart", file: "src/charts.tsx", type: "LineChartProps" }],
    });
    expect(chart!.props.find((p) => p.name === "format")!.type).toBe("(value: number) => string");
  });

  it("keeps a named non-literal type as its name", () => {
    // Expanding `CurveFactory` would trade a name the reader can look up for a
    // wall of structure.
    const [chart] = extractProps({
      tsConfigFilePath: reactTsConfig,
      entries: [{ name: "LineChart", file: "src/charts.tsx", type: "LineChartProps" }],
    });
    expect(chart!.props.find((p) => p.name === "curve")!.type).toBe("CurveFactory");
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
