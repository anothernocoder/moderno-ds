/**
 * The contract every module in `src/aggregators/` follows (ADR-0009).
 *
 * An aggregator owns exactly one generated file. It reads the one-file-per-
 * component sources it names and returns the file's body; `pnpm gen` adds the
 * banner and writes it. Its module name (the file name without `.ts`) is the
 * name the banner shows.
 */

/** What `pnpm gen` hands every aggregator. */
export interface GenContext {
  /** Absolute path of the repository root; read sources relative to it. */
  root: string;
  /** Repo-relative path of every file any aggregator writes, sorted. */
  outputs: readonly string[];
}

export interface Aggregator {
  /** Repo-relative path, with forward slashes, of the file this aggregator writes. */
  output: string;
  /** Glob of the sources it reads, as shown in the banner (e.g. `packages/core/src/recipes/*.ts`). */
  source: string;
  /** Returns the file's body, without the banner. */
  generate(context: GenContext): string | Promise<string>;
}
