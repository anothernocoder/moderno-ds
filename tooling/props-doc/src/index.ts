/**
 * @moderno/props-doc — build-time prop extractor.
 *
 * Resolves a framework binding's exported props interface with ts-morph and
 * emits the props the consumer actually sets. The signal/noise rule: keep props
 * whose declaration originates inside the workspace (`packages/`, the recipe
 * variants and component-declared props), and drop the hundreds of inherited
 * DOM attributes that come from `lib.dom.d.ts` / `node_modules`. The docs
 * `<PropsTable>` reads the emitted JSON; column labels are translated downstream
 * while the prop `name`/`type` stay in English (the real API).
 */

/** One row of a `<PropsTable>`. */
export interface PropDoc {
  /** Public prop name, in English (the real API). */
  name: string;
  /** Resolved TypeScript type, formatted for display. */
  type: string;
  /** False when the property is declared optional (`?`). */
  required: boolean;
  /** Literal default, when the recipe or interface declares one. */
  default?: string;
  /** Leading JSDoc summary, when present. */
  description?: string;
}

/** Extracted docs for a single component. */
export interface ComponentDoc {
  /** Display name (the entry name, e.g. `Button`). */
  name: string;
  /** Props kept after the workspace-origin filter, sorted by name. */
  props: PropDoc[];
}

/** A component to document: where its props interface lives. */
export interface ComponentEntry {
  /** Display name. */
  name: string;
  /** Source file declaring the interface, relative to the project root. */
  file: string;
  /** Exported interface/type name to resolve (e.g. `ButtonProps`). */
  type: string;
}

export interface ExtractOptions {
  /** Path to the tsconfig.json ts-morph loads the program from. */
  tsConfigFilePath: string;
  /** Components to document. */
  entries: ComponentEntry[];
  /**
   * Decide whether a prop whose symbol is declared in `declFilePath` is kept.
   * Default: keep declarations under a workspace `packages/` dir, drop
   * `node_modules` (inherited DOM/React attributes).
   */
  include?: (declFilePath: string) => boolean;
}

import { dirname, resolve } from "node:path";
import { Node, Project, SymbolFlags, type Symbol as TsSymbol } from "ts-morph";

/** Default origin filter: keep workspace `packages/` declarations, drop deps. */
function defaultInclude(declFilePath: string): boolean {
  const p = declFilePath.replace(/\\/g, "/");
  return p.includes("/packages/") && !p.includes("/node_modules/");
}

/** Collapse multi-line type text and drop the implicit optional `| undefined`. */
function formatType(text: string): string {
  return text
    .replace(/import\("[^"]*"\)\./g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*\|\s*undefined\b/g, "")
    .trim();
}

function jsDocSummary(sym: TsSymbol): string | undefined {
  for (const decl of sym.getDeclarations()) {
    if (Node.isJSDocable(decl)) {
      const docs = decl.getJsDocs();
      const text = docs[docs.length - 1]?.getDescription().trim();
      if (text) return text;
    }
  }
  return undefined;
}

export function extractProps(opts: ExtractOptions): ComponentDoc[] {
  const include = opts.include ?? defaultInclude;
  const project = new Project({ tsConfigFilePath: opts.tsConfigFilePath });
  const projectRoot = dirname(opts.tsConfigFilePath);

  return opts.entries.map((entry) => {
    const source = project.getSourceFileOrThrow(resolve(projectRoot, entry.file));
    const decl =
      source.getInterface(entry.type) ??
      source.getTypeAlias(entry.type) ??
      source.getClass(entry.type);
    if (!decl) {
      throw new Error(`${entry.file}: no exported type "${entry.type}"`);
    }

    const props: PropDoc[] = [];
    for (const sym of decl.getType().getProperties()) {
      const decls = sym.getDeclarations();
      const declFile = decls[0]?.getSourceFile().getFilePath();
      if (!declFile || !include(declFile)) continue;

      const required = (sym.getFlags() & SymbolFlags.Optional) === 0;
      const type = formatType(sym.getTypeAtLocation(decl).getText(decl));
      const prop: PropDoc = { name: sym.getName(), type, required };
      const description = jsDocSummary(sym);
      if (description) prop.description = description;
      props.push(prop);
    }

    props.sort((a, b) => a.name.localeCompare(b.name));
    return { name: entry.name, props };
  });
}
