/**
 * @moderno-ui/props-doc — build-time prop extractor.
 *
 * Resolves a framework binding's exported props interface with ts-morph and
 * emits the props the consumer actually sets. The signal/noise rule: keep props
 * whose declaration originates inside the workspace (`packages/`, the recipe
 * variants and component-declared props), and drop the hundreds of inherited
 * DOM attributes that come from `lib.dom.d.ts` / `node_modules`. The docs
 * `<PropsTable>` reads the emitted JSON; column labels are translated downstream
 * while the prop `name`/`type` stay in English (the real API).
 *
 * Dropping is lossy in one case that matters downstream: a root wrapped around
 * a headless machine inherits real props from `@ark-ui/*` / `@zag-js/*`, and
 * those go the same way as the DOM noise. Each `ComponentDoc` therefore
 * carries `propsComplete`, derived from where the dropped declarations came
 * from, so a consumer can tell "these are all the props" from "these are the
 * props we can see".
 */

/** One row of a `<PropsTable>`. */
export interface PropDoc {
  /** Public prop name, in English (the real API). */
  name: string;
  /**
   * Resolved TypeScript type, formatted for display. A union lists its members
   * in a fixed order (see `union-order.ts`), so the text never depends on
   * which other components were resolved alongside this one.
   */
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
  /**
   * The workspace-declared object types the props use (`KpiCardMetric`), each
   * expanded into its fields and keyed by type name, so a consumer can fill a
   * structured prop without reading the source. Only with `expandShapes`.
   */
  shapes?: Record<string, PropDoc[]>;
}

/** A component to document: where its props interface lives. */
export interface ComponentEntry {
  /** Display name. */
  name: string;
  /** Source file declaring the interface, relative to the project root. */
  file: string;
  /** Exported interface/type name to resolve (e.g. `ButtonProps`). */
  type: string;
  /**
   * The component's recipe variant table, when it has one. A prop named after
   * a variant prints its union members in the order the recipe declares them.
   */
  variants?: Record<string, readonly string[]>;
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
  /**
   * Also expand the object types the props use into `shapes`, and print an
   * aliased literal union as its members.
   */
  expandShapes?: boolean;
}

import { dirname, resolve } from "node:path";
import { Node, Project, SymbolFlags, type Symbol as TsSymbol, type Type } from "ts-morph";
import { orderUnionMembers } from "./union-order.ts";

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
    const shapes: Record<string, PropDoc[]> | undefined = opts.expandShapes ? {} : undefined;
    let propsComplete = true;
    for (const sym of decl.getType().getProperties()) {
      const decls = sym.getDeclarations();
      const declFile = decls[0]?.getSourceFile().getFilePath();
      if (!declFile || !include(declFile)) {
        if (declFile && !isNativeAttrOrigin(declFile)) propsComplete = false;
        continue;
      }

      props.push(propDoc(sym, decl, entry.variants?.[sym.getName()], opts.expandShapes));
      if (shapes) collectShapes(sym.getTypeAtLocation(decl), decl, include, shapes);
    }

    props.sort(byName);
    return { name: entry.name, props, propsComplete, ...(shapes ? { shapes } : {}) };
  });
}

function byName(a: PropDoc, b: PropDoc): number {
  return a.name.localeCompare(b.name);
}

/**
 * A union of string or number literals (with `null`), spelled out instead of
 * printed under its alias: `KpiCardTone` tells a reader nothing, its members do.
 */
function spelledLiteralUnion(type: Type): string | undefined {
  if (!type.isUnion()) return undefined;
  const members = type.getUnionTypes().filter((member) => !member.isUndefined());
  const literal = (member: Type) =>
    member.isStringLiteral() || member.isNumberLiteral() || member.isNull();
  return members.length > 1 && members.every(literal)
    ? members.map((member) => member.getText()).join(" | ")
    : undefined;
}

/**
 * One property as a `PropDoc`, its type printed as seen from `at`. With
 * `spellLiterals`, an aliased literal union is printed as its members.
 */
function propDoc(
  sym: TsSymbol,
  at: Node,
  variantOrder?: readonly string[],
  spellLiterals = false,
): PropDoc {
  const type = sym.getTypeAtLocation(at);
  const text = (spellLiterals && spelledLiteralUnion(type)) || formatType(type.getText(at));
  const prop: PropDoc = {
    name: sym.getName(),
    type: orderUnionMembers(text, variantOrder),
    required: (sym.getFlags() & SymbolFlags.Optional) === 0,
  };
  const description = jsDocSummary(sym);
  if (description) prop.description = description;
  return prop;
}

/**
 * Adds every named object type `type` reaches (through unions, arrays and
 * nested fields) to `shapes`, when it is declared in a file `include` keeps.
 * Functions, library types (`Record`, `ReactNode`) and inline object
 * literals stay as their printed type.
 */
function collectShapes(
  type: Type,
  at: Node,
  include: (declFilePath: string) => boolean,
  shapes: Record<string, PropDoc[]>,
): void {
  if (type.isUnion()) {
    for (const member of type.getUnionTypes()) collectShapes(member, at, include, shapes);
    return;
  }
  const element = type.getArrayElementType();
  if (element) return collectShapes(element, at, include, shapes);
  if (!type.isObject() || type.getCallSignatures().length > 0) return;

  const sym = type.getAliasSymbol() ?? type.getSymbol();
  const decl = sym?.getDeclarations()[0];
  const name = sym?.getName();
  if (!decl || !name || name === "__type" || name in shapes) return;
  if (!include(decl.getSourceFile().getFilePath())) return;

  const fields = type.getProperties();
  shapes[name] = fields.map((field) => propDoc(field, decl, undefined, true)).sort(byName);
  for (const field of fields) collectShapes(field.getTypeAtLocation(decl), decl, include, shapes);
}
