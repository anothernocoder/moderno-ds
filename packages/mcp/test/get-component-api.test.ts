import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { discoverManifests, type AggregatedManifests } from "@moderno-ui/lint-core";
import { getComponentApi } from "../src/tools/get-component-api.ts";
import { ModernoMcpError } from "../src/tools/shared.ts";
import {
  createConsumerFixture,
  type ConsumerFixture,
} from "../../lint-core/test/helpers/consumer-fixture.ts";

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
    expect(result.package).toBe("@moderno-ui/react");
    expect(result.version).toBe("0.5.0");
    expect(result.component.props.map((p) => p.name)).toEqual(["variant"]);
  });

  it("is case-insensitive on the component name", () => {
    const result = getComponentApi(manifests, { name: "button", framework: "react" });
    expect(result.component.name).toBe("Button");
  });

  it("returns the framework-appropriate import string", () => {
    const react = getComponentApi(manifests, { name: "Button", framework: "react" });
    expect(react.component.import).toBe('import { Button } from "@moderno-ui/react"');

    const vue = getComponentApi(manifests, { name: "Button", framework: "vue" });
    expect(vue.component.import).toBe('import { Button } from "@moderno-ui/vue"');
  });

  it("throws with the available component names when asked for one that doesn't exist", () => {
    // The fixture lists its components in slug order, one file each, so a new
    // one can sort between these: check each name, not who its neighbours are.
    const lookup = () => getComponentApi(manifests, { name: "Sheet", framework: "react" });
    for (const name of ["Button", "Card", "Checkbox", "Dialog"]) {
      expect(lookup).toThrow(new RegExp(`Available: .*\\b${name}\\b`));
    }
  });

  it("throws a ModernoMcpError for a framework that isn't installed", () => {
    expect(() => getComponentApi(manifests, { name: "Button", framework: "solid" })).toThrow(
      ModernoMcpError,
    );
  });
});
