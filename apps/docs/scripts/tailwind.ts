/**
 * Compiling the Tailwind utilities the docs need — the ones blocks are written
 * with (ADR-0005: a block lays itself out with `@container` variants bound to
 * `--container-*`, never a viewport media query).
 *
 * Blocks are the only Tailwind surface in this repo: the docs chrome is plain
 * CSS over the contract slots, and primitives are painted by `components.css`.
 * That makes the utility set small, closed and knowable, so the docs compile it
 * directly with Tailwind's own `compile()` rather than wiring a bundler plugin
 * and a PostCSS chain into Astro for one preview panel. The pure half lives
 * here; `build-tailwind.ts` is the thin entry the docs `prebuild` runs.
 *
 * Two deliberate omissions from a stock `@import "tailwindcss"`:
 *
 * - **No global preflight.** Tailwind's reset would strip the bullets off every
 *   MDX list and the size off every heading in the docs prose. But a block is
 *   written *against* preflight — `<ul>` with no bullets, headings with no
 *   inherited size — so previewing one without it would show a layout no
 *   consumer will ever see. The subset a block actually depends on is therefore
 *   scoped to the preview surface (`PREVIEW_PREFLIGHT` below).
 * - **No content globs config.** The candidate set is extracted from `class`
 *   attributes in the files listed below — static class strings, which is how
 *   blocks are authored. A class assembled at runtime (`cn(cond && "p-6")`)
 *   would not be seen; blocks that need that own the CSS instead.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { compile } from "tailwindcss";

const require = createRequire(import.meta.url);

/**
 * The slice of Tailwind's preflight a block is written against, scoped to the
 * docs preview panel so it can't reach the surrounding prose. Everything here
 * is a UA default a block assumes away: box sizing, the border-style that makes
 * `border-*` (a width-only utility) paint anything, and the margins/bullets
 * browsers put on headings and lists.
 *
 * `:where()` keeps every selector at the specificity of the panel class alone,
 * so `components.css` (which targets `[data-scope][data-part]`) still paints
 * the primitives inside, and the layer order puts every utility above it.
 */
const PREVIEW_PREFLIGHT = `@layer moderno.base {
  .preview-panel--demo :where(*, ::before, ::after) {
    box-sizing: border-box;
    border: 0 solid;
  }
  .preview-panel--demo :where(h1, h2, h3, h4, h5, h6, p, figure, blockquote, dl, dd) {
    margin: 0;
    font-size: inherit;
    font-weight: inherit;
  }
  .preview-panel--demo :where(ul, ol, menu) {
    margin: 0;
    padding: 0;
    list-style: none;
  }
}`;

/**
 * The docs stylesheet Tailwind compiles. Layer order is declared up front so
 * utilities win over `components.css` (which declares `moderno.base` /
 * `moderno.components`) — a block's `p-6` must beat a primitive default, the
 * way it would in a consumer's project.
 */
export const DOCS_TAILWIND_ENTRY = `@layer theme, moderno.base, moderno.components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "@moderno-ui/tokens/preset";
@import "tailwindcss/utilities.css" layer(utilities);

${PREVIEW_PREFLIGHT}
`;

/**
 * `class` / `className` / `class:list` attribute values, in the four dialects
 * the docs and the registry author in (Astro, JSX, Vue, Svelte).
 */
const CLASS_ATTRIBUTE =
  /\b(?:class|className|class:list)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;

/** Everything that can separate one candidate from the next inside an attribute. */
const CANDIDATE_SEPARATOR = /[\s,`'"{}()]/;

/**
 * Splits an attribute value into candidates, keeping a bracketed segment whole.
 *
 * A bracket opens an arbitrary value (`grid-cols-[repeat(auto-fit,minmax(0,1fr))]`,
 * `bg-[url(/hero.png)]`) or an arbitrary variant (`[&>*]:mt-0`), and either runs
 * to its matching `]` as one candidate. ADR-0005 blesses exactly those — an
 * `auto-fit` grid is intrinsic layout, not a breakpoint — so splitting on the
 * bracket would silently drop the escape hatch and render the preview with no
 * grid at all, no error and no failing test.
 *
 * The one bracket that is not a candidate's is the host dialect's own array
 * (`class:list={['p-6', 'grid']}`), recognised by the quote or space that
 * follows it, and skipped.
 */
function candidatesIn(value: string, found: Set<string>): void {
  let token = "";
  let depth = 0;
  const flush = () => {
    if (token.length > 0 && !token.includes("=")) found.add(token);
    token = "";
  };
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]!;
    if (depth > 0) {
      token += char;
      if (char === "[") depth += 1;
      else if (char === "]") depth -= 1;
      continue;
    }
    if (char === "[") {
      const next = value[i + 1];
      if (token.length === 0 && (next === undefined || /[\s'"`]/.test(next))) continue;
      token += char;
      depth = 1;
      continue;
    }
    if (char === "]" || CANDIDATE_SEPARATOR.test(char)) {
      flush();
      continue;
    }
    token += char;
  }
  flush();
}

/**
 * Every Tailwind candidate written in a `class` attribute in `source`.
 * Candidates Tailwind doesn't recognise are harmless — `build()` drops them —
 * so this errs towards over-collecting rather than parsing each dialect.
 */
export function extractCandidates(source: string): string[] {
  const found = new Set<string>();
  for (const match of source.matchAll(CLASS_ATTRIBUTE)) {
    candidatesIn(match[1] ?? match[2] ?? match[3] ?? "", found);
  }
  return [...found].sort();
}

/**
 * Resolves the two bare specifiers `DOCS_TAILWIND_ENTRY` imports against this
 * file's own resolution, so the docs pick up the workspace's `tailwindcss` and
 * the live `@moderno-ui/tokens/preset` rather than a copied snapshot.
 */
async function loadStylesheet(id: string, base: string) {
  const path = id.startsWith(".") ? resolve(base, id) : require.resolve(id);
  return { base: dirname(path), path, content: readFileSync(path, "utf8") };
}

/** Compiles the docs' utility stylesheet for an explicit candidate set. */
export async function compileCandidates(candidates: Iterable<string>): Promise<string> {
  const compiled = await compile(DOCS_TAILWIND_ENTRY, {
    base: process.cwd(),
    loadStylesheet,
    loadModule: async () => {
      throw new Error("the docs Tailwind entry must not require JS modules");
    },
  });
  return compiled.build([...new Set(candidates)].sort());
}

/**
 * Compiles the docs' utility stylesheet from the candidates used across
 * `sourceFiles`. Returns the CSS to write; the caller decides where.
 */
export async function buildDocsTailwind(sourceFiles: string[]): Promise<string> {
  const candidates = new Set<string>();
  for (const file of sourceFiles) {
    for (const candidate of extractCandidates(readFileSync(file, "utf8"))) {
      candidates.add(candidate);
    }
  }
  return compileCandidates(candidates);
}
