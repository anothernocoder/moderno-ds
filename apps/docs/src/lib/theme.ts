/**
 * Theme Builder model — the bridge between the editor's flat, editable scopes
 * and the DTCG document `@moderno-ui/theme-compile` validates and compiles. The
 * island edits `ThemeState`; export runs it back through the *same* compiler CI
 * uses, so a theme that exports clean here is a theme that passes CI. Its
 * DESIGN.md comes from the same renderer `pnpm theme:build` uses, too.
 */
import {
  compileTheme,
  defaultsFrom,
  readBrandNotes,
  renderDesignMd,
  ThemeValidationError,
} from "@moderno-ui/theme-compile";
import { COLOR_SLOTS, EXTENDED_SLOTS, OTHER_SLOTS, slotType } from "@moderno-ui/css/contract";
// The neutral defaults a theme inherits, from the DTCG file tokens.css is
// compiled from: DESIGN.md's front matter lists every slot a theme leaves out
// at this value.
import neutralTokens from "@moderno-ui/css/tokens.dtcg.json";
import modernoTokens from "../../../../registry/themes/theme-moderno/tokens.dtcg.json";

export { readBrandNotes };

// The slot lists come from the contract data in @moderno-ui/css — the same
// source theme-compile validates against, so editor and compiler can't drift.
export { COLOR_SLOTS, EXTENDED_SLOTS, OTHER_SLOTS };

/** Every slot the editor puts a field on, in contract order. */
const EDITABLE_SLOTS = [...COLOR_SLOTS, ...OTHER_SLOTS, ...EXTENDED_SLOTS];

export type Scope = Record<string, string>;

export interface ThemeState {
  name: string;
  /** A sentence on the theme, exported as `$description` (DESIGN.md's description); "" for none. */
  description: string;
  brand: string | null;
  /**
   * The registry item the theme was imported from (`theme-moderno`), or null
   * for the default, a pasted theme and a reset. Only the item id is kept, not
   * its brand notes: a few bytes in the `?t=` link, and the notes are fetched
   * again from `/r/themes/<base>/DESIGN.md` when the link is opened.
   */
  base: string | null;
  light: Scope;
  dark: Scope;
}

type Token = { $type: string; $value: string };
type TokenScope = Record<string, Token>;
export interface ThemeDoc {
  $schema?: string;
  $description?: string;
  $extensions?: { "style.moderno.theme"?: { name?: string; brand?: string | null } };
  light: TokenScope;
  dark: TokenScope;
}

function scopeToState(scope: unknown): Scope {
  const out: Scope = {};
  const s = (scope ?? {}) as Record<string, Token | undefined>;
  for (const slot of EDITABLE_SLOTS) {
    const value = s[slot]?.$value;
    if (typeof value === "string") out[slot] = value;
  }
  return out;
}

/**
 * Read a DTCG document into the editor's flat scopes. `base` is the registry
 * item it came from, when it did; a pasted document has none.
 */
export function tokensToState(doc: unknown, base: string | null = null): ThemeState {
  const d = (doc ?? {}) as ThemeDoc;
  const meta = d.$extensions?.["style.moderno.theme"];
  return {
    name: meta?.name ?? "custom",
    description: typeof d.$description === "string" ? d.$description : "",
    brand: meta?.brand ?? null,
    base,
    light: scopeToState(d.light),
    dark: scopeToState(d.dark),
  };
}

/**
 * Is this field a value the theme expresses? An editor field left blank is an
 * *unexpressed* extended slot: the theme inherits the neutral default from
 * `@moderno-ui/css`. Emitting it anyway would blank the slot instead of
 * overriding it — theme-compile rejects that in the export, and in the preview
 * `--slot: ` is a valid *empty* custom property whose `var(--slot)` substitutes
 * to nothing. Export and preview must therefore agree on this one predicate.
 */
