#!/usr/bin/env node
/**
 * `moderno-mcp` — starts the stdio MCP server (F7.1). Run via `npx @moderno/mcp`
 * / `bunx @moderno/mcp` from the consumer project's root so `process.cwd()`
 * resolves the same `node_modules` the consumer's own build does.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.ts";

async function main(): Promise<void> {
  const server = createServer({ cwd: process.cwd() });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("@moderno/mcp running on stdio");
}

main().catch((error: unknown) => {
  console.error("@moderno/mcp failed to start:", error);
  process.exit(1);
});
