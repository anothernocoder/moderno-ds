import { describe, expect, it } from "vitest";
import { renderGallery, withGallery } from "../src/gallery.ts";

describe("renderGallery", () => {
  it("collapses each group and links each screenshot", () => {
    const gallery = renderGallery(
      { jev: ["a.png"] },
      (group, file) => `https://x/${group}/${file}`,
    );
    expect(gallery).toContain("<summary>jev (1)</summary>");
    expect(gallery).toContain("![a.png](https://x/jev/a.png)");
  });
});

describe("withGallery", () => {
  it("appends the gallery to a description that has none", () => {
    expect(withGallery("What changed.\n", "G")).toBe(
      "What changed.\n\n<!-- qa-shots -->\nG\n<!-- /qa-shots -->\n",
    );
  });

  it("replaces only the previous gallery", () => {
    const body = "Before\n<!-- qa-shots -->\nold\n<!-- /qa-shots -->\nAfter";
    expect(withGallery(body, "new")).toBe(
      "Before\n<!-- qa-shots -->\nnew\n<!-- /qa-shots -->\nAfter",
    );
  });
});
