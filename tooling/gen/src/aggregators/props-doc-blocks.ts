import type { Aggregator } from "../aggregator.ts";
import { BLOCKS_DIR, currentBlockHashes } from "../../../props-doc/src/agent-blocks.ts";

const MODULE_DOC = `/**
 * The props hash of every registry block, as \`pnpm gen\` last computed it
 * from the block's React \`<Name>Props\` interface and the object types it
 * uses (ADR-0012). \`agent:check-drift\` recomputes them and fails when a
 * block's props changed without \`pnpm gen\`.
 */
`;

/**
 * Records each block's props hash, so a props change that skipped
 * `pnpm gen` fails `agent:check-drift`. A new block is picked up from its
 * folder.
 */
export default {
  output: "tooling/props-doc/src/blocks.generated.ts",
  source: `${BLOCKS_DIR}/*/react/*.tsx`,
  generate: ({ root }) => {
    const rows = Object.entries(currentBlockHashes(root))
      // Quoted only when needed, as Prettier writes it.
      .map(([slug, hash]) => `  ${slug.includes("-") ? `"${slug}"` : slug}: "${hash}",\n`)
      .join("");
    return `${MODULE_DOC}export const BLOCK_PROPS_HASHES: Record<string, string> = {\n${rows}};\n`;
  },
} satisfies Aggregator;
