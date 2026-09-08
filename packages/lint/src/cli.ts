/**
 * `moderno-lint` — the CLI face of `@moderno-ui/lint-core`'s rule engine
 * (ADR-0003), for scripts and CI that don't run through ESLint. `runCli` is
 * the testable seam; `bin.ts` is the thin shebang entry that calls it and
 * maps the exit code to `process.exit`.
 */
import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { discoverManifests, runRules, type Finding, type Framework } from "@moderno-ui/lint-core";
import { FRAMEWORKS, frameworkFromPath } from "./framework.ts";
import { registrySourceFiles } from "./registry.ts";

const HELP = `moderno-lint — lint files against the Moderno usage rules

Usage:
  moderno-lint <file...> [--framework react|vue|svelte|solid|astro]
  moderno-lint --registry <registry.json> [--framework …]

Framework is inferred per file from a framework-named directory segment
(blocks/pricing/solid/…) and otherwise from the extension (.vue, .svelte,
.astro; .tsx/.jsx default to react), unless --framework overrides it for every
file given.

--registry lints every source file a registry manifest ships — the gate CI runs
over the catalog, so a block that hardcodes a colour or a dimension never
reaches a consumer's project.
`;

export interface RunCliOptions {
  /** Directory to discover node_modules/@moderno from. Defaults to process.cwd(). */
  cwd?: string;
  stdout?: (line: string) => void;
  stderr?: (line: string) => void;
}

function isFramework(value: string): value is Framework {
  return (FRAMEWORKS as string[]).includes(value);
}

function formatFinding(filePath: string, finding: Finding): string {
  const suggestion = finding.suggestion ? ` — ${finding.suggestion}` : "";
  return `${filePath}:${finding.loc.line}:${finding.loc.col} ${finding.severity} ${finding.message}${suggestion} [${finding.ruleId}]`;
}

/** Runs the shared rules over each given file path; returns the process exit code. */
export function runCli(argv: string[], options: RunCliOptions = {}): number {
  const cwd = options.cwd ?? process.cwd();
  const stdout = options.stdout ?? ((line: string) => console.log(line));
  const stderr = options.stderr ?? ((line: string) => console.error(line));

  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      framework: { type: "string" },
      registry: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    stdout(HELP);
    return 0;
  }

  let files = positionals;
  if (values.registry !== undefined) {
    if (!existsSync(values.registry)) {
      stderr(`error: no such registry manifest: ${values.registry}`);
      return 2;
    }
    let fromRegistry: string[];
    try {
      fromRegistry = registrySourceFiles(values.registry);
    } catch (error) {
      stderr(
        `error: could not read registry manifest ${values.registry}: ${(error as Error).message}`,
      );
      return 2;
    }
    if (fromRegistry.length === 0) {
      stderr(`error: registry manifest ships no files: ${values.registry}`);
      return 2;
    }
    files = [...positionals, ...fromRegistry];
  }

  if (files.length === 0) {
    stderr(HELP);
    return 2;
  }

  const frameworkFlag = values.framework;
  if (frameworkFlag !== undefined && !isFramework(frameworkFlag)) {
    stderr(
      `error: unknown --framework "${frameworkFlag}". Expected one of: ${FRAMEWORKS.join(", ")}.`,
    );
    return 2;
  }

  const manifests = discoverManifests(cwd);

  let errorCount = 0;
  let warnCount = 0;
  let missingCount = 0;

  for (const filePath of files) {
    if (!existsSync(filePath)) {
      stderr(`error: no such file: ${filePath}`);
      missingCount++;
      continue;
    }
    const code = readFileSync(filePath, "utf8");
    const framework = frameworkFlag ?? frameworkFromPath(filePath);
    for (const finding of runRules({ code, framework, manifests })) {
      if (finding.severity === "error") errorCount++;
      else warnCount++;
      stdout(formatFinding(filePath, finding));
    }
  }

  if (missingCount > 0) return 2;
  if (errorCount === 0 && warnCount === 0) {
    stdout(`✓ ${files.length} file${files.length === 1 ? "" : "s"} checked, no violations.`);
    return 0;
  }
  stdout(
    `${errorCount} error${errorCount === 1 ? "" : "s"}, ${warnCount} warning${warnCount === 1 ? "" : "s"}.`,
  );
  return errorCount > 0 ? 1 : 0;
}
