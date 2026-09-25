import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";
import { describe, expect, it } from "vitest";
import { CONTRACT, CONTRAST_PAIRS, FONT_WEIGHTS, TYPE_STEPS } from "@moderno-ui/css/contract";
import {
  BRAND_NOTES_END,
  BRAND_NOTES_START,
  defaultsFrom,
  draftBrandNotes,
  readBrandNotes,
  renderDesignMd,
} from "../src/design-md.ts";

const defaults = defaultsFrom(
  JSON.parse(
    readFileSync(
      fileURLToPath(new URL("../../../packages/css/src/tokens.dtcg.json", import.meta.url)),
      "utf8",
    ),
  ),
);

describe("defaultsFrom", () => {
  it("reads each scope's values from the neutral DTCG file, dark holding only its own", () => {
    const d = defaultsFrom({
      light: { radius: { $value: "0.625rem" }, overlay: { $value: "oklch(0 0 0 / 0.32)" } },
      dark: { overlay: { $value: "oklch(0 0 0 / 0.6)", $description: "denser" } },
    });
    expect(d.light.get("overlay")).toBe("oklch(0 0 0 / 0.32)");
    expect(d.dark.get("overlay")).toBe("oklch(0 0 0 / 0.6)");
    expect(d.dark.has("radius")).toBe(false);
  });
});
const token = ($value: string) => ({ $value });

/** A branded theme that expresses a few slots and inherits the rest. */
const doc = {
  $description: 'A "test" brand.',
  $extensions: { "style.moderno.theme": { name: "theme-ocean-breeze", brand: "ocean" } },
  light: {
    primary: token("oklch(0.45 0.12 250)"),
    "font-sans": token('"Brand Sans", system-ui, sans-serif'),
  },
  dark: {},
};

/** The body of a rendered document, front matter dropped. */
const bodyOf = (markdown: string) => markdown.replace(/^---\n[\s\S]*?\n---\n/, "");

describe("renderDesignMd — front matter", () => {
  const out = renderDesignMd(doc, defaults);
  const frontMatter = out.match(/^---\n[\s\S]*?\n---\n/)![0];

  it("names the document after the theme and describes it with the theme's $description", () => {
    expect(frontMatter).toContain('name: "Ocean Breeze"');
    // quoted as Prettier quotes it, so a formatted file stays byte-identical
    expect(frontMatter).toContain(`description: 'A "test" brand.'`);
  });

  // The same file ships from the registry and from the Theme Builder, and lands
  // in a consumer project that has no registry/ folder: it names the theme's
  // tokens, never a path that only exists in the Moderno repo.
  it("points at the theme's tokens without naming a repo-only path", () => {
    const out = renderDesignMd(doc, defaults);
    expect(frontMatter).toContain("from the theme's tokens (tokens.dtcg.json)");
    expect(out).not.toMatch(/registry\/themes|pnpm theme:build/);
  });

  it("falls back to a description when the theme has none", () => {
    expect(renderDesignMd({ ...doc, $description: undefined }, defaults)).toContain(
      'description: "The Ocean Breeze theme for the Moderno design system."',
    );
  });

  it("writes the theme's own light values under the contract names", () => {
    expect(frontMatter).toContain('  primary: "oklch(0.45 0.12 250)"');
    expect(frontMatter).toContain('fontFamily: "Brand Sans"');
  });

  it("resolves a dark slot the way the cascade does: the theme's :root beats the default .dark", () => {
    expect(frontMatter).toContain('  dark-primary: "oklch(0.45 0.12 250)"');
  });

  it("falls back to the neutral defaults, dark scope included", () => {
    expect(frontMatter).toContain(`  background: "${defaults.light.get("background")}"`);
    expect(frontMatter).toContain(`  dark-overlay: "${defaults.dark.get("overlay")}"`);
    expect(frontMatter).toContain(`    fontSize: ${defaults.light.get("text-ui-md")}`);
  });

  it("invents no font weight: the contract ties no weight to a type step", () => {
    expect(frontMatter).not.toContain("fontWeight");
  });

  it("uses only the top-level keys the DESIGN.md format allows", () => {
    const allowed = [
      "version",
      "name",
      "description",
      "colors",
      "typography",
      "rounded",
      "spacing",
    ];
    const keys = [...frontMatter.matchAll(/^([a-z]+):/gm)].map((m) => m[1]);
    expect(keys.every((k) => allowed.includes(k!))).toBe(true);
  });

  it("fails loudly on a slot with no value anywhere", () => {
    const empty = { light: new Map<string, string>(), dark: new Map<string, string>() };
    expect(() => renderDesignMd(doc, empty)).toThrow(/no value/);
  });
});

