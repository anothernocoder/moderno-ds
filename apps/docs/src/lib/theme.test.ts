import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildTheme,
  cliSnippet,
  decodeState,
  defaultThemeState,
  encodeState,
  stateToTokens,
  tokensToState,
} from "./theme.ts";

const modernoTokens = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL("../../../../registry/themes/theme-moderno/tokens.dtcg.json", import.meta.url),
    ),
    "utf8",
  ),
);

describe("tokensToState / stateToTokens — round trip", () => {
  it("reads a DTCG doc into editable scopes", () => {
    const state = tokensToState(modernoTokens);
    expect(state.light.background).toBe("oklch(1 0 0)");
    expect(state.dark.background).toBe("oklch(0.16 0 0)");
    expect(state.brand).toBe(null);
  });

  it("re-emits a DTCG doc the compiler accepts", () => {
    const state = tokensToState(modernoTokens);
    const doc = stateToTokens(state);
    expect(doc.light.background.$type).toBe("color");
    expect(doc.light.radius.$type).toBe("dimension");
    expect(doc.light["font-sans"].$type).toBe("fontFamily");
  });
});

describe("buildTheme — export bundle", () => {
  it("emits theme.css with both scopes and reports valid", () => {
    const result = buildTheme(tokensToState(modernoTokens));
    expect(result.valid).toBe(true);
    expect(result.css).toContain(":root {");
    expect(result.css).toContain(".dark {");
    expect(result.tokens.light.primary.$type).toBe("color");
  });

  it("flags a sub-AA contrast pair as a warning, still valid", () => {
    const state = tokensToState(modernoTokens);
    state.light["primary-foreground"] = "oklch(0.205 0 0)"; // dark text on dark primary
    const result = buildTheme(state);
    expect(result.valid).toBe(true);
    expect(result.warnings.join(" ")).toMatch(/primary-foreground/);
  });

  it("reports invalid when a required slot is dropped", () => {
    const state = tokensToState(modernoTokens);
    delete (state.light as Record<string, string>).ring;
    const result = buildTheme(state);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/ring/);
  });
});

describe("cliSnippet", () => {
  it("references the theme by a slugified name", () => {
    expect(cliSnippet("My Brand")).toContain("my-brand");
  });
});

describe("default + URL persistence", () => {
  it("ships a default state the compiler accepts", () => {
    expect(buildTheme(defaultThemeState()).valid).toBe(true);
  });

  it("round-trips a state through encode/decode", () => {
    const state = defaultThemeState();
    state.name = "acme";
    state.light.primary = "oklch(0.5 0.2 250)";
    const decoded = decodeState(encodeState(state))!;
    expect(decoded.name).toBe("acme");
    expect(decoded.light.primary).toBe("oklch(0.5 0.2 250)");
  });

  it("returns null on malformed input", () => {
    expect(decodeState("not-base64!!")).toBe(null);
  });
});
