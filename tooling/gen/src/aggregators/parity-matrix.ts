import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { format, resolveConfig } from "prettier";
import type { Aggregator } from "../aggregator.ts";

const OUTPUT = "docs/parity-matrix.md";
const FRAGMENTS_DIR = "docs/parity";

/** Title, how parity is achieved, and the legend of the per-component tables. */
const INTRO = "_intro.md";
/** The SSR heading and the start of its table: the rows that hold for the whole playground. */
const SSR = "_ssr.md";
/** The footnotes of the SSR table. */
const SSR_FOOTNOTES = "_ssr-footnotes.md";
/** Notes on how the four bindings differ. */
const NOTES = "_notes.md";

/**
 * A component's fragment opens with front matter naming its row of the SSR
 * table, e.g. `ssr: Tabs selected tab, hidden panels + tab ids`.
 */
const SSR_FRONT_MATTER = /^---\nssr: (.+)\n---\n/;

/** One row of the SSR table: every component's SSR test runs in all four frameworks. */
function ssrRow(guarantee: string): string {
  return `| ${guarantee} | ✅ | ✅ | ✅ | ✅ |\n`;
}

/**
 * `docs/parity-matrix.md`: what each component is tested to do in each
 * framework.
 *
 * Each component has one fragment, `docs/parity/<slug>.md`: its SSR row as
 * front matter, then its `###` section with its own table. The matrix is the
 * `_`-prefixed intro, every section sorted by slug, the SSR table (the rows in
 * `_ssr.md`, then one row per component), its footnotes and the notes. The
 * result is run through Prettier, which aligns the assembled SSR table.
 */
export default {
  output: OUTPUT,
  source: `${FRAGMENTS_DIR}/*.md`,
  generate: async ({ root }) => {
    const dir = join(root, FRAGMENTS_DIR);
    const read = (file: string) => readFileSync(join(dir, file), "utf8");
    const components = componentSlugs(dir).map((slug) => splitSsrRow(slug, read(`${slug}.md`)));

    const markdown = [
      read(INTRO),
      ...components.map(({ section }) => section),
      read(SSR) + components.map(({ ssr }) => ssrRow(ssr)).join(""),
      read(SSR_FOOTNOTES),
      read(NOTES),
    ].join("\n");
    const config = await resolveConfig(join(root, OUTPUT));
    // The banner comment goes on the line above; keep a blank line after it.
    return `\n${await format(markdown, { ...config, parser: "markdown" })}`;
  },
} satisfies Aggregator;

/** The slug of every component fragment (a `.md` file not prefixed `_`), sorted. */
function componentSlugs(dir: string): string[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => basename(file, ".md"))
    .sort();
}

/** Separates a component fragment into its SSR row and its section. */
function splitSsrRow(slug: string, fragment: string): { ssr: string; section: string } {
  const match = SSR_FRONT_MATTER.exec(fragment);
  const ssr = match?.[1];
  if (!match || !ssr) {
    throw new Error(
      `pnpm gen: ${FRAGMENTS_DIR}/${slug}.md must open with front matter naming its SSR row ("---\\nssr: …\\n---")`,
    );
  }
  return { ssr, section: fragment.slice(match[0].length).trimStart() };
}
