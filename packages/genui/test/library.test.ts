import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createLibrary, createParser } from "@openuidev/lang-core";
import { discoverManifests, type ComponentsManifest } from "@moderno-ui/lint-core";
import type {
  AreaChartProps,
  BarChartProps,
  BarListProps,
  DonutChartProps,
  LineChartProps,
  SparkChartProps,
} from "@moderno-ui/react";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { z } from "zod/v4";
import exampleManifest from "../../../docs/prd/phase-7/example.react.moderno.agent.json" with { type: "json" };
import { CHART_DATA_TYPES } from "../src/library/props.ts";
import { NOT_GENERATIVE } from "../src/library/simple-forms.ts";
import { createSubLibrary, fromManifest, type GenUIComponent } from "../src/server.ts";

// The real manifests, found the way @moderno-ui/mcp finds them.
const installed = discoverManifests(fileURLToPath(new URL("..", import.meta.url)));
const reactManifest = installed.components.find((manifest) => manifest.framework === "react")!;
const contract = installed.contract!;

const example = exampleManifest as unknown as ComponentsManifest;

/** A made-up component that has every kind of prop the mapping handles. */
const kitchenSink: ComponentsManifest = {
  ...example,
  components: [
    {
      name: "Widget",
      scope: "widget",
      import: 'import { Widget } from "@moderno-ui/react"',
      propsHash: "",
      propsComplete: true,
      props: [
        { name: "label", type: "string", required: false },
        { name: "size", type: "WidgetSize", required: false, default: "md" },
        { name: "count", type: "number", required: true },
        { name: "tone", type: '"calm" | "loud"', required: false },
        { name: "variant", type: "WidgetVariant", required: false },
        { name: "data", type: "readonly WidgetDatum[]", required: true },
        { name: "margin", type: "Partial<WidgetMargin>", required: false },
        { name: "ref", type: "Ref<HTMLDivElement>", required: false },
        { name: "className", type: "string", required: false },
        { name: "style", type: "CSSProperties", required: false },
        { name: "id", type: "string", required: false },
        { name: "aria-label", type: "string", required: false },
        { name: "onValueChange", type: "((value: number) => void)", required: false },
        { name: "format", type: "((value: number) => string)", required: false },
      ],
      parts: [{ name: "root" }],
      variants: { variant: ["a", "b"], size: ["sm", "md"] },
    },
  ],
};

