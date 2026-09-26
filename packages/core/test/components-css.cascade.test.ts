import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import postcss, { AtRule, type Rule } from "postcss";

/**
 * Cascade cross-check for the interaction states nothing else can see.
 *
 * A screenshot captures one state, and a "does the file contain this rule"
 * assertion passes while two rules that both match fight over the same
 * property. The failure this suite exists to catch is exactly that: both rules
 * are present and correct in isolation, but one outranks the other wherever
 * they overlap — an invalid control losing its `--destructive` border to the
 * neutral hover `--ring`, because `:not()` takes the specificity of its
 * argument and lifts `:hover:not(:disabled)` a class-column above a plain
 * `[data-invalid]`.
 *
 * So this file resolves the cascade the way a browser does. It parses
 * `components.css`, matches a described element against every selector, and
 * orders the matches by (layer, specificity, source order) to report the
 * declaration that actually wins for a property in that state. The resolver is
 * generic — the tests below describe elements, never rules — so it stays
 * meaningful when the Field rules are reordered, renamed or merged.
 */

const css = readFileSync(
  fileURLToPath(new URL("../src/styles/components.css", import.meta.url)),
  "utf8",
);
const root = postcss.parse(css);

/** The stylesheet's cascade layers, weakest first (`@layer moderno.base, moderno.components`). */
const LAYERS = ["moderno.base", "moderno.components"];

/* ── The element being resolved ─────────────────────────────────────────── */

/** One element on the path from an ancestor down to the subject. */
interface El {
  /** Tag name, when a selector might key on it. */
  tag?: string;
  /** Attributes present, keyed to their value (`""` for a valueless one). */
  attrs: Record<string, string>;
  /** Pseudo-classes the element is currently in (`hover`, `disabled`, …). */
  pseudos: Set<string>;
}

/* ── Selector parsing ───────────────────────────────────────────────────── */

type Simple =
  | { kind: "universal" }
  | { kind: "type"; name: string }
  | { kind: "attr"; name: string; value?: string }
  | { kind: "pseudo"; name: string; arg?: string; isElement: boolean };

