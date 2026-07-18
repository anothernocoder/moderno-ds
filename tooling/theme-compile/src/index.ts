import { COLOR_SLOTS, CONTRAST_PAIRS, OTHER_SLOTS } from "@moderno/tokens/contract";
import { contrastRatio, parseOklch } from "./color.ts";

export type CompileResult = {
  css: string;
  warnings: string[];
};

type Token = { $type?: string; $value: string };
type Scope = Record<string, Token>;

// The slot contract is data in @moderno/tokens: colour slots + non-colour
// slots required in both scopes, and the WCAG AA foreground/background pairs.

export class ThemeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThemeValidationError";
  }
}

function validateScope(name: string, scope: unknown): asserts scope is Scope {
  if (typeof scope !== "object" || scope === null) {
    throw new ThemeValidationError(`missing "${name}" scope`);
  }
  const s = scope as Record<string, Token | undefined>;
  for (const slot of [...COLOR_SLOTS, ...OTHER_SLOTS]) {
    const token = s[slot];
    if (!token || typeof token.$value !== "string") {
      throw new ThemeValidationError(`${name} scope is missing required slot "--${slot}"`);
    }
  }
  for (const slot of COLOR_SLOTS) {
    const value = s[slot]!.$value;
    if (parseOklch(value) === null) {
      throw new ThemeValidationError(
        `${name} scope slot "--${slot}" must be an oklch() value, got "${value}"`,
      );
    }
  }
}

function emitScope(selector: string, scope: Scope): string {
  const lines = Object.entries(scope).map(([slot, token]) => `  --${slot}: ${token.$value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

type ThemeDoc = {
  light: Scope;
  dark: Scope;
  $extensions?: { "style.moderno.theme"?: { name?: string; brand?: string | null } };
};

const AA_NORMAL_TEXT = 4.5;

function checkContrast(scopeName: string, scope: Scope, warnings: string[]): void {
  for (const [fg, bg] of CONTRAST_PAIRS) {
    const ratio = contrastRatio(scope[fg]!.$value, scope[bg]!.$value);
    if (Number.isFinite(ratio) && ratio < AA_NORMAL_TEXT) {
      warnings.push(
        `${scopeName}: --${fg} on --${bg} is ${ratio.toFixed(2)}:1 (below WCAG AA 4.5:1)`,
      );
    }
  }
}

function brandOf(doc: ThemeDoc): string | null {
  return doc.$extensions?.["style.moderno.theme"]?.brand ?? null;
}

function selectors(brand: string | null): { light: string; dark: string } {
  if (brand === null) return { light: ":root", dark: ".dark" };
  const b = `[data-brand="${brand}"]`;
  return { light: b, dark: `.dark ${b}, ${b}.dark` };
}

export function compileTheme(doc: unknown): CompileResult {
  if (typeof doc !== "object" || doc === null) {
    throw new ThemeValidationError("theme document must be an object");
  }
  const theme = doc as ThemeDoc;
  validateScope("light", theme.light);
  validateScope("dark", theme.dark);

  const warnings: string[] = [];
  checkContrast("light", theme.light, warnings);
  checkContrast("dark", theme.dark, warnings);

  const sel = selectors(brandOf(theme));
  const blocks = [emitScope(sel.light, theme.light), emitScope(sel.dark, theme.dark)];
  return { css: blocks.join("\n\n") + "\n", warnings };
}
