import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { discoverManifests, rankComponents, type AggregatedManifests } from "@moderno-ui/lint-core";
import { searchComponents } from "../src/tools/search-components.ts";
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

describe("searchComponents", () => {
  it("ranks a component whose guidance matches the query above one that doesn't", () => {
    const result = searchComponents(manifests, {
      query: "modal blocking decision",
      framework: "react",
    });
    expect(result.matches[0]!.name).toBe("Dialog");
    expect(result.matches[0]!.score).toBeGreaterThan(result.matches[1]!.score);
  });

  it("matches by exact component name", () => {
    const result = searchComponents(manifests, { query: "Button", framework: "react" });
    expect(result.matches[0]!.name).toBe("Button");
  });

  it("returns a block, with how to install it, first when the query matches its intent", () => {
    const result = searchComponents(manifests, { query: "kpi", framework: "react" });
    expect(result.matches[0]).toMatchObject({
      name: "KpiCard",
      kind: "block",
      install: "npx @moderno-ui/cli add kpi-card-react",
    });
    expect(result.matches[0]).not.toHaveProperty("import");
  });

  it("returns a primitive with its import and kind", () => {
    const card = searchComponents(manifests, { query: "card", framework: "react" }).matches[0]!;
    expect(card).toMatchObject({
      name: "Card",
      kind: "primitive",
      import: 'import { Card } from "@moderno-ui/react"',
    });
    expect(card).not.toHaveProperty("install");
  });

  it("ranks a block above a primitive with the same score", () => {
    const ranked = rankComponents([{ name: "Alpha" }, { name: "Beta", kind: "block" }], "xyzzy");
    expect(ranked.map((r) => r.component.name)).toEqual(["Beta", "Alpha"]);
  });

  it("throws for a framework with no installed manifest", () => {
    expect(() => searchComponents(manifests, { query: "click", framework: "svelte" })).toThrow(
      ModernoMcpError,
    );
  });

  it("returns every component and block (ranked, not filtered out) when nothing scores", () => {
    const react = manifests.components.find((m) => m.framework === "react")!;
    const installed = react.components.length + react.blocks!.length;
    const result = searchComponents(manifests, { query: "xyzzy", framework: "react" });
    expect(result.matches).toHaveLength(installed);
    expect(result.matches.every((m) => m.score === 0)).toBe(true);
  });
});
