import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderToString } from "solid-js/web";
import { App } from "../playground/app.jsx";

/**
 * Whole-app checks. Solid compiles this file in server mode (see
 * vitest.ssr.config.ts) so `solid-js/web`'s `renderToString` is the real
 * isomorphic renderer. Each component's server string is asserted on its own,
 * in `ssr/<slug>.ssr.test.tsx`, over its playground section alone; this file
 * checks the playground as a whole.
 */

/** The slugs of the files in `dir` (relative to this test) ending in one of `suffixes`, sorted. */
function slugsIn(dir: string, ...suffixes: string[]): string[] {
  return readdirSync(fileURLToPath(new URL(dir, import.meta.url)))
    .flatMap((file) => {
      const suffix = suffixes.find((ending) => file.endsWith(ending));
      return suffix ? [file.slice(0, -suffix.length)] : [];
    })
    .sort();
}

describe("SSR (Solid)", () => {
  it("gives every component a playground section and its own SSR test", () => {
    // `dialog.ts` re-exports Ark's Dialog, so components end in `.ts` or `.tsx`.
    const components = slugsIn("../src/", ".tsx", ".ts").filter((slug) => slug !== "index");
    expect(slugsIn("../playground/sections/", ".tsx")).toEqual(components);
    expect(slugsIn("./ssr/", ".ssr.test.tsx")).toEqual(components);
  });

  it("server-renders every section of the playground once", () => {
    const html = renderToString(() => <App />);
    const sections = html.match(/<section\b/g) ?? [];
    expect(sections).toHaveLength(slugsIn("../playground/sections/", ".tsx").length);
  });

  it("propagates defaultOpen through to the (non-portaled) trigger state", () => {
    // Solid's <Portal> is client-only, so the popover *content* isn't in the
    // server string (same as React's renderToString) — but the open state still
    // serialises onto the trigger, proving defaultOpen flows through SSR.
    const html = renderToString(() => <App open />);
    expect(html).toContain('data-scope="dialog"');
    expect(html).toContain('data-scope="select"');
    expect(html).toMatch(/data-part="trigger"[^>]*data-state="open"/);
  });
});