function expressed(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function stateToScope(scope: Scope): TokenScope {
  const out: TokenScope = {};
  for (const [slot, value] of Object.entries(scope)) {
    if (!expressed(value)) continue;
    out[slot] = { $type: slotType(slot), $value: value };
  }
  return out;
}

/**
 * Inline `style` for the live preview stage — the same scope the export emits,
 * so clearing a field previews what the exported theme.css actually renders:
 * the inherited default, not a blanked slot.
 */
export function previewStyle(scope: Scope): string {
  return Object.entries(scope)
    .filter(([, value]) => expressed(value))
    .map(([slot, value]) => `--${slot}: ${value}`)
    .join("; ");
}

/**
 * Emit a DTCG document from the editor state (the downloadable tokens file).
 * The base theme decides whether the export is branded; its brand id follows
 * the name. Copied as-is, a theme started from Contrast would claim
 * `data-brand="contrast"` and collide with it.
 */
export function stateToTokens(state: ThemeState): ThemeDoc {
  const brand = state.brand === null ? null : themeSlug(state.name);
  const description = (state.description ?? "").trim();
  return {
    $schema: "https://www.designtokens.org/schemas/2025.10/format.json",
    ...(description === "" ? {} : { $description: description }),
    $extensions: {
      "style.moderno.theme": { name: state.name, brand },
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

/**
 * A theme's short name, the part after `theme-`: `theme-ocean`, `Ocean` and
 * `ocean` all give `ocean`. A registry base imports under its item name
 * (`theme-moderno`), so the prefix has to come off before anything adds it back.
 */
export function themeSlug(name: string): string {
  return slugify(name).replace(/^theme-/, "") || "custom";
}

/** CLI one-liner that applies the theme via the registry-aware `@moderno-ui/cli`. */
export function cliSnippet(name: string): string {
  return `npx @moderno-ui/cli@latest add theme-${themeSlug(name)}`;
}

export interface ThemeBundle {
  tokens: ThemeDoc;
  css: string;
  /** The theme's DESIGN.md, rendered from `tokens`; "" when the theme is invalid. */
  designMd: string;
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
  return { ...tokensToState(modernoTokens), name: "custom", description: "" };
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
    // A link from before a field existed still opens, with that field empty.
    return {
      ...parsed,
      name: typeof parsed.name === "string" ? parsed.name : "custom",
      description: typeof parsed.description === "string" ? parsed.description : "",
      brand: typeof parsed.brand === "string" ? parsed.brand : null,
      base: typeof parsed.base === "string" ? parsed.base : null,
    } as ThemeState;
  } catch {
    return null;
  }
}

const TOKEN_DEFAULTS = defaultsFrom(neutralTokens);

/**
 * The brand notes a DESIGN.md export keeps: the imported base's own, only
 * while the theme is still that base. It is the test the exported brand
 * follows: the base's brand survives exactly while the name's slug is the
 * base's (`theme-contrast` or `Contrast`, not `Ocean`). Renamed, pasted or
 * started from the default, this is null, and the renderer drafts notes from
 * the theme's values instead.
 */
export function keptBrandNotes(
  state: ThemeState,
  baseNotes: string | null | undefined,
): string | null {
  return isStillBase(state) && baseNotes != null ? baseNotes : null;
}

/** Is the theme still the registry base it was imported from? (See `keptBrandNotes`.) */
export function isStillBase(state: ThemeState): boolean {
  return state.base !== null && themeSlug(state.name) === themeSlug(state.base);
}

/**
 * The full export bundle, run through the real compiler so it matches CI.
 * `baseNotes` are the brand notes of the registry base the theme was imported
 * from (`readBrandNotes` of its DESIGN.md); `keptBrandNotes` decides whether
 * the DESIGN.md keeps them.
 */
export function buildTheme(state: ThemeState, baseNotes?: string | null): ThemeBundle {
  const tokens = stateToTokens(state);
  const cli = cliSnippet(state.name);
  try {
    const { css, warnings } = compileTheme(tokens);
    const designMd = renderDesignMd(tokens, TOKEN_DEFAULTS, {
      brandNotes: keptBrandNotes(state, baseNotes),
    });
    return { tokens, css, designMd, warnings, cli, valid: true };
  } catch (err) {
    const error = err instanceof ThemeValidationError ? err.message : (err as Error).message;
    return { tokens, css: "", designMd: "", warnings: [], cli, valid: false, error };
  }
}
