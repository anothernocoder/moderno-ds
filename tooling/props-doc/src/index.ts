/**
 * @moderno-ui/props-doc — build-time prop extractor.
 *
 * Resolves a framework binding's exported props interface with ts-morph and
 * emits the props Moderno itself adds. The signal/noise rule: keep props whose
 * declaration originates inside the workspace (`packages/`, the recipe variants
 * and component-declared props), and drop everything inherited — both the
 * hundreds of DOM attributes from `lib.dom.d.ts` / `@types/*` and the headless
 * machine's own API. A table that re-published Ark's thirty-odd `Select.Root`
 * props would document Ark, not the wrapper: what belongs here is the surface
 * this design system owns and can promise. The docs `<PropsTable>` reads the
 * emitted JSON; column labels are translated downstream while the prop
 * `name`/`type` stay in English (the real API).
 *
 * Dropping is lossy in one case that matters downstream: a root wrapped around
 * a headless machine inherits real props from `@ark-ui/*` / `@zag-js/*`, and
 * those go the same way as the DOM noise. Each `ComponentDoc` therefore
 * carries `propsComplete`, derived from where the dropped declarations came
 * from, so a consumer can tell "these are all the props" from "these are the
 * props we can see" — the docs say so under the table, and `valid-props` will
 * not judge an unknown prop against a partial list.
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
  /** Props kept after the origin filter, sorted by name. */
  props: PropDoc[];
  /**
   * True when `props` is the component's whole API: everything the filter
   * dropped was a native attribute the binding merely forwards. False when a
   * real prop was dropped because it is declared in a dependency — a root
   * wrapped around a headless machine (`Select.Root` inherits Ark/Zag's
   * `collection`, `value`, `onValueChange`…), whose API the extractor cannot
   * see. Consumers that reason about "is this prop real?" — `valid-props`
   * above all — must not treat an incomplete list as exhaustive.
   */
  propsComplete: boolean;
}

/** A component to document: where its props interface lives. */
export interface ComponentEntry {
  /** Display name. */
  name: string;
  /** Source file exporting the interface, relative to the project root. */
  file: string;
  /**
   * Exported interface/type name to resolve (e.g. `ButtonProps`). Declared in
   * `file` or re-exported from it — `Dialog` adds nothing to Ark's machine, so
   * its binding only re-exports `DialogRootProps`, and resolving it is how the
   * docs learn that its empty table is "no props of our own", not "no props".
   */
  type: string;
  /**
   * The recipe's `defaultVariants`, keyed by prop name. A recipe variant's
   * default lives in a value (`cva({ defaultVariants: { size: "md" } })`), not
   * in the type, so it can only reach the table by being handed in — and
   * without it the Default column is an em dash on a prop that plainly has one.
   */
  defaults?: Readonly<Record<string, string>>;
}

export interface ExtractOptions {
  /** Path to the tsconfig.json ts-morph loads the program from. */
  tsConfigFilePath: string;
  /** Components to document. */
  entries: ComponentEntry[];
  /**
   * Decide whether a prop whose symbol is declared in `declFilePath` is kept.
   * Default: keep declarations under a workspace `packages/` dir, drop
   * `node_modules` (inherited DOM/React attributes and the headless machine's).
   */
  include?: (declFilePath: string) => boolean;
}

import { dirname, resolve } from "node:path";
import {
  Node,
  Project,
  SymbolFlags,
  type SourceFile,
  type Symbol as TsSymbol,
  type Type,
} from "ts-morph";

/** Default origin filter: keep workspace `packages/` declarations, drop deps. */
function defaultInclude(declFilePath: string): boolean {
  const p = declFilePath.replace(/\\/g, "/");
  return p.includes("/packages/") && !p.includes("/node_modules/");
}

/**
 * Whether a *dropped* declaration is a native attribute rather than a real
 * API: the framework's own DOM typings (`@types/react`'s `HTMLAttributes` and
 * friends), `csstype`'s `style`, and TypeScript's own `lib.*.d.ts`. These are
 * the hundreds of pass-through attributes the signal/noise rule exists to
 * drop. Anything else dropped from `node_modules` is a prop the component
 * really accepts and the manifest will never list — which is exactly what
 * `propsComplete` records.
 */
function isNativeAttrOrigin(declFilePath: string): boolean {
  const p = declFilePath.replace(/\\/g, "/");
  return (
    p.includes("/node_modules/@types/") ||
    p.includes("/node_modules/csstype/") ||
    /\/lib\.[^/]*\.d\.ts$/.test(p)
  );
}

/**
 * Drop a pair of parentheses wrapping the whole type. TypeScript parenthesises
 * a function type to write it inside a union, so removing the optional's
 * `| undefined` leaves `((details: Details) => void)` — punctuation that says
 * nothing about the API and isn't how anyone writes the type down.
 */
function unwrapOuterParens(text: string): string {
  if (!text.startsWith("(") || !text.endsWith(")")) return text;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      depth--;
      // The opening paren closed before the end, so it wraps a part, not the whole.
      if (depth === 0 && i < text.length - 1) return text;
    }
  }
  return unwrapOuterParens(text.slice(1, -1).trim());
}

/**
 * Collapse multi-line type text and drop what the printer added rather than the
 * API declared: the implicit optional `| undefined`, `import("…")` qualifiers,
 * and the qualifier of a namespace import — TypeScript prints Ark's types
 * through whatever local alias the binding happened to import them under
 * (`ArkSelect.ValueChangeDetails`), and that alias is private to our source
 * file, so it would send a reader looking for an import that doesn't exist.
 */
