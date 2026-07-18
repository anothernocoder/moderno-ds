import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { discoverManifests, type AggregatedManifests } from "../src/manifests.ts";
import { searchComponents } from "../src/tools/search-components.ts";
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

  it("throws for a framework with no installed manifest", () => {
    expect(() => searchComponents(manifests, { query: "click", framework: "svelte" })).toThrow(
      ModernoMcpError,
    );
  });

  it("returns every component (ranked, not filtered out) when nothing scores", () => {
    const result = searchComponents(manifests, { query: "xyzzy", framework: "react" });
    expect(result.matches).toHaveLength(2);
    expect(result.matches.every((m) => m.score === 0)).toBe(true);
  });
});
