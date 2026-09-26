/**
 * Discover the aggregators, render the files they own, then either write them
 * (`pnpm gen`) or report the committed ones that differ (`pnpm gen --check`).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Aggregator } from "./aggregator.ts";
import { generatedBanner } from "./banner.ts";

export interface NamedAggregator {
  /** The module's file name without `.ts`; shown in the banner. */
  name: string;
  aggregator: Aggregator;
}

export interface GeneratedFile {
  /** Repo-relative path, as the aggregator declared it. */
  path: string;
  /** Banner plus the aggregator's body: exactly what is committed. */
  content: string;
}

/**
 * Every `.ts` module in `dir`, sorted by name, each default-exporting an
 * aggregator. Found with `readdir`, so adding an aggregator edits no list.
 */
export async function discoverAggregators(dir: string): Promise<NamedAggregator[]> {
  const modules = readdirSync(dir)
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"))
    .sort();
  const found: NamedAggregator[] = [];
  for (const file of modules) {
    const { default: aggregator } = (await import(pathToFileURL(join(dir, file)).href)) as {
      default?: unknown;
    };
    if (!isAggregator(aggregator)) {
      throw new Error(
        `pnpm gen: ${file} must default-export an aggregator ({ output, source, generate })`,
      );
    }
    found.push({ name: basename(file, ".ts"), aggregator });
  }
  return found;
}

/** Runs every aggregator and prefixes its body with the generated-file banner. */
export async function renderGeneratedFiles(
  aggregators: readonly NamedAggregator[],
  root: string,
): Promise<GeneratedFile[]> {
  const outputs = aggregators.map(({ aggregator }) => aggregator.output).sort();
  const duplicate = outputs.find((output, i) => output === outputs[i + 1]);
  if (duplicate) {
    throw new Error(`pnpm gen: more than one aggregator writes ${duplicate}`);
  }

  const files: GeneratedFile[] = [];
  for (const { name, aggregator } of aggregators) {
    const body = await aggregator.generate({ root, outputs });
    const banner = generatedBanner(name, aggregator.source, aggregator.output);
    files.push({ path: aggregator.output, content: `${banner}\n${body}` });
  }
  return files;
}

export function writeGeneratedFiles(files: readonly GeneratedFile[], root: string): void {
  for (const file of files) {
    const target = join(root, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.content);
  }
}

/** Paths whose committed content is missing or differs from what `pnpm gen` writes. */
export function findStaleFiles(files: readonly GeneratedFile[], root: string): string[] {
  return files
    .filter((file) => {
      const target = join(root, file.path);
      return !existsSync(target) || readFileSync(target, "utf8") !== file.content;
    })
    .map((file) => file.path);
}

function isAggregator(value: unknown): value is Aggregator {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Aggregator>;
  return (
    typeof candidate.output === "string" &&
    typeof candidate.source === "string" &&
    typeof candidate.generate === "function"
  );
}
