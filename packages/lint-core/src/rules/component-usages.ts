/**
 * Finds `<ComponentName ...>` usages in a snippet and parses their attribute
 * list, shared by `valid-props` and `no-reimplemented-primitive`.
 *
 * Not a real parser for any one framework — React/Vue/Svelte/Solid/Astro all
 * write component invocations as `<Name attr="x" attr={expr}>` markup, so a
 * single brace/quote-aware scanner covers every binding `validate_usage`
 * targets without pulling in five separate compilers for a snippet-level
 * lint. It tracks string and `{}` expression nesting well enough for
 * realistic usage; it is not a full JS parser and can be fooled by
 * pathological input (e.g. an unbalanced brace inside a string inside an
 * expression).
 */
import { escapeRegExp } from "./text.ts";

export interface ComponentUsage {
  name: string;
  /** Attribute name -> string literal value, or `true` for a valueless/dynamic attribute. */
  attrs: Record<string, string | true>;
  /** Offset of the usage's opening `<`. */
  start: number;
}

/** Scans forward from `from` (just past the tag name) for the `>` that closes the opening tag. */
function findOpenTagClose(
  code: string,
  from: number,
): { end: number; selfClosing: boolean } | null {
  let i = from;
  let depth = 0;
  let quote: string | null = null;
  while (i < code.length) {
    const ch = code[i];
    if (quote) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      i++;
      continue;
    }
    if (ch === "{") {
      depth++;
      i++;
      continue;
    }
    if (ch === "}") {
      depth--;
      i++;
      continue;
    }
    if (depth === 0 && ch === ">") {
      return { end: i, selfClosing: code[i - 1] === "/" };
    }
    i++;
  }
  return null;
}

/** Skips a balanced `{...}` group starting at `text[i] === "{"`; returns the index after the closing `}`. */
function skipBraceGroup(text: string, i: number): number {
  let depth = 0;
  do {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") depth--;
    i++;
  } while (depth > 0 && i < text.length);
  return i;
}

/** Extracts the string literal inside `"x"` / `'x'` / `` `x` `` / `{"x"}`, or undefined if not a plain literal. */
function asStringLiteral(raw: string): string | undefined {
  const trimmed = raw.trim();
  const unwrapped = /^\{(.*)\}$/.exec(trimmed)?.[1]?.trim() ?? trimmed;
  const literal = /^["'`](.*)["'`]$/.exec(unwrapped);
  return literal?.[1];
}

function parseAttrs(text: string): Record<string, string | true> {
  const attrs: Record<string, string | true> = {};
  let i = 0;
  while (i < text.length) {
    if (/\s/.test(text[i]!)) {
      i++;
      continue;
    }
    if (text[i] === "{") {
      // Spread ({...props}) or a JSX comment — not a named attribute.
      i = skipBraceGroup(text, i);
      continue;
    }
    const nameMatch = /^[A-Za-z_][\w-]*/.exec(text.slice(i));
    if (!nameMatch) {
      i++;
      continue;
    }
    const name = nameMatch[0];
    i += name.length;
    while (i < text.length && /\s/.test(text[i]!)) i++;
    if (text[i] !== "=") {
      attrs[name] = true;
      continue;
    }
    i++;
    while (i < text.length && /\s/.test(text[i]!)) i++;
    const valueStart = i;
    if (text[i] === "{") {
      i = skipBraceGroup(text, i);
    } else if (text[i] === '"' || text[i] === "'") {
      const quote = text[i];
      i++;
      while (i < text.length && text[i] !== quote) i++;
      i++;
    } else {
      while (i < text.length && !/\s/.test(text[i]!)) i++;
    }
    const raw = text.slice(valueStart, i);
    const literal = asStringLiteral(raw);
    attrs[name] = literal ?? true;
  }
  return attrs;
}

/** Every `<name ...>` usage of a component in `code`, in document order. */
export function findComponentUsages(code: string, name: string): ComponentUsage[] {
  const usages: ComponentUsage[] = [];
  const openTag = new RegExp(`<${escapeRegExp(name)}(?=[\\s/>])`, "g");
  let match: RegExpExecArray | null;
  while ((match = openTag.exec(code))) {
    const start = match.index;
    const attrsStart = start + match[0].length;
    const closed = findOpenTagClose(code, attrsStart);
    if (!closed) continue;
    const attrsEnd = closed.selfClosing ? closed.end - 1 : closed.end;
    usages.push({ name, attrs: parseAttrs(code.slice(attrsStart, attrsEnd)), start });
    openTag.lastIndex = closed.end;
  }
  return usages;
}
