/**
 * Theme Builder model — the bridge between the editor's flat, editable scopes
 * and the DTCG document `@moderno/theme-compile` validates and compiles. The
 * island edits `ThemeState`; export runs it back through the *same* compiler CI
 * uses, so a theme that exports clean here is a theme that passes CI.
 */
import { compileTheme, ThemeValidationError } from "@moderno/theme-compile";
import { COLOR_SLOTS, OTHER_SLOTS, slotType } from "@moderno/tokens/contract";

// The slot lists come from the contract data in @moderno/tokens — the same
// source theme-compile validates against, so editor and compiler can't drift.
export { COLOR_SLOTS, OTHER_SLOTS };

export type Scope = Record<string, string>;

export interface ThemeState {
  name: string;
  brand: string | null;
  light: Scope;
  dark: Scope;
}

type Token = { $type: string; $value: string };
type TokenScope = Record<string, Token>;
export interface ThemeDoc {
  $schema?: string;
  $extensions?: { "style.moderno.theme"?: { name?: string; brand?: string | null } };
  light: TokenScope;
  dark: TokenScope;
}

function scopeToState(scope: unknown): Scope {
  const out: Scope = {};
  const s = (scope ?? {}) as Record<string, Token | undefined>;
  for (const slot of [...COLOR_SLOTS, ...OTHER_SLOTS]) {
    const value = s[slot]?.$value;
    if (typeof value === "string") out[slot] = value;
  }
  return out;
}

/** Read a DTCG document into the editor's flat scopes. */
export function tokensToState(doc: unknown): ThemeState {
  const d = (doc ?? {}) as ThemeDoc;
  const meta = d.$extensions?.["style.moderno.theme"];
  return {
    name: meta?.name ?? "custom",
    brand: meta?.brand ?? null,
    light: scopeToState(d.light),
    dark: scopeToState(d.dark),
  };
}

function stateToScope(scope: Scope): TokenScope {
  const out: TokenScope = {};
  for (const [slot, value] of Object.entries(scope)) {
    out[slot] = { $type: slotType(slot), $value: value };
  }
  return out;
}

/** Emit a DTCG document from the editor state (the downloadable tokens file). */
export function stateToTokens(state: ThemeState): ThemeDoc {
  return {
    $schema: "https://www.designtokens.org/schemas/2025.10/format.json",
    $extensions: {
      "style.moderno.theme": { name: state.name, brand: state.brand },
    },
    light: stateToScope(state.light),
    dark: stateToScope(state.dark),
  };
}

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** CLI one-liner that applies the theme via the registry-aware `@moderno/cli`. */
export function cliSnippet(name: string): string {
  return `npx @moderno/cli@latest add theme-${slugify(name) || "custom"}`;
}

export interface ThemeBundle {
  tokens: ThemeDoc;
  css: string;
  warnings: string[];
  cli: string;
  valid: boolean;
  error?: string;
}

const FONT_SANS =
  '"Hedvig Letters Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const FONT_MONO = 'ui-monospace, "SFMono-Regular", "Menlo", "Consolas", monospace';

const LIGHT: Scope = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.205 0 0)",
  card: "oklch(1 0 0)",
  "card-foreground": "oklch(0.205 0 0)",
  popover: "oklch(1 0 0)",
  "popover-foreground": "oklch(0.205 0 0)",
  primary: "oklch(0.205 0 0)",
  "primary-foreground": "oklch(0.985 0 0)",
  secondary: "oklch(0.97 0 0)",
  "secondary-foreground": "oklch(0.205 0 0)",
  muted: "oklch(0.97 0 0)",
  "muted-foreground": "oklch(0.505 0 0)",
  accent: "oklch(0.97 0 0)",
  "accent-foreground": "oklch(0.205 0 0)",
  destructive: "oklch(0.577 0.245 27.325)",
  "destructive-foreground": "oklch(0.985 0 0)",
  border: "oklch(0.922 0 0)",
  input: "oklch(0.922 0 0)",
  ring: "oklch(0.205 0 0)",
  "chart-1": "oklch(0.646 0.222 41.116)",
  "chart-2": "oklch(0.6 0.118 184.704)",
  "chart-3": "oklch(0.398 0.07 227.392)",
  "chart-4": "oklch(0.828 0.189 84.429)",
  "chart-5": "oklch(0.769 0.188 70.08)",
  radius: "0rem",
  "font-sans": FONT_SANS,
  "font-mono": FONT_MONO,
};

const DARK: Scope = {
  background: "oklch(0.16 0 0)",
  foreground: "oklch(0.985 0 0)",
  card: "oklch(0.205 0 0)",
  "card-foreground": "oklch(0.985 0 0)",
  popover: "oklch(0.205 0 0)",
  "popover-foreground": "oklch(0.985 0 0)",
  primary: "oklch(0.985 0 0)",
  "primary-foreground": "oklch(0.205 0 0)",
  secondary: "oklch(0.269 0 0)",
  "secondary-foreground": "oklch(0.985 0 0)",
  muted: "oklch(0.269 0 0)",
  "muted-foreground": "oklch(0.708 0 0)",
  accent: "oklch(0.269 0 0)",
  "accent-foreground": "oklch(0.985 0 0)",
  destructive: "oklch(0.704 0.191 22.216)",
  "destructive-foreground": "oklch(0.985 0 0)",
  border: "oklch(0.27 0 0)",
  input: "oklch(0.27 0 0)",
  ring: "oklch(0.985 0 0)",
  "chart-1": "oklch(0.488 0.243 264.376)",
  "chart-2": "oklch(0.696 0.17 162.48)",
  "chart-3": "oklch(0.769 0.188 70.08)",
  "chart-4": "oklch(0.627 0.265 303.9)",
  "chart-5": "oklch(0.645 0.246 16.439)",
  radius: "0rem",
  "font-sans": FONT_SANS,
  "font-mono": FONT_MONO,
};

/** The Moderno default, the Theme Builder's starting point. */
export function defaultThemeState(): ThemeState {
  return { name: "custom", brand: null, light: { ...LIGHT }, dark: { ...DARK } };
}

/** Compact, URL-safe encoding of a state (for shareable `?t=` links). */
export function encodeState(state: ThemeState): string {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Inverse of `encodeState`; returns null on any malformed input. */
export function decodeState(encoded: string): ThemeState | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed?.light || !parsed?.dark) return null;
    return parsed as ThemeState;
  } catch {
    return null;
  }
}

/** The full export bundle, run through the real compiler so it matches CI. */
export function buildTheme(state: ThemeState): ThemeBundle {
  const tokens = stateToTokens(state);
  const cli = cliSnippet(state.name);
  try {
    const { css, warnings } = compileTheme(tokens);
    return { tokens, css, warnings, cli, valid: true };
  } catch (err) {
    const error = err instanceof ThemeValidationError ? err.message : (err as Error).message;
    return { tokens, css: "", warnings: [], cli, valid: false, error };
  }
}
