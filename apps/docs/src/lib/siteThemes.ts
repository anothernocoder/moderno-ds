import { compileTheme } from "@moderno-ui/theme-compile";

/**
 * Site themes — the registry themes the docs header can switch the whole site
 * to. The docs chrome and every live preview are painted from the contract
 * slots (docs.css, components.css), so re-mapping those slots on <html> is all
 * a switch takes; no component is themed individually.
 *
 * Each registry theme is compiled from its `tokens.dtcg.json` by the same
 * `@moderno-ui/theme-compile` CI uses, so the docs cannot drift from the
 * shipped `theme.css`. That output carries its own selectors (`:root`/`.dark` for a
 * brand-less theme, `[data-brand]` for a branded one). Loaded side by side they
 * would collide, so each is re-scoped to `:root[data-brand="<id>"]` (and
 * `….dark`). At (0,2,0)/(0,3,0) that beats the neutral contract's `:root` and
 * `.dark` whatever order the stylesheets land in, and a theme's light slots
 * still reach dark mode when its dark block leaves them out — the same result
 * as installing the theme after `@moderno-ui/css` in a real app.
 *
 * "neutral" is the contract itself (`@moderno-ui/tokens`): no attribute.
 */

export const NEUTRAL_THEME = "neutral";
export const DEFAULT_SITE_THEME = "moderno";
export const SITE_THEME_STORAGE_KEY = "moderno-site-theme";

export interface SiteTheme {
  id: string;
  label: string;
}

/** Rewrite compiled theme CSS onto `:root[data-brand="<id>"]`. */
export function scopeThemeCss(css: string, id: string): string {
  const root = `:root[data-brand="${id}"]`;
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map(([, selector, body]) => `${/\.dark\b/.test(selector!) ? `${root}.dark` : root} {${body}}`)
    .join("\n");
}

/** `registry/themes/theme-contrast/tokens.dtcg.json` → `contrast`. */
function idFromPath(path: string): string {
  return path
    .split("/")
    .at(-2)!
    .replace(/^theme-/, "");
}

const sources = import.meta.glob<unknown>("../../../../registry/themes/*/tokens.dtcg.json", {
  import: "default",
  eager: true,
});

const registry = Object.entries(sources)
  .map(([path, doc]) => ({ id: idFromPath(path), css: compileTheme(doc).css }))
  .sort((a, b) =>
    a.id === DEFAULT_SITE_THEME ? -1 : b.id === DEFAULT_SITE_THEME ? 1 : a.id.localeCompare(b.id),
  );

/** Every registry theme, re-scoped, as one stylesheet for the <head>. */
export const siteThemesCss = registry.map(({ id, css }) => scopeThemeCss(css, id)).join("\n");

/** Ids the select offers and the pre-paint script accepts. */
export const siteThemeIds = [...registry.map((t) => t.id), NEUTRAL_THEME];

/** Registry themes first (default leading), the neutral contract last. */
export function siteThemes(neutralLabel: string): SiteTheme[] {
  return [
    ...registry.map(({ id }) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) })),
    { id: NEUTRAL_THEME, label: neutralLabel },
  ];
}
