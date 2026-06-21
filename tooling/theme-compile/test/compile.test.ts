import { describe, expect, it } from "vitest";
import { compileTheme } from "../src/index.ts";
import { contrastRatio } from "../src/color.ts";

/**
 * theme-compile turns a theme's tokens.dtcg.json into theme.css. The public
 * surface is `compileTheme(doc)` → `{ css, warnings }`; it throws on an invalid
 * document. These tests exercise that contract, not the internal helpers.
 */

// A minimal, contrast-safe contract slot set, reused across tests. Only the
// colour slots the contract requires plus radius/fonts; values are pure B/W so
// every foreground/background pair is 21:1 (no contrast warnings).
function slots(fg: string, bg: string): Record<string, { $type: string; $value: string }> {
  const c = (v: string) => ({ $type: "color", $value: v });
  return {
    background: c(bg),
    foreground: c(fg),
    card: c(bg),
    "card-foreground": c(fg),
    popover: c(bg),
    "popover-foreground": c(fg),
    primary: c(fg),
    "primary-foreground": c(bg),
    secondary: c(bg),
    "secondary-foreground": c(fg),
    muted: c(bg),
    "muted-foreground": c(fg),
    accent: c(bg),
    "accent-foreground": c(fg),
    destructive: c(bg),
    "destructive-foreground": c(fg),
    border: c(fg),
    input: c(fg),
    ring: c(fg),
    "chart-1": c("oklch(0.646 0.222 41.116)"),
    "chart-2": c("oklch(0.6 0.118 184.704)"),
    "chart-3": c("oklch(0.398 0.07 227.392)"),
    "chart-4": c("oklch(0.828 0.189 84.429)"),
    "chart-5": c("oklch(0.769 0.188 70.08)"),
    radius: { $type: "dimension", $value: "0.625rem" },
    "font-sans": { $type: "fontFamily", $value: "ui-sans-serif, system-ui" },
    "font-mono": { $type: "fontFamily", $value: "ui-monospace, monospace" },
  };
}

function defaultTheme() {
  return {
    $description: "Test default theme",
    $extensions: { "style.moderno.theme": { name: "theme-test" } },
    light: slots("oklch(0 0 0)", "oklch(1 0 0)"),
    dark: slots("oklch(1 0 0)", "oklch(0 0 0)"),
  };
}

describe("compileTheme — default brand emits :root and .dark", () => {
  it("emits a :root block with the contract slots and a .dark companion", () => {
    const { css } = compileTheme(defaultTheme());
    expect(css).toMatch(/:root\s*\{/);
    expect(css).toContain("--background: oklch(1 0 0);");
    expect(css).toContain("--foreground: oklch(0 0 0);");
    expect(css).toMatch(/\.dark\s*\{/);
    // dark scope inverts background
    expect(css).toMatch(/\.dark\s*\{[^}]*--background: oklch\(0 0 0\);/s);
  });
});

describe("contrastRatio — WCAG math", () => {
  it("computes ~21:1 for black on white and ~1:1 for identical colours", () => {
    expect(contrastRatio("oklch(0 0 0)", "oklch(1 0 0)")).toBeCloseTo(21, 0);
    expect(contrastRatio("oklch(1 0 0)", "oklch(1 0 0)")).toBeCloseTo(1, 1);
  });
});

describe("compileTheme — contrast warnings", () => {
  it("emits no warnings when every foreground/background pair passes AA", () => {
    const { warnings } = compileTheme(defaultTheme());
    expect(warnings).toEqual([]);
  });

  it("warns, naming slot and scope, when a text pair falls below 4.5:1", () => {
    const doc = defaultTheme();
    // muted-foreground on muted, both light grey → low contrast
    doc.light.muted = { $type: "color", $value: "oklch(0.97 0 0)" };
    doc.light["muted-foreground"] = { $type: "color", $value: "oklch(0.92 0 0)" };
    const { warnings } = compileTheme(doc);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.join("\n")).toMatch(/muted-foreground/);
    expect(warnings.join("\n")).toMatch(/light/);
  });
});

describe("compileTheme — validation rejects an incomplete contract", () => {
  it("throws naming the missing slot and scope", () => {
    const doc = defaultTheme();
    delete (doc.light as Record<string, unknown>).ring;
    expect(() => compileTheme(doc)).toThrow(/ring/);
    expect(() => compileTheme(doc)).toThrow(/light/);
  });

  it("throws when a scope is absent entirely", () => {
    const doc = defaultTheme() as Record<string, unknown>;
    delete doc.dark;
    expect(() => compileTheme(doc)).toThrow(/dark/);
  });

  it("throws when a colour slot is not a valid oklch() value", () => {
    const doc = defaultTheme();
    (doc.light.primary as { $value: string }).$value = "#ff0000";
    expect(() => compileTheme(doc)).toThrow(/oklch/i);
  });
});

describe("compileTheme — branded theme scopes under [data-brand]", () => {
  it("emits [data-brand] and a dark companion that composes with .dark, not :root", () => {
    const branded = {
      ...defaultTheme(),
      $extensions: { "style.moderno.theme": { name: "theme-contrast", brand: "contrast" } },
    };
    const { css } = compileTheme(branded);
    expect(css).not.toMatch(/:root\s*\{/);
    expect(css).toContain('[data-brand="contrast"] {');
    // dark variant must match both descendant and self-composed forms
    expect(css).toContain('.dark [data-brand="contrast"], [data-brand="contrast"].dark {');
  });
});
