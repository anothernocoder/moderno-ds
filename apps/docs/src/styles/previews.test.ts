import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const previewsDir = fileURLToPath(new URL("./previews/", import.meta.url));
const files = readdirSync(previewsDir).filter((file) => file.endsWith(".css"));

describe("preview sizing — one stylesheet per component scope", () => {
  it("has files to load", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const scope = file.replace(/\.css$/, "");

    it(`${file} styles the ${scope} scope and no other`, () => {
      const css = readFileSync(`${previewsDir}${file}`, "utf8");
      const scopes = new Set([...css.matchAll(/\[data-scope="([^"]+)"\]/g)].map((m) => m[1]));
      expect([...scopes]).toEqual([scope]);
    });
  }

  it("loads after docs.css, so a preview rule is never overridden by the page's own", () => {
    const layout = readFileSync(
      fileURLToPath(new URL("../layouts/BaseLayout.astro", import.meta.url)),
      "utf8",
    );
    const docs = layout.indexOf('import "../styles/docs.css";');
    const previews = layout.indexOf('import "../styles/previews.ts";');
    expect(docs).toBeGreaterThan(-1);
    expect(previews).toBeGreaterThan(docs);
  });

  it("leaves no component scope in docs.css", () => {
    const docsCss = readFileSync(fileURLToPath(new URL("./docs.css", import.meta.url)), "utf8");
    expect(docsCss).not.toMatch(/\[data-scope="/);
  });
});
