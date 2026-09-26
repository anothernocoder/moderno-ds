import type { Aggregator } from "../aggregator.ts";

/**
 * Marks every file `pnpm gen` writes, this one included, as generated, so a
 * pull request collapses their diffs and no ticket edits `.gitattributes` by
 * hand.
 */
export default {
  output: ".gitattributes",
  source: "tooling/gen/src/aggregators/*.ts",
  generate: ({ outputs }) =>
    outputs.map((output) => `${output} linguist-generated=true\n`).join(""),
} satisfies Aggregator;