function formatType(text: string, localAliases: readonly string[] = []): string {
  let out = text
    .replace(/import\("[^"]*"\)\./g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*\|\s*undefined\b/g, "")
    .trim();
  for (const alias of localAliases) {
    out = out.replace(new RegExp(`\\b${alias}\\.`, "g"), "");
  }
  return unwrapOuterParens(out);
}

/** The names a source file binds its imports to (`import { X as ArkX }` → `ArkX`). */
function importAliases(source: SourceFile): string[] {
  const names: string[] = [];
  for (const decl of source.getImportDeclarations()) {
    const defaultImport = decl.getDefaultImport()?.getText();
    if (defaultImport) names.push(defaultImport);
    const namespaceImport = decl.getNamespaceImport()?.getText();
    if (namespaceImport) names.push(namespaceImport);
    for (const named of decl.getNamedImports())
      names.push(named.getAliasNode()?.getText() ?? named.getName());
  }
  return names.filter((n) => /^[A-Za-z_$][\w$]*$/.test(n));
}

/**
 * The type as a reader needs it: the members of a string-literal union rather
 * than the alias that names them. TypeScript prints `size?: SelectSize` as
 * `SelectSize`, which tells a reader nothing they could type into their editor,
 * while the same union written inline (Divider's `orientation`) prints as
 * `"horizontal" | "vertical"`. Only literal unions are unfolded — expanding
 * `ListCollection<T>` or `PositioningOptions` would trade a name the reader can
 * look up for a wall of structure.
 */
function displayType(type: Type, enclosing: Node, localAliases: readonly string[]): string {
  if (type.isUnion()) {
    const members = type.getUnionTypes().filter((t) => !t.isUndefined());
    if (members.length > 1 && members.every((t) => t.isStringLiteral() || t.isNumberLiteral())) {
      return members.map((t) => formatType(t.getText(enclosing), localAliases)).join(" | ");
    }
  }
  return formatType(type.getText(enclosing), localAliases);
}

/**
 * A JSDoc summary as a table cell can show it: one line (Ark's wrap over
 * several), and without the `**bold**` markers a few of Ark's carry — the cell
 * renders text, not Markdown, so the asterisks would show up as asterisks.
 */
function plainSummary(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .trim();
}

function jsDocSummary(sym: TsSymbol): string | undefined {
  for (const decl of sym.getDeclarations()) {
    if (Node.isJSDocable(decl)) {
      const docs = decl.getJsDocs();
      const text = plainSummary(docs[docs.length - 1]?.getDescription() ?? "");
      if (text) return text;
    }
  }
  return undefined;
}

/**
 * The `@default` JSDoc tag, which is where Ark/Zag record what a prop falls
 * back to (`closeOnSelect` is `true`, `count` is `0`). Without it the docs'
 * Default column is an em dash on every row of every table, which reads as
 * "this prop has no default" rather than "nobody wrote one down".
 */
function jsDocDefault(sym: TsSymbol): string | undefined {
  for (const decl of sym.getDeclarations()) {
    if (!Node.isJSDocable(decl)) continue;
    for (const doc of decl.getJsDocs()) {
      for (const tag of doc.getTags()) {
        if (tag.getTagName() !== "default") continue;
        const text = tag.getCommentText()?.replace(/\s+/g, " ").trim();
        if (text) return text;
      }
    }
  }
  return undefined;
}

/** The interface/type/class `name` names in `source`, declared or re-exported. */
function resolveDeclaration(source: SourceFile, name: string): Node | undefined {
  const local = source.getInterface(name) ?? source.getTypeAlias(name) ?? source.getClass(name);
  if (local) return local;
  return source
    .getExportedDeclarations()
    .get(name)
    ?.find(
      (d) =>
        Node.isInterfaceDeclaration(d) ||
        Node.isTypeAliasDeclaration(d) ||
        Node.isClassDeclaration(d),
    );
}

export function extractProps(opts: ExtractOptions): ComponentDoc[] {
  const include = opts.include ?? defaultInclude;
  const project = new Project({ tsConfigFilePath: opts.tsConfigFilePath });
  const projectRoot = dirname(opts.tsConfigFilePath);

  return opts.entries.map((entry) => {
    const source = project.getSourceFileOrThrow(resolve(projectRoot, entry.file));
    const decl = resolveDeclaration(source, entry.type);
    if (!decl) {
      throw new Error(`${entry.file}: no exported type "${entry.type}"`);
    }

    const localAliases = importAliases(source);
    const props: PropDoc[] = [];
    let propsComplete = true;
    for (const sym of decl.getType().getProperties()) {
      const decls = sym.getDeclarations();
      const declFile = decls[0]?.getSourceFile().getFilePath();
      if (!declFile || !include(declFile)) {
        if (declFile && !isNativeAttrOrigin(declFile)) propsComplete = false;
        continue;
      }

      const required = (sym.getFlags() & SymbolFlags.Optional) === 0;
      const type = displayType(sym.getTypeAtLocation(decl), decl, localAliases);
      const name = sym.getName();
      const prop: PropDoc = { name, type, required };
      // A recipe default is the bare value (`md`); the Type column beside it
      // spells the union with quotes, so the literal is what belongs here.
      const recipeDefault = entry.defaults?.[name];
      const defaultValue = recipeDefault ? JSON.stringify(recipeDefault) : jsDocDefault(sym);
      if (defaultValue) prop.default = defaultValue;
      const description = jsDocSummary(sym);
      if (description) prop.description = description;
      props.push(prop);
    }

    props.sort((a, b) => a.name.localeCompare(b.name));
    return { name: entry.name, props, propsComplete };
  });
}
