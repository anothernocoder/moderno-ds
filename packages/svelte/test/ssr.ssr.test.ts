import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import App from "../playground/App.svelte";

/**
 * SSR — the F3.5 guarantee. `svelte/server`'s `render()` compiles and renders
 * the component to a static HTML string in Node with no browser and no client
 * runtime, exactly as an Astro server-only island would.
 *
 * Whole-app checks. Each component's server string is asserted on its own, in
 * `ssr/<slug>.ssr.test.ts`, over its playground section alone; what only the
 * whole playground can show stays here.
 */

/** The slugs of the files in `dir` (relative to this test) ending in `suffix`, sorted. */
function slugsIn(dir: string, suffix: string): string[] {
  return readdirSync(fileURLToPath(new URL(dir, import.meta.url)))
    .filter((file) => file.endsWith(suffix))
    .map((file) => file.slice(0, -suffix.length))
    .sort();
}

/** `RadioGroup` → `radio-group`: a section's name as a test file's slug. */
function slugOf(sectionName: string): string {
  return sectionName.replace(/(?<=[a-z0-9])([A-Z])/g, "-$1").toLowerCase();
}

/** Every `src/exports/<slug>.js` fragment the playground sections import, sorted. */
function fragmentsImportedBySections(): string[] {
  const sectionsDir = new URL("../playground/sections/", import.meta.url);
  const imported = new Set<string>();
  for (const file of readdirSync(fileURLToPath(sectionsDir))) {
    const source = readFileSync(new URL(file, sectionsDir), "utf8");
    for (const [, slug] of source.matchAll(/from "\.\.\/\.\.\/src\/exports\/([a-z-]+)\.js"/g)) {
      imported.add(slug!);
    }
  }
  return [...imported].sort();
}

describe("SSR (Svelte, server-only island)", () => {
  it("gives every playground section its own SSR test", () => {
    const sections = slugsIn("../playground/sections/", ".svelte").map(slugOf).sort();
    expect(sections.length).toBeGreaterThan(0);
    expect(slugsIn("./ssr/", ".ssr.test.ts")).toEqual(sections);
  });

  it("uses every export fragment of the package in some playground section", () => {
    const fragments = slugsIn("../src/exports/", ".ts").filter((slug) => !slug.startsWith("_"));
    expect(fragmentsImportedBySections()).toEqual(fragments);
  });

  it("emits static markup with no client runtime (zero <script>)", () => {
    const { html } = render(App);
    // A server-only island is pure HTML — no hydration script is injected by the
    // component itself.
    expect(html).not.toContain("<script");
  });

  it("propagates defaultOpen through to the (non-portaled) trigger state", () => {
    const { html } = render(App, { props: { open: true } });
    expect(html).toContain('data-scope="dialog"');
    expect(html).toContain('data-scope="select"');
    expect(html).toMatch(/data-part="trigger"[^>]*data-state="open"/);
  });
});
