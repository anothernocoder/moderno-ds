/**
 * Builds the `@moderno/mcp` stdio server: four read tools over the manifests
 * aggregated from the consumer's `node_modules` (ADR-0003). `createServer` is
 * the single seam `bin.ts` and the integration tests both go through — tests
 * exercise the exact tool registrations a real client sees, not a parallel
 * hand-rolled dispatcher.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { discoverManifests, type AggregatedManifests } from "./manifests.ts";
import { getComponentApi } from "./tools/get-component-api.ts";
import { getContract } from "./tools/get-contract.ts";
import { getExamples } from "./tools/get-examples.ts";
import { searchComponents } from "./tools/search-components.ts";
import { ModernoMcpError } from "./tools/shared.ts";

const FRAMEWORK = z
  .enum(["react", "vue", "svelte", "solid", "astro"])
  .describe("The @moderno/* binding this answer must be accurate for.");

function ok(structuredContent: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(structuredContent, null, 2) }],
    structuredContent: structuredContent as Record<string, unknown>,
  };
}

function fail(error: unknown): CallToolResult {
  const message = error instanceof ModernoMcpError ? error.message : String(error);
  return { content: [{ type: "text", text: message }], isError: true };
}

export interface CreateServerOptions {
  /** Directory to discover `node_modules/@moderno` from. Defaults to `process.cwd()`. */
  cwd?: string;
}

export function createServer(opts: CreateServerOptions = {}): McpServer {
  const server = new McpServer({ name: "@moderno/mcp", version: "0.0.0" });

  // Discovered once at startup, not per-call — a long-running agent session
  // gets one consistent, version-pinned view of the consumer's node_modules.
  const manifests: AggregatedManifests = discoverManifests(opts.cwd);

  server.registerTool(
    "search_components",
    {
      title: "Search Moderno components",
      description:
        "Find the right Moderno primitive by intent (e.g. 'modal', 'pick one option') rather than by name. Returns components ranked by relevance, each with its intent/when-to-use guidance.",
      inputSchema: {
        query: z.string().describe("Free-text description of the UI need."),
        framework: FRAMEWORK,
      },
    },
    ({ query, framework }) => {
      try {
        return ok(searchComponents(manifests, { query, framework }));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "get_component_api",
    {
      title: "Get a Moderno component's API",
      description:
        "Props, data-parts, and variants for one component, read from the INSTALLED @moderno/<framework> package's manifest — not the latest docs. Use this before writing any Moderno component usage.",
      inputSchema: {
        name: z.string().describe("Component name, e.g. 'Button'."),
        framework: FRAMEWORK,
      },
    },
    ({ name, framework }) => {
      try {
        return ok(getComponentApi(manifests, { name, framework }));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "get_examples",
    {
      title: "Get framework-specific usage examples",
      description:
        "Working usage snippets for one component, in the requested framework's own syntax (JSX, Vue SFC, Svelte, etc.) — never translate an example from one framework to another by hand.",
      inputSchema: {
        name: z.string().describe("Component name, e.g. 'Select'."),
        framework: FRAMEWORK,
      },
    },
    ({ name, framework }) => {
      try {
        return ok(getExamples(manifests, { name, framework }));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "get_contract",
    {
      title: "Get the Moderno theming contract",
      description:
        "Shared, framework-agnostic theming rules: token slots (color/radius/font/spacing/motion), dark-mode/multi-brand model, and the data-part convention. Consult before writing any color, radius, or spacing value.",
      inputSchema: {},
    },
    () => {
      try {
        return ok(getContract(manifests));
      } catch (error) {
        return fail(error);
      }
    },
  );

  return server;
}
