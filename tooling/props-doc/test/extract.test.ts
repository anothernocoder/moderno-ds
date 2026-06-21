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
