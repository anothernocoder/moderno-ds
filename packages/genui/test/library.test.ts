import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createLibrary, createParser } from "@openuidev/lang-core";
import { discoverManifests, type ComponentsManifest } from "@moderno-ui/lint-core";
import { describe, expect, it } from "vitest";
import exampleManifest from "../../../docs/prd/phase-7/example.react.moderno.agent.json" with { type: "json" };
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
        "Stack(children: (string | Widget | Stack | Grid)[], direction?: "column" | "row", gap?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8") — Lays out its children in a column or a row.",
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
    for (const primitive of reactManifest.components) expect(names).toContain(primitive.name);
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
    const listed = signatures(library.prompt()).flatMap(
      (line) => line.split(" — ")[0]!.match(/\b[A-Z]\w*\b/g) ?? [],
    );
    expect(new Set(listed)).toEqual(new Set(kept));
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