function signatures(prompt: string): string[] {
  return prompt.split("\n").filter((line) => /^[A-Z]\w*\(/.test(line));
}

function fullLibrary(components: GenUIComponent[]) {
  return createLibrary({ components, root: "Stack" });
}

describe("fromManifest", () => {
  it("maps Button's recipe variants to enums in the prompt", () => {
    const prompt = fullLibrary(fromManifest(example, contract)).prompt();

    expect(prompt).toContain(
      'Button(variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive", size?: "sm" | "md" | "lg"',
    );
  });

  it("orders arguments required, then variants, then the rest, the same on every run", () => {
    const prompt = () => fullLibrary(fromManifest(kitchenSink, contract)).prompt();

    expect(signatures(prompt())).toMatchInlineSnapshot(`
      [
        "Widget(count: number, data: any, variant?: "a" | "b", size?: "sm" | "md", label?: string, tone?: "calm" | "loud") — Widget",
        "Stack(children: (string | Widget | Stack | Grid)[], direction?: "column" | "row", gap?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8", justify?: "start" | "center" | "end" | "between") — Lays out its children in a column or a row. justify "between" spreads a row apart, like a label and its price.",
        "Grid(children: (string | Widget | Stack | Grid)[], columns?: number, gap?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8") — Lays out its children in equal columns.",
      ]
    `);
    expect(prompt()).toBe(prompt());
  });

  it("never exposes functions, ref, className, style or DOM-only props", () => {
    const blocked = /^(ref|className|style|id|ids|dir|format|on[A-Z].*|aria-.*)$/;
    for (const manifest of [kitchenSink, reactManifest]) {
      for (const component of fromManifest(manifest, contract)) {
        const keys = Object.keys(component.props.shape);
        expect(
          keys.filter((key) => blocked.test(key)),
          component.name,
        ).toEqual([]);
      }
    }
  });

  it("runs over every primitive of the real React manifest", () => {
    const components = fromManifest(reactManifest, contract);
    const names = components.map((component) => component.name);

    expect(new Set(names).size).toBe(names.length);
    for (const primitive of reactManifest.components) {
      if (NOT_GENERATIVE.has(primitive.name)) expect(names).not.toContain(primitive.name);
      else expect(names).toContain(primitive.name);
    }
    expect(names).toContain("CardHeader");
    expect(() => fullLibrary(components).prompt()).not.toThrow();
  });

  it("parses a nested program and rejects an invalid enum", () => {
    const library = createSubLibrary(fromManifest(reactManifest, contract), ["Card", "Button"]);
    const parser = createParser(library.toJSONSchema());

    const valid = parser.parse(
      [
        "root = Stack([card])",
        'card = Card("outline", "md", [header, content])',
        'header = CardHeader([title, "Revenue"])',
        'title = CardTitle(["Monthly report"])',
        "content = CardContent([save])",
        'save = Button("primary", "md", ["Save"])',
      ].join("\n"),
    );
    expect(valid.meta.errors).toEqual([]);
    expect(valid.root?.typeName).toBe("Stack");

    const invalid = parser.parse('root = Stack([save])\nsave = Button("huge")');
    expect(invalid.meta.errors).toEqual([
      expect.objectContaining({ code: "type-mismatch", component: "Button", path: "/variant" }),
    ]);
  });

  it("gives a part the examples only self-close no children, so it never gets any", () => {
    const byName = new Map(
      fromManifest(reactManifest, contract).map((component) => [component.name, component]),
    );

    expect(Object.keys(byName.get("AvatarImage")!.props.shape)).toEqual([]);
    expect(Object.keys(byName.get("AvatarFallback")!.props.shape)).toEqual(["children"]);
  });

  it("gives a form compound its Simple form instead of its parts", () => {
    const names = fromManifest(reactManifest, contract).map((component) => component.name);
    const prompt = signatures(fullLibrary(fromManifest(reactManifest, contract)).prompt());

    expect(names.filter((name) => name.startsWith("Select"))).toEqual(["Select"]);
    expect(prompt.find((line) => line.startsWith("Select("))).toMatch(
      /^Select\(label: string, options: \(string \| \{label: string, value: string\}\)\[\], placeholder\?: string, size\?: "sm" \| "md" \| "lg"\)/,
    );
    expect(prompt.find((line) => line.startsWith("Tabs("))).toMatch(
      /^Tabs\(tabs: string\[\], children: \(string \| /,
    );
  });
});

describe("chart data", () => {
  const charts = ["BarChart", "AreaChart", "LineChart", "DonutChart", "BarList", "SparkChart"];
  const library = createSubLibrary(fromManifest(reactManifest, contract), charts);
  const parser = createParser(library.toJSONSchema());

  it("shows the series and point shapes in the prompt", () => {
    const prompt = signatures(library.prompt());
    const signature = (name: string) => prompt.find((line) => line.startsWith(`${name}(`));
    const series = (points: string) => `{name?: string, ${points}}[]`;

    expect(signature("BarChart")).toContain(`series: ${series("values: number[]")}`);
    for (const name of ["AreaChart", "LineChart"])
      expect(signature(name)).toContain(`series: ${series("points: {x: number, y: number}[]")}`);
    expect(signature("DonutChart")).toContain("data: {name?: string, value: number}[]");
    expect(signature("BarList")).toContain("data: {name: string, value: number}[]");
    expect(signature("SparkChart")).toContain("points: {x: number, y: number}[]");
  });

  it("rejects a series in the wrong shape and parses the right one clean", () => {
    const bar = (series: string) =>
      parser.parse(`root = Stack([sales])\nsales = BarChart(["W1", "W2"], 240, [${series}], 480)`);

    expect(bar('{"name": "Sales", "data": [1, 2]}').meta.errors).toEqual([
      expect.objectContaining({ component: "BarChart", path: "/series/0/values" }),
    ]);
    expect(bar('{"name": "Sales", "values": [1, 2]}').meta.errors).toEqual([]);

    const spark = parser.parse("root = Stack([trend])\ntrend = SparkChart([12, 14])");
    expect(spark.meta.errors).toEqual([
      expect.objectContaining({ code: "type-mismatch", path: "/points/0" }),
      expect.objectContaining({ code: "type-mismatch", path: "/points/1" }),
    ]);
  });

  it("parses into the data @moderno-ui/react's chart props take", () => {
    // Checked by `pnpm typecheck`: a renamed or added field in charts-core fails here.
    type Parsed<Name extends keyof typeof CHART_DATA_TYPES> = z.infer<
      ReturnType<(typeof CHART_DATA_TYPES)[Name]>
    >;
    expectTypeOf<Parsed<"BarSeries">>().toExtend<BarChartProps["series"][number]>();
    expectTypeOf<Parsed<"CartesianSeries">>().toExtend<AreaChartProps["series"][number]>();
    expectTypeOf<Parsed<"CartesianSeries">>().toExtend<LineChartProps["series"][number]>();
    expectTypeOf<Parsed<"DonutDatum">>().toExtend<DonutChartProps["data"][number]>();
    expectTypeOf<Parsed<"BarListItem">>().toExtend<BarListProps["data"][number]>();
    expectTypeOf<Parsed<"XYPoint">>().toExtend<SparkChartProps["points"][number]>();
  });
});

describe("Button's action", () => {
  it("accepts Action([@ToAssistant(…)]) after its children", () => {
    const library = createSubLibrary(fromManifest(reactManifest, contract), ["Button"]);
    expect(signatures(library.prompt()).find((line) => line.startsWith("Button("))).toContain(
      "children?: string[], action?: ActionExpression)",
    );

    const parser = createParser(library.toJSONSchema());
    const result = parser.parse(
      'root = Stack([ok])\nok = Button("primary", "md", ["OK"], Action([@ToAssistant("OK")]))',
    );
    expect(result.meta.errors).toEqual([]);
  });
});

describe("createSubLibrary", () => {
  it("keeps only the named components, their parts and the layouts", () => {
    const library = createSubLibrary(fromManifest(reactManifest, contract), ["Card", "Button"]);
    const kept = [
      "Button",
      "CardHeader",
      "CardTitle",
      "CardDescription",
      "CardContent",
      "CardFooter",
      "Card",
      "Stack",
      "Grid",
    ];

    expect(Object.keys(library.components)).toEqual(kept);
    // Component signatures only; the Action section's lines are OpenUI's.
    const listed = signatures(library.prompt())
      .filter((line) => line.split("(")[0]! in library.components)
      .flatMap((line) => line.split(" — ")[0]!.match(/\b[A-Z]\w*\b/g) ?? []);
    // `ActionExpression` is the type of Button's `action`.
    expect(new Set(listed)).toEqual(new Set([...kept, "ActionExpression"]));
  });

  it("lets the layouts hold each other, so a dashboard nests a Grid in the root Stack", () => {
    const library = createSubLibrary(fromManifest(reactManifest, contract), [
      "Card",
      "Button",
      "BarChart",
    ]);
    const prompt = signatures(library.prompt());
    expect(prompt.find((line) => line.startsWith("Stack("))).toMatch(
      /^Stack\(children: \(string \| [^)]*\bStack \| Grid\)\[\]/,
    );
    expect(prompt.find((line) => line.startsWith("Grid("))).toMatch(
      /^Grid\(children: \(string \| [^)]*\bStack \| Grid\)\[\]/,
    );

    const parser = createParser(library.toJSONSchema());
    const result = parser.parse(
      [
        "root = Stack([grid])",
        "grid = Grid([row, row])",
        'row = Stack([save], "row")',
        'save = Button("primary")',
      ].join("\n"),
    );
    expect(result.meta.errors).toEqual([]);
  });
});

describe("src/library", () => {
  it("imports no React", () => {
    const dir = new URL("../src/library/", import.meta.url);
    for (const file of readdirSync(dir)) {
      const source = readFileSync(new URL(file, dir), "utf8");
      expect(source, file).not.toMatch(
        /from "(react|react-dom|@openuidev\/react-lang|@moderno-ui\/react)(\/.*)?"/,
      );
    }
  });
});
