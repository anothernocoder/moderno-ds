import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { discoverManifests, type AggregatedManifests } from "../src/manifests.ts";
import { getExamples } from "../src/tools/get-examples.ts";
import { createConsumerFixture, type ConsumerFixture } from "./helpers/consumer-fixture.ts";

let fixture: ConsumerFixture;
let manifests: AggregatedManifests;

beforeAll(() => {
  fixture = createConsumerFixture();
  manifests = discoverManifests(fixture.dir);
});

afterAll(() => {
  fixture.cleanup();
});

describe("getExamples", () => {
  it("returns examples in the requested framework's own syntax", () => {
    const react = getExamples(manifests, { name: "Button", framework: "react" });
    expect(react.examples[0]!.code).toContain('import { Button } from "@moderno/react"');

    const vue = getExamples(manifests, { name: "Button", framework: "vue" });
    expect(vue.examples[0]!.code).toContain('import { Button } from "@moderno/vue"');
    expect(react.examples[0]!.code).not.toEqual(vue.examples[0]!.code);
  });

  it("returns an empty list rather than throwing when a component has no curated examples", () => {
    const result = getExamples(manifests, { name: "Dialog", framework: "react" });
    expect(result.examples).toEqual([]);
  });

  it("throws for an unknown component", () => {
    expect(() => getExamples(manifests, { name: "Toggle", framework: "react" })).toThrow();
  });
});