describe("renderDesignMd — system rules from the contract", () => {
  const body = bodyOf(renderDesignMd(doc, defaults));

  it("lists every contrast pair", () => {
    for (const [fg, bg] of CONTRAST_PAIRS) expect(body).toContain(`- \`${fg}\` on \`${bg}\``);
  });

  // "Each foreground on its own surface" and "muted-foreground on background,
  // card or muted" would contradict each other unless the exception is stated.
  it("states muted-foreground as the one foreground meant for several surfaces", () => {
    expect(body).toContain(
      "with one exception: `muted-foreground` is the subdued text of the whole page, meant for `background`, `card` and `muted` alike",
    );
  });

  it("names every colour slot, every type step and every weight", () => {
    for (const s of CONTRACT.filter((c) => c.type === "color"))
      expect(body).toContain(`\`${s.name}\``);
    for (const step of TYPE_STEPS) expect(body).toContain(`\`${step}\``);
    for (const weight of FONT_WEIGHTS) expect(body).toContain(`\`font-weight-${weight}\``);
  });

  it("splits the type scale into the ui-* ramp and the content ramp", () => {
    const ui = TYPE_STEPS.filter((s) => s.startsWith("ui-"));
    expect(body).toContain(`**Interface** (${ui.map((s) => `\`${s}\``).join(", ")})`);
  });

  it("restates no value: no oklch, rem or ms in the body", () => {
    expect(bodyOf(renderDesignMd(doc, defaults, { brandNotes: "Plain." }))).not.toMatch(
      /oklch\(|\d(rem|px|ms)\b/,
    );
  });

  it("is identical for every theme outside the overview and brand notes", () => {
    const other = { light: { radius: token("1rem") }, dark: {} };
    const rules = (md: string) => bodyOf(md).slice(bodyOf(md).indexOf("## Colors"));
    expect(rules(renderDesignMd(other, defaults))).toBe(rules(renderDesignMd(doc, defaults)));
  });

  it("repeats no ## heading and follows the format's section order", () => {
    const headings = [...renderDesignMd(doc, defaults).matchAll(/^## (.+)$/gm)].map((m) => m[1]!);
    expect(new Set(headings).size).toBe(headings.length);
    const canonical = [
      "Overview",
      "Colors",
      "Typography",
      "Layout",
      "Elevation & Depth",
      "Shapes",
      "Components",
      "Do's and Don'ts",
    ];
    expect(headings.filter((h) => canonical.includes(h))).toEqual(canonical);
  });

  it("describes where the theme paints: a brand scope or :root", () => {
    expect(body).toContain('`[data-brand="ocean"]`');
    const brandless = { ...doc, $extensions: { "style.moderno.theme": { brand: null } } };
    expect(renderDesignMd(brandless, defaults)).toContain("paints `:root` (light) and `.dark`");
  });

  it("ends with one newline and is Prettier-stable", async () => {
    const out = renderDesignMd(doc, defaults);
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
    expect(await prettier.format(out, { parser: "markdown", printWidth: 100 })).toBe(out);
  });
});

describe("brand notes", () => {
  const notes = "### Voice\n\nTerse.\n\n- **Shape.** Pebble-round.";

  it("keeps given notes verbatim between the markers", () => {
    const out = renderDesignMd(doc, defaults, { brandNotes: notes });
    expect(out).toContain(`${BRAND_NOTES_START}\n\n${notes}\n\n${BRAND_NOTES_END}`);
  });

  it("reads back exactly what was rendered, so a rebuild changes nothing", () => {
    const out = renderDesignMd(doc, defaults, { brandNotes: notes });
    expect(readBrandNotes(out)).toBe(notes);
    expect(renderDesignMd(doc, defaults, { brandNotes: readBrandNotes(out) })).toBe(out);
  });

  it("reads null when the markers are missing or hold nothing", () => {
    expect(readBrandNotes("## Overview\n\nNo markers.\n")).toBeNull();
    expect(readBrandNotes(`${BRAND_NOTES_START}\n\n${BRAND_NOTES_END}\n`)).toBeNull();
    expect(readBrandNotes(`${BRAND_NOTES_START}\nunterminated\n`)).toBeNull();
  });

  it("drafts notes from the theme's values when there are none", () => {
    const out = renderDesignMd(doc, defaults, { brandNotes: null });
    expect(readBrandNotes(out)).toBe(draftBrandNotes(doc, defaults));
  });

  it("rejects notes whose headings would collide with the generated sections", () => {
    expect(() => renderDesignMd(doc, defaults, { brandNotes: "## Colors\n\nMine." })).toThrow(
      /### headings/,
    );
  });
});

describe("draftBrandNotes", () => {
  const draft = draftBrandNotes(doc, defaults);

  it("says it is a draft", () => {
    expect(draft).toMatch(/^_Draft/);
  });

  it("reads the scope, the primary hue and the face off the values", () => {
    expect(draft).toContain('`[data-brand="ocean"]`');
    expect(draft).toContain("a blue `primary`");
    expect(draft).toContain("**Brand Sans**");
    // the neutral defaults round the corners and soften the shadows
    expect(draft).toContain("rounded corners");
    expect(draft).toContain("soft drop shadows");
  });

  it("calls a grey, square, ring-lit, black-and-white theme what it is", () => {
    const stark = {
      light: {
        background: token("oklch(1 0 0)"),
        foreground: token("oklch(0 0 0)"),
        primary: token("oklch(0 0 0)"),
        "primary-foreground": token("oklch(1 0 0)"),
        radius: token("0rem"),
        "font-sans": token("ui-sans-serif, system-ui, sans-serif"),
        "shadow-sm": token("0 0 0 1px oklch(0 0 0)"),
        "shadow-md": token("0 0 0 2px oklch(0 0 0)"),
        "shadow-lg": token("0 0 0 3px oklch(0 0 0)"),
      },
      dark: {},
    };
    const out = draftBrandNotes(stark, defaults);
    expect(out).toContain("the project's default brand, at `:root`");
    expect(out).toContain("monochrome");
    expect(out).toContain("system font stack");
    expect(out).toContain("sharp");
    expect(out).toContain("outline rings");
  });
});
