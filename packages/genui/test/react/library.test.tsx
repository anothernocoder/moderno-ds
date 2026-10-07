import { fileURLToPath } from "node:url";
import { createParser } from "@openuidev/lang-core";
import { discoverManifests } from "@moderno-ui/lint-core";
import { describe, expect, it } from "vitest";
import { examples } from "../../playground/examples.ts";
import { createReactLibrary } from "../../src/react.ts";
import { createSubLibrary, fromManifest } from "../../src/server.ts";

const installed = discoverManifests(fileURLToPath(new URL("../..", import.meta.url)));
const reactManifest = installed.components.find((manifest) => manifest.framework === "react")!;
const components = fromManifest(reactManifest, installed.contract!);

describe("createReactLibrary", () => {
  it("gives every component of the React manifest a renderer", () => {
    const library = createReactLibrary(components);

    for (const { name } of components) {
      expect(library.components[name]?.component, name).toBeTypeOf("function");
    }
  });

  it("fails when a component has no @moderno-ui/react counterpart", () => {
    const [button] = components.filter((component) => component.name === "Button");
    expect(() => createReactLibrary([{ ...button!, name: "Hologram" }])).toThrow(/"Hologram"/);
  });

  it("keeps each schema, so the prompt is the neutral library's", () => {
    const neutral = createSubLibrary(components, ["Card", "Button", "BarChart", "Alert"]);
    const react = createReactLibrary(Object.values(neutral.components));

    expect(react.prompt()).toBe(neutral.prompt());
  });

  it("parses every playground example with no errors", () => {
    const parser = createParser(createReactLibrary(components).toJSONSchema());

    for (const example of examples) {
      expect(parser.parse(example.response).meta.errors, example.title).toEqual([]);
    }
  });
});
