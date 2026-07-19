#!/usr/bin/env node
/**
 * `moderno-lint` — runs `runCli` (F7.1-style testable seam, mirroring
 * `@moderno/mcp`'s `bin.ts`/`server.ts` split) and maps an unexpected throw
 * (a malformed flag from `node:util`'s `parseArgs`, a permission error) to
 * the same `error: <message>` + exit-1 convention `moderno`'s and
 * `@moderno/mcp`'s CLIs use, instead of a raw stack trace.
 */
import { runCli } from "./cli.ts";

try {
  process.exit(runCli(process.argv.slice(2)));
} catch (error) {
  console.error(`error: ${(error as Error).message}`);
  process.exit(1);
}
