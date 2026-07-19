import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * The AGENTS.md (and optional CLAUDE.md twin) stanza `init` writes: the
 * CONTRACT.md golden rule + guardrails, plus instructions to use the
 * `moderno` MCP server for component knowledge and run `validate_usage`
 * before finishing.
 */

const STANZA_START = "<!-- moderno:agents:start -->";
const STANZA_END = "<!-- moderno:agents:end -->";
const stanzaBlockPattern = (): RegExp => new RegExp(`${STANZA_START}[\\s\\S]*?${STANZA_END}`, "g");

export const AGENTS_MD = "AGENTS.md";
export const CLAUDE_MD = "CLAUDE.md";

function stanzaBody(): string {
  return `## Working with Moderno

This project uses [Moderno](https://moderno.style), a themeable, multi-framework
design system. Follow these rules when writing UI code.

### Golden rules

- **Components are never edited.** They are themed via CSS variables and varied
  via props — never fork component markup or write per-component CSS.
- Reference contract slots (\`--background\`, \`--primary\`, \`--radius\`, …) —
  never hardcode hex colors, px spacing, or ms durations.
- Put brand values in a theme, not in \`@moderno/tokens\`.
- Keep \`:root\` light / \`.dark\` dark — don't invent a third theming mechanism.
- \`@moderno/css\` is the only public CSS specifier — never import internal paths.

### Use the MCP server for component knowledge

Configure the \`moderno\` MCP server (\`npx @moderno/mcp\`, stdio) in your agent's
MCP settings, then use its tools instead of guessing APIs:

- \`search_components\` — find the right primitive by intent.
- \`get_component_api\` — props/slots/\`data-part\`s for the *installed* version.
- \`get_examples\` — framework-specific usage snippets.
- \`get_contract\` — theming rules and token slots.
- \`validate_usage\` — lint a snippet/file; catches hardcoded colors, invalid
  props, raw Ark imports, bad \`data-part\` targets, and reimplemented primitives.

**Before finishing any task that touches Moderno components, run
\`validate_usage\` on your changes and fix any violations it reports.**`;
}

function buildStanza(): string {
  return `${STANZA_START}\n${stanzaBody()}\n${STANZA_END}`;
}

/** Strip stray, unpaired stanza marker lines left over from a corrupted file. */
function stripOrphanMarkers(content: string): string {
  return content
    .split("\n")
    .filter((line) => line.trim() !== STANZA_START && line.trim() !== STANZA_END)
    .join("\n");
}

/**
 * Merge the stanza into existing file content:
 *   - no well-formed existing stanza block → append the stanza (preserving
 *     everything else; any orphaned/malformed marker lines are stripped first
 *     so a corrupted file can't be misread as a valid block on a later run)
 *   - one or more well-formed blocks → replace the first in place (keeps the
 *     stanza current on repeat `init` runs without touching the rest of the
 *     file) and drop any duplicates
 */
function upsertStanza(existing: string | undefined, stanza: string): string {
  if (existing === undefined) return stanza + "\n";

  if (stanzaBlockPattern().test(existing)) {
    let replaced = false;
    const merged = existing.replace(stanzaBlockPattern(), () => {
      if (replaced) return "";
      replaced = true;
      return stanza;
    });
    return merged.replace(/\n{3,}/g, "\n\n");
  }

  const trimmed = stripOrphanMarkers(existing).replace(/\s*$/, "");
  return trimmed.length === 0 ? stanza + "\n" : `${trimmed}\n\n${stanza}\n`;
}

async function readFileOrUndefined(file: string): Promise<string | undefined> {
  try {
    return await readFile(file, "utf8");
  } catch {
    return undefined;
  }
}

/**
 * Write (or update in place) the Moderno stanza in `AGENTS.md`, and optionally
 * a `CLAUDE.md` twin, without clobbering any content the consumer already has.
 */
export async function writeAgentsStanza(opts: {
  projectDir: string;
  claude?: boolean;
}): Promise<{ files: string[] }> {
  const stanza = buildStanza();
  const files: string[] = [];

  const targets = [AGENTS_MD, ...(opts.claude ? [CLAUDE_MD] : [])];
  for (const name of targets) {
    const file = join(opts.projectDir, name);
    const existing = await readFileOrUndefined(file);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, upsertStanza(existing, stanza));
    files.push(name);
  }

  return { files };
}
