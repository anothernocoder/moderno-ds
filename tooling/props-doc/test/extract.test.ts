import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractProps, type ComponentDoc } from "../src/index.ts";

const reactTsConfig = fileURLToPath(
  new URL("../../../packages/react/tsconfig.json", import.meta.url),
);

function buttonDoc(): ComponentDoc {
  const [doc] = extractProps({
    tsConfigFilePath: reactTsConfig,
    entries: [{ name: "Button", file: "src/button.tsx", type: "ButtonProps" }],
  });
  return doc!;
}

describe("extractProps — Button (react)", () => {
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

  it("calls the list incomplete when a dependency declares real props", () => {
    // Select.Root is Ark's, wrapped for the `size` recipe: `collection`,
    // `value` and the rest are declared in @ark-ui / @zag-js and dropped with
    // the DOM noise, so `props` is not the component's whole API.
    const [doc] = extractProps({
      tsConfigFilePath: reactTsConfig,
      entries: [{ name: "Select", file: "src/select.tsx", type: "ModernoSelectRootProps" }],
    });
    expect(doc!.props.map((p) => p.name)).toEqual(["size"]);
    expect(doc!.propsComplete).toBe(false);
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
