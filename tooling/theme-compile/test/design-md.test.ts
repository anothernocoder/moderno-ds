import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  declsFor,
  defaultsFrom,
  readMeta,
  renderFrontMatter,
  withFrontMatter,
} from "../src/design-md.ts";

const tokensCss = `
/* a comment with a { brace } */
:root {
  --radius: 0.625rem;
  --overlay: oklch(0 0 0 / 0.32);
}
.dark {
  --overlay: oklch(0 0 0 / 0.6);
}
`;

const meta = { version: "alpha", name: "Test", description: "A test theme." };

describe("declsFor", () => {
  it("reads one selector's custom properties, ignoring comments", () => {
    expect(declsFor(tokensCss, ":root").get("overlay")).toBe("oklch(0 0 0 / 0.32)");
    expect(declsFor(tokensCss, ".dark").get("overlay")).toBe("oklch(0 0 0 / 0.6)");
    expect(declsFor(tokensCss, ".dark").has("radius")).toBe(false);
  });
});

describe("renderFrontMatter", () => {
  const defaults = defaultsFrom(
    readFileSync(
      fileURLToPath(new URL("../../../packages/tokens/src/tokens.css", import.meta.url)),
      "utf8",
    ),
  );
  const token = ($value: string) => ({ $value });
  // A theme that expresses two slots and inherits the rest.
  const doc = {
    light: {
      primary: token("oklch(0.3 0.1 250)"),
      "font-sans": token('"Brand Sans", system-ui, sans-serif'),
    },
    dark: {},
  };
  const out = renderFrontMatter(doc, defaults, meta);

  it("writes the theme's own light values under the contract names", () => {
    expect(out).toContain('  primary: "oklch(0.3 0.1 250)"');
    expect(out).toContain('fontFamily: "Brand Sans"');
  });

  it("resolves a dark slot the way the cascade does: the theme's :root beats the default .dark", () => {
    expect(out).toContain('  dark-primary: "oklch(0.3 0.1 250)"');
  });

  it("falls back to the neutral defaults, dark scope included", () => {
    expect(out).toContain(`  background: "${defaults.light.get("background")}"`);
    expect(out).toContain(`  dark-overlay: "${defaults.dark.get("overlay")}"`);
    expect(out).toContain(`    fontSize: ${defaults.light.get("text-ui-md")}`);
  });

  it("invents no font weight: the contract has no slot for it", () => {
    expect(out).not.toContain("fontWeight");
  });

  it("fails loudly on a slot with no value anywhere", () => {
    const empty = { light: new Map<string, string>(), dark: new Map<string, string>() };
    expect(() => renderFrontMatter(doc, empty, meta)).toThrow(/no value/);
  });
});

describe("front matter splicing", () => {
  const markdown = '---\nversion: alpha\nname: "Old"\ndescription: plain text\n---\n\n## Body\n';

  it("reads the document metadata, quoted or not", () => {
    expect(readMeta(markdown)).toEqual({
      version: "alpha",
      name: "Old",
      description: "plain text",
    });
  });

  it("replaces the block and leaves the hand-written body alone", () => {
    const out = withFrontMatter(markdown, "---\nname: New\n---\n");
    expect(out).toBe("---\nname: New\n---\n\n## Body\n");
  });
});
