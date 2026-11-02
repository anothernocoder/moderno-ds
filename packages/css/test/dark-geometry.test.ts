import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import postcss, { type Rule } from "postcss";

/**
 * Dark mode changes colours and nothing else. That is what lets the docs e2e
 * suite measure layout in one scheme only, so a dark rule that could move a box
 * fails here rather than going unseen there.
 */

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const read = (path: string) => readFileSync(`${repoRoot}${path}`, "utf8");

const COLOUR_VALUE = /oklch|rgb|hsl|#[0-9a-f]{3}|color-mix|transparent/i;
const COLOUR_PROPERTY =
  /^(color|background|border(-\w+)?-color|fill|stroke|box-shadow|outline-color)/;
const isDark = (rule: Rule) => /\.dark\b/.test(rule.selector);

function darkDeclarations(css: string): { prop: string; value: string }[] {
  const found: { prop: string; value: string }[] = [];
  postcss.parse(css).walkRules((rule) => {
    if (!isDark(rule)) return;
    rule.walkDecls(({ prop, value }) => {
      if (!COLOUR_VALUE.test(value) && !COLOUR_PROPERTY.test(prop)) found.push({ prop, value });
    });
  });
  return found;
}

function lightValues(css: string): Map<string, string> {
  const values = new Map<string, string>();
  postcss.parse(css).walkRules((rule) => {
    if (!isDark(rule)) rule.walkDecls(({ prop, value }) => void values.set(prop, value));
  });
  return values;
}

const tokenFiles = [
  "packages/css/src/tokens.css",
  ...readdirSync(`${repoRoot}registry/themes`).map((theme) => `registry/themes/${theme}/theme.css`),
];

const componentStylesheets = readdirSync(`${repoRoot}packages/core/src/styles/components`).map(
  (file) => `packages/core/src/styles/components/${file}`,
);

const componentSources = [
  "registry",
  "packages/react/src",
  "packages/vue/src",
  "packages/solid/src",
  "packages/svelte/src",
].flatMap((dir) =>
  (readdirSync(`${repoRoot}${dir}`, { recursive: true }) as string[])
    .filter((file) => /\.(tsx?|vue|svelte)$/.test(file))
    .map((file) => `${dir}/${file}`),
);

describe("dark mode changes colours only", () => {
  it.each(tokenFiles)("%s gives every other token its light value", (file) => {
    const css = read(file);
    const light = lightValues(css);
    for (const { prop, value } of darkDeclarations(css)) {
      expect(value, `${file}: ${prop}`).toBe(light.get(prop));
    }
  });

  it("no component stylesheet sets anything but colour under .dark", () => {
    const offenders = componentStylesheets.flatMap((file) =>
      darkDeclarations(read(file)).map(({ prop }) => `${file}: ${prop}`),
    );
    expect(offenders).toEqual([]);
  });

  it("no component source uses a dark: utility that changes geometry", () => {
    const geometry =
      /\bdark:(w-|h-|size-|min-|max-|p[xytblr]?-|m[xytblr]?-|flex|grid|hidden|block|inline|gap-|space-|text-(xs|sm|base|lg|xl)|leading-|border-[0-9]|absolute|relative|top-|left-)/;
    expect(componentSources.filter((file) => geometry.test(read(file)))).toEqual([]);
  });
});
