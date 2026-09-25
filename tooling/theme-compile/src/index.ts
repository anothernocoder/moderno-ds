import {
  COLOR_SLOTS,
  CONTRAST_PAIRS,
  EXTENDED_SLOTS,
  OTHER_SLOTS,
  slotType,
} from "@moderno-ui/css/contract";
import { contrastRatio, parseOklch } from "./color.ts";

export {
  BRAND_NOTES_END,
  BRAND_NOTES_START,
  defaultsFrom,
  draftBrandNotes,
  readBrandNotes,
  renderDesignMd,
  type Defaults,
} from "./design-md.ts";

export type CompileResult = {
  css: string;
  warnings: string[];
};

type Token = { $type?: string; $value: string };
type Scope = Record<string, Token>;

// The slot contract is data in @moderno-ui/css: colour slots + non-colour
// slots required in both scopes, and the WCAG AA foreground/background pairs.

export class ThemeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThemeValidationError";
  }
}

/**
 * `neutral` compiles the neutral defaults (`packages/css/src/tokens.dtcg.json`)
 * instead of a theme. The rules are a theme's, with one addition: the light
 * scope must define every extended slot too, since a theme that omits one
 * inherits it from there. Its dark scope, like a theme's, overrides an
 * extended slot only where dark mode changes it; the rest resolves from `:root`.
 */
export type CompileOptions = { neutral?: boolean };

function validateScope(
  name: string,
  scope: unknown,
  requireExtended = false,
): asserts scope is Scope {
  if (typeof scope !== "object" || scope === null) {
    throw new ThemeValidationError(`missing "${name}" scope`);
  }
  const s = scope as Record<string, Token | undefined>;
  const required = requireExtended
    ? [...COLOR_SLOTS, ...OTHER_SLOTS, ...EXTENDED_SLOTS]
    : [...COLOR_SLOTS, ...OTHER_SLOTS];
  for (const slot of required) {
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
  // Extended slots (display face, elevation, modal scrim, container breakpoints,
  // spacing, motion, type scale, font weights) are optional in a theme —
  // `@moderno-ui/css` already ships a neutral default for each. A theme that
  // *does* express one must give it a real value, or the emitted `--slot: ;`
  // would silently blank the default instead of overriding it. An extended colour (`--overlay`) is held to the same OKLCH
  // rule as the required colours.
  for (const slot of EXTENDED_SLOTS) {
    const token = s[slot];
    if (token === undefined) continue;
    if (typeof token.$value !== "string" || token.$value.trim() === "") {
      throw new ThemeValidationError(
        `${name} scope slot "--${slot}" is present but empty — drop it to inherit the default`,
      );
    }
    if (slotType(slot) === "color" && parseOklch(token.$value) === null) {
      throw new ThemeValidationError(
        `${name} scope slot "--${slot}" must be an oklch() value, got "${token.$value}"`,
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

export function compileTheme(doc: unknown, options: CompileOptions = {}): CompileResult {
  if (typeof doc !== "object" || doc === null) {
    throw new ThemeValidationError("theme document must be an object");
  }
  const theme = doc as ThemeDoc;
  const neutral = options.neutral === true;
  validateScope("light", theme.light, neutral);
  validateScope("dark", theme.dark);
  if (neutral && brandOf(theme) !== null) {
    throw new ThemeValidationError(
      "the neutral defaults paint :root and .dark, so they take no brand",
    );
  }

  const warnings: string[] = [];
  checkContrast("light", theme.light, warnings);
  checkContrast("dark", theme.dark, warnings);

  const sel = selectors(brandOf(theme));
  const blocks = [emitScope(sel.light, theme.light), emitScope(sel.dark, theme.dark)];
  return { css: blocks.join("\n\n") + "\n", warnings };
}
