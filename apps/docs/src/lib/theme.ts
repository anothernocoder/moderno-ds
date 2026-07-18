/**
 * Theme Builder model — the bridge between the editor's flat, editable scopes
 * and the DTCG document `@moderno/theme-compile` validates and compiles. The
 * island edits `ThemeState`; export runs it back through the *same* compiler CI
 * uses, so a theme that exports clean here is a theme that passes CI.
 */
import { compileTheme, ThemeValidationError } from "@moderno/theme-compile";
import { COLOR_SLOTS, OTHER_SLOTS, slotType } from "@moderno/tokens/contract";
import modernoTokens from "../../../../registry/themes/theme-moderno/tokens.dtcg.json";

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

/**
 * The Theme Builder's starting point: the registry `theme-moderno` item read
 * through the same DTCG adapter imports use. The registry file is the single
 * authority for the default theme's values; only the name resets to `custom`.
 */
export function defaultThemeState(): ThemeState {
  return { ...tokensToState(modernoTokens), name: "custom" };
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
