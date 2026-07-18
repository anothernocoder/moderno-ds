import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { discoverManifests, type AggregatedManifests } from "../src/manifests.ts";
import { getComponentApi } from "../src/tools/get-component-api.ts";
import { ModernoMcpError } from "../src/tools/shared.ts";
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

describe("getComponentApi", () => {
  it("returns the installed package's pinned version alongside the component API (F7.3)", () => {
    const result = getComponentApi(manifests, { name: "Button", framework: "react" });
    expect(result.package).toBe("@moderno/react");
    expect(result.version).toBe("0.5.0");
    expect(result.component.props.map((p) => p.name)).toEqual(["variant"]);
  });

  it("is case-insensitive on the component name", () => {
    const result = getComponentApi(manifests, { name: "button", framework: "react" });
    expect(result.component.name).toBe("Button");
  });

  it("returns the framework-appropriate import string", () => {
    const react = getComponentApi(manifests, { name: "Button", framework: "react" });
    expect(react.component.import).toBe('import { Button } from "@moderno/react"');

    const vue = getComponentApi(manifests, { name: "Button", framework: "vue" });
    expect(vue.component.import).toBe('import { Button } from "@moderno/vue"');
  });

  it("throws with the available component names when asked for one that doesn't exist", () => {
    expect(() => getComponentApi(manifests, { name: "Toggle", framework: "react" })).toThrow(
      /Button, Dialog/,
    );
  });

  it("throws a ModernoMcpError for a framework that isn't installed", () => {
    expect(() => getComponentApi(manifests, { name: "Button", framework: "solid" })).toThrow(
      ModernoMcpError,
    );
  });
});
