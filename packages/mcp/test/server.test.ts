/**
 * End-to-end: a real MCP `Client` talking to `createServer()` over an
 * in-memory transport (no stdio plumbing, same protocol path `bin.ts` uses).
 * Exercises F7.1 (five tools, valid schemas) and F7.2 (every tool honors
 * `framework`) through the actual SDK, not the pure tool functions directly.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer } from "../src/server.ts";
import { createConsumerFixture, type ConsumerFixture } from "./helpers/consumer-fixture.ts";

let fixture: ConsumerFixture;
let client: Client;

beforeEach(async () => {
  fixture = createConsumerFixture();
  const server = createServer({ cwd: fixture.dir });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
});

afterEach(async () => {
  await client.close();
  fixture.cleanup();
});

function structured(result: Awaited<ReturnType<Client["callTool"]>>): Record<string, unknown> {
  expect(result.isError, JSON.stringify(result)).not.toBe(true);
  return result.structuredContent as Record<string, unknown>;
}

describe("@moderno/mcp server", () => {
  it("exposes exactly the five read/verify tools with valid schemas", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "get_component_api",
      "get_contract",
      "get_examples",
      "search_components",
      "validate_usage",
    ]);
    for (const tool of tools) {
      expect(tool.inputSchema, tool.name).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
    }
  });

  it("search_components: finds Dialog for a modal-shaped query in react", async () => {
    const result = await client.callTool({
      name: "search_components",
      arguments: { query: "modal dialog", framework: "react" },
    });
    const { matches } = structured(result) as { matches: { name: string }[] };
    expect(matches[0]!.name).toBe("Dialog");
  });

  it("get_component_api: returns the installed version's API, not latest (F7.3)", async () => {
    const result = await client.callTool({
      name: "get_component_api",
      arguments: { name: "Button", framework: "react" },
    });
    const data = structured(result) as { version: string; component: { props: unknown[] } };
    expect(data.version).toBe("0.5.0");
    expect(data.component.props).toEqual([
      { name: "variant", type: '"primary" | "outline"', required: false },
    ]);
  });

  it("get_examples: react and vue return different, framework-correct syntax (F7.2)", async () => {
    const react = structured(
      await client.callTool({
        name: "get_examples",
        arguments: { name: "Button", framework: "react" },
      }),
    ) as { examples: { code: string }[] };
    const vue = structured(
      await client.callTool({
        name: "get_examples",
        arguments: { name: "Button", framework: "vue" },
      }),
    ) as { examples: { code: string }[] };

    expect(react.examples[0]!.code).toContain('@moderno/react"');
    expect(vue.examples[0]!.code).toContain("<script setup");
  });

  it("get_contract: returns shared token slots/theming (framework-agnostic)", async () => {
    const result = await client.callTool({ name: "get_contract", arguments: {} });
    const data = structured(result) as { slots: { color: string[] }; rules: string[] };
    expect(data.slots.color).toContain("--primary");
    expect(data.rules.length).toBeGreaterThan(0);
  });

  it("validate_usage: flags a hardcoded color, an invalid prop, and a raw-Ark import (F7.5)", async () => {
    const result = await client.callTool({
      name: "validate_usage",
      arguments: {
        framework: "react",
        code: [
          'import { Dialog } from "@ark-ui/react";',
          '<Button variant="primaryy" style={{ color: "#ff0000" }}>Save</Button>',
        ].join("\n"),
      },
    });
    const { findings } = structured(result) as { findings: { ruleId: string }[] };
    const ruleIds = findings.map((f) => f.ruleId).sort();
    expect(ruleIds).toEqual([
      "moderno/no-hardcoded-color",
      "moderno/no-raw-ark",
      "moderno/valid-props",
    ]);
  });

  it("returns an MCP tool error (not a thrown exception) for an uninstalled framework", async () => {
    const result = await client.callTool({
      name: "get_component_api",
      arguments: { name: "Button", framework: "svelte" },
    });
    expect(result.isError).toBe(true);
  });
});
