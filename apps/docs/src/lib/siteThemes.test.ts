import { describe, expect, it } from "vitest";
import { scopeThemeCss, siteThemeIds, siteThemesCss } from "./siteThemes.ts";

describe("scopeThemeCss", () => {
  it("moves a brand-less theme off :root/.dark onto its data-brand", () => {
    const css =
      "/* Generated. Do not edit. */\n:root {\n  --radius: 0rem;\n}\n.dark {\n  --primary: red;\n}\n";
    expect(scopeThemeCss(css, "moderno")).toBe(
      ':root[data-brand="moderno"] {\n  --radius: 0rem;\n}\n:root[data-brand="moderno"].dark {\n  --primary: red;\n}',
    );
  });

  it("collapses a branded theme's dark selector list to one scope", () => {
    const css =
      '[data-brand="contrast"] {\n  --a: 1;\n}\n.dark [data-brand="contrast"], [data-brand="contrast"].dark {\n  --a: 2;\n}';
    expect(scopeThemeCss(css, "contrast")).toBe(
      ':root[data-brand="contrast"] {\n  --a: 1;\n}\n:root[data-brand="contrast"].dark {\n  --a: 2;\n}',
    );
  });
});

describe("registry themes", () => {
  it("offers every registry theme, default first, neutral last", () => {
    expect(siteThemeIds[0]).toBe("moderno");
    expect(siteThemeIds).toContain("contrast");
    expect(siteThemeIds.at(-1)).toBe("neutral");
  });

  it("scopes every theme under its own data-brand", () => {
    expect(siteThemesCss).toContain(':root[data-brand="moderno"] {');
    expect(siteThemesCss).toContain(':root[data-brand="contrast"].dark {');
    expect(siteThemesCss).not.toMatch(/^:root \{/m);
  });
});