/** Split on top-level separators, ignoring anything inside `[]` or `()`. */
function splitTop(src: string, isSeparator: (c: string) => boolean): string[] {
  const out: string[] = [];
  let depth = 0;
  let inBracket = false;
  let start = 0;
  for (let i = 0; i < src.length; i += 1) {
    const c = src[i]!;
    if (c === "[") inBracket = true;
    else if (c === "]") inBracket = false;
    else if (!inBracket && c === "(") depth += 1;
    else if (!inBracket && c === ")") depth -= 1;
    else if (!inBracket && depth === 0 && isSeparator(c)) {
      out.push(src.slice(start, i));
      start = i + 1;
    }
  }
  out.push(src.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}

/** `a, b` → the selectors of a selector list (also used for `:not()`/`:is()` args). */
const splitList = (src: string): string[] => splitTop(src, (c) => c === ",");

/**
 * `a b > c` → the compounds of a complex selector, with each child combinator
 * kept as its own `>` token. Descendant and child combinators only.
 */
const splitCompounds = (src: string): string[] => splitTop(src, (c) => /\s/.test(c));

/** `[data-part="input"]:hover:not(:disabled)` → its simple selectors. */
function parseCompound(src: string): Simple[] {
  const out: Simple[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (c === "*") {
      out.push({ kind: "universal" });
      i += 1;
    } else if (c === "[") {
      const end = src.indexOf("]", i);
      if (end === -1) throw new Error(`unterminated attribute selector in "${src}"`);
      const body = src.slice(i + 1, end);
      const eq = body.indexOf("=");
      if (eq === -1) out.push({ kind: "attr", name: body.trim() });
      else {
        out.push({
          kind: "attr",
          name: body.slice(0, eq).trim(),
          value: body
            .slice(eq + 1)
            .trim()
            .replace(/^["']|["']$/g, ""),
        });
      }
      i = end + 1;
    } else if (c === ":") {
      const isElement = src[i + 1] === ":";
      let j = i + (isElement ? 2 : 1);
      const nameStart = j;
      while (j < src.length && /[a-z-]/i.test(src[j]!)) j += 1;
      const name = src.slice(nameStart, j);
      let arg: string | undefined;
      if (src[j] === "(") {
        let depth = 0;
        let k = j;
        for (; k < src.length; k += 1) {
          if (src[k] === "(") depth += 1;
          else if (src[k] === ")") {
            depth -= 1;
            if (depth === 0) break;
          }
        }
        if (depth !== 0) throw new Error(`unbalanced parentheses in "${src}"`);
        arg = src.slice(j + 1, k);
        j = k + 1;
      }
      out.push({ kind: "pseudo", name, arg, isElement });
      i = j;
    } else {
      const m = /^[a-z][a-z0-9-]*/i.exec(src.slice(i));
      if (!m) throw new Error(`unsupported selector syntax at "${src.slice(i)}"`);
      out.push({ kind: "type", name: m[0] });
      i += m[0].length;
    }
  }
  return out;
}

/* ── Matching ───────────────────────────────────────────────────────────── */

function matchesSimple(s: Simple, el: El): boolean {
  switch (s.kind) {
    case "universal":
      return true;
    case "type":
      return el.tag === s.name;
    case "attr":
      if (!(s.name in el.attrs)) return false;
      return s.value === undefined || el.attrs[s.name] === s.value;
    case "pseudo":
      // `::placeholder` and friends style a generated box, never this element.
      if (s.isElement) return false;
      if (s.name === "not") return !splitList(s.arg ?? "").some((a) => matchesCompound(a, el));
      if (s.name === "is" || s.name === "where") {
        return splitList(s.arg ?? "").some((a) => matchesCompound(a, el));
      }
      if (s.arg !== undefined) throw new Error(`unsupported functional pseudo :${s.name}()`);
      return el.pseudos.has(s.name);
  }
}

function matchesCompound(compound: string, el: El): boolean {
  return parseCompound(compound).every((s) => matchesSimple(s, el));
}

/**
 * Match a complex selector against a path (ancestors first, subject last),
 * right to left: the rightmost compound must match the subject, and each
 * compound to its left its parent (after `>`) or some strictly-earlier
 * ancestor (after a space).
 */
function matchesSelector(selector: string, path: El[]): boolean {
  const tokens = splitCompounds(selector);
  // Compound k is joined to compound k + 1 by a child (`>`) or descendant combinator.
  const compounds: string[] = [];
  const childOfLeft: boolean[] = [];
  for (const token of tokens) {
    if (token === ">") childOfLeft[compounds.length] = true;
    else compounds.push(token);
  }
  // Compound k matches path[e]; the compounds to its left must match above it.
  const matchFrom = (k: number, e: number): boolean => {
    if (!matchesCompound(compounds[k]!, path[e]!)) return false;
    if (k === 0) return true;
    if (childOfLeft[k]) return e > 0 && matchFrom(k - 1, e - 1);
    for (let a = e - 1; a >= 0; a -= 1) if (matchFrom(k - 1, a)) return true;
    return false;
  };
  return matchFrom(compounds.length - 1, path.length - 1);
}

/* ── Specificity ────────────────────────────────────────────────────────── */

type Spec = [number, number, number];

const compareSpec = (a: Spec, b: Spec): number => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** Specificity per the selectors spec: `:not`/`:is` take their strongest argument, `:where` takes none. */
function specificityOf(selector: string): Spec {
  const total: Spec = [0, 0, 0];
  for (const compound of splitCompounds(selector)) {
    if (compound === ">") continue;
    for (const s of parseCompound(compound)) {
      if (s.kind === "universal") continue;
      if (s.kind === "type") {
        total[2] += 1;
      } else if (s.kind === "attr") {
        total[1] += 1;
      } else if (s.isElement) {
        total[2] += 1;
      } else if (s.name === "where") {
        continue;
      } else if (s.name === "not" || s.name === "is") {
        const best = splitList(s.arg ?? "")
          .map(specificityOf)
          .reduce<Spec>((a, b) => (compareSpec(a, b) >= 0 ? a : b), [0, 0, 0]);
        total[0] += best[0];
        total[1] += best[1];
        total[2] += best[2];
      } else {
        total[1] += 1;
      }
    }
  }
  return total;
}

/* ── Resolution ─────────────────────────────────────────────────────────── */

/** The `@layer` a rule sits in, as an index into LAYERS. */
function layerOf(rule: Rule): number {
  for (let node = rule.parent; node; node = (node as AtRule).parent) {
    if (node instanceof AtRule && node.name === "layer" && node.nodes) {
      const idx = LAYERS.indexOf(node.params.trim());
      if (idx === -1) throw new Error(`unknown cascade layer "${node.params}"`);
      return idx;
    }
  }
  // Unlayered declarations outrank every layer.
  return LAYERS.length;
}

/**
 * The colour a declaration paints for `prop`, or undefined. `border` is a
 * shorthand that sets `border-color`, so the resting `border: 1px solid
 * var(--input)` has to compete with the longhand rules that override it.
 */
function paints(prop: string, declProp: string, value: string): string | undefined {
  if (declProp === prop) return value.trim();
  if (prop === "border-color" && declProp === "border") return value.trim().split(/\s+/).at(-1);
  if (prop === "outline-color" && declProp === "outline") return value.trim().split(/\s+/).at(-1);
  return undefined;
}

interface Winner {
  value: string;
  selector: string;
  specificity: Spec;
}

/** The declaration a browser would apply for `prop` on the subject of `path`. */
function resolve(prop: string, path: El[]): Winner | undefined {
  const matches: (Winner & { layer: number; order: number })[] = [];
  let order = 0;
  root.walkRules((rule) => {
    order += 1;
    const layer = layerOf(rule);
    const at = order;
    for (const selector of splitList(rule.selector)) {
      if (!matchesSelector(selector, path)) continue;
      const specificity = specificityOf(selector);
      rule.walkDecls((decl) => {
        const value = paints(prop, decl.prop, decl.value);
        if (value !== undefined) matches.push({ value, selector, specificity, layer, order: at });
      });
    }
  });
  if (matches.length === 0) return undefined;
  matches.sort(
    (a, b) => a.layer - b.layer || compareSpec(a.specificity, b.specificity) || a.order - b.order,
  );
  return matches.at(-1);
}

/* ── The element descriptions under test ────────────────────────────────── */

const PARTS = ["input", "textarea"] as const;

/** A Field control inside its root, in the state described. */
function fieldControl(
  part: (typeof PARTS)[number],
  state: { invalid?: boolean; disabled?: boolean; pseudos?: string[] } = {},
): El[] {
  const attrs: Record<string, string> = { "data-scope": "field", "data-part": part };
  if (state.invalid) attrs["data-invalid"] = "";
  const pseudos = new Set(state.pseudos ?? []);
  if (state.disabled) pseudos.add("disabled");
  const rootAttrs: Record<string, string> = { "data-scope": "field", "data-part": "root" };
  if (state.disabled) rootAttrs["data-disabled"] = "";
  return [
    { tag: "div", attrs: rootAttrs, pseudos: new Set() },
    { tag: part === "input" ? "input" : "textarea", attrs, pseudos },
  ];
}

describe("components.css cascade — the resolver itself", () => {
  it("counts :not() at its argument's specificity, and :where() at zero", () => {
    expect(specificityOf('[data-part="input"]:hover')).toEqual([0, 2, 0]);
    expect(specificityOf('[data-part="input"]:hover:not(:disabled)')).toEqual([0, 3, 0]);
    expect(specificityOf(":where([data-scope]) [data-part]")).toEqual([0, 1, 0]);
  });

  it("resolves the resting border of a Field control to the --input slot", () => {
    for (const part of PARTS) {
      expect(resolve("border-color", fieldControl(part))?.value).toBe("var(--input)");
    }
  });

  it("matches a child combinator on the direct parent only", () => {
    const small = numberInputControl({ size: "sm" });
    expect(resolve("height", small)?.value).toBe("var(--spacing-7)");
    // The same control one wrapper further down is no longer the root's child.
    const wrapper: El = { tag: "div", attrs: {}, pseudos: new Set() };
    const nested = [small[0]!, wrapper, small[1]!];
    expect(resolve("height", nested)?.value).toBe("var(--spacing-8)");
  });
});

/** A NumberInput control (the bordered box) inside its root, in the state described. */
function numberInputControl(
  state: { size?: string; invalid?: boolean; pseudos?: string[] } = {},
): El[] {
  const rootAttrs: Record<string, string> = { "data-scope": "number-input", "data-part": "root" };
  if (state.size) rootAttrs["data-size"] = state.size;
  const attrs: Record<string, string> = { "data-scope": "number-input", "data-part": "control" };
  if (state.invalid) attrs["data-invalid"] = "";
  return [
    { tag: "div", attrs: rootAttrs, pseudos: new Set() },
    { tag: "div", attrs, pseudos: new Set(state.pseudos ?? []) },
  ];
}

describe("components.css cascade — NumberInput's invalid box holds under the pointer", () => {
  it("keeps --destructive on a hovered invalid control", () => {
    const winner = resolve(
      "border-color",
      numberInputControl({ invalid: true, pseudos: ["hover"] }),
    );
    expect(winner?.value, `won by \`${winner?.selector}\``).toBe("var(--destructive)");
  });

  it("rings a focused invalid control in --destructive, a valid one in --ring", () => {
    const focused = ["hover", "focus-within"];
    expect(
      resolve("outline-color", numberInputControl({ invalid: true, pseudos: focused }))?.value,
    ).toBe("var(--destructive)");
    expect(resolve("outline-color", numberInputControl({ pseudos: focused }))?.value).toBe(
      "var(--ring)",
    );
    expect(resolve("border-color", numberInputControl({ pseudos: ["hover"] }))?.value).toBe(
      "var(--ring)",
    );
  });
});

describe("components.css cascade — Field's invalid state holds under the pointer", () => {
  for (const part of PARTS) {
    it(`keeps --destructive on a hovered invalid ${part}`, () => {
      // The regression: a red field the reader reaches for must not go neutral
      // before they have touched it, while its tint and error text stay red.
      const winner = resolve(
        "border-color",
        fieldControl(part, { invalid: true, pseudos: ["hover"] }),
      );
      expect(winner?.value, `won by \`${winner?.selector}\``).toBe("var(--destructive)");
    });

    it(`keeps --destructive on an invalid ${part} that is hovered and focused`, () => {
      const state = { invalid: true, pseudos: ["hover", "focus", "focus-visible"] };
      expect(resolve("border-color", fieldControl(part, state))?.value).toBe("var(--destructive)");
      expect(resolve("outline-color", fieldControl(part, state))?.value).toBe("var(--destructive)");
    });

    it(`still raises a valid ${part} to --ring on hover`, () => {
      const winner = resolve("border-color", fieldControl(part, { pseudos: ["hover"] }));
      expect(winner?.value).toBe("var(--ring)");
    });

    it(`offers no hover affordance on a disabled ${part}`, () => {
      const state = { disabled: true, pseudos: ["hover"] };
      expect(resolve("border-color", fieldControl(part, state))?.value).toBe("var(--input)");
      expect(resolve("background-color", fieldControl(part, state))?.value).toBe("var(--muted)");
    });
  }
});
