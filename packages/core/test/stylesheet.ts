/**
 * Reading the component stylesheet in tests: the generated `components.css`
 * for the stylesheet-wide guards, or one scope's partial for that scope's own
 * contract (`components-css.<scope>.test.ts`).
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postcss, { type Declaration, type Root } from "postcss";

const STYLES = new URL("../src/styles/", import.meta.url);
const PARTIALS = new URL("components/", STYLES);

/** The published stylesheet, as `pnpm gen` assembles it. */
export function readComponentsCss(): string {
  return readFileSync(fileURLToPath(new URL("components.css", STYLES)), "utf8");
}

/** Every partial's name (`_base`, `button`, …: its file name without `.css`), sorted. */
export function partialNames(): string[] {
  return readdirSync(fileURLToPath(PARTIALS))
    .filter((file) => file.endsWith(".css"))
    .map((file) => file.slice(0, -".css".length))
    .sort();
}

/** One partial's source: `readPartial("tabs")` reads `components/tabs.css`. */
export function readPartial(name: string): string {
  return readFileSync(fileURLToPath(new URL(`${name}.css`, PARTIALS)), "utf8");
}

/** One partial, parsed. */
export function parsePartial(name: string): Root {
  return postcss.parse(readPartial(name));
}

/**
 * Declarations of every rule whose selector list contains exactly `selector`,
 * whitespace collapsed, so a selector prettier wraps over lines still matches.
 */
export function ruleDecls(root: Root, selector: string): Declaration[] {
  const found: Declaration[] = [];
  root.walkRules((rule) => {
    if (!rule.selectors.map(normalizeSelector).includes(selector)) return;
    rule.walkDecls((decl) => {
      found.push(decl);
    });
  });
  return found;
}

/** The value of the first declaration of `name`, if any. */
export function prop(decls: readonly Declaration[], name: string): string | undefined {
  return decls.find((decl) => decl.prop === name)?.value;
}

/** A selector trimmed, its whitespace collapsed to one space. */
export function normalizeSelector(selector: string): string {
  return selector.trim().replace(/\s+/g, " ");
}
