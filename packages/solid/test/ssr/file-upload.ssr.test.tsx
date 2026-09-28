import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import FileUploadSection from "../../playground/sections/file-upload.jsx";

/** The text of each `scope`/`part` element, in document order. */
const texts = (html: string, part: string) =>
  [...html.matchAll(new RegExp(`data-part="${part}"[^>]*>([^<]*)<`, "g"))].map((m) => m[1]);

/** The id of each file input, in document order. */
const fileInputIds = (html: string) =>
  (html.match(/<input[^>]*>/g) ?? [])
    .filter((tag) => tag.includes('type="file"'))
    .map((tag) => attrOf(tag, "id"));

describe("FileUpload SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = renderToString(() => <FileUploadSection open={false} />);
    // Solid disposes a server render on a timer, and zag runs the machine's
    // exit action then; wait for it, so a throw there fails this test.
    await new Promise((resolve) => setTimeout(resolve));
    // Ark's file-upload machine. The recipe lands on each root; each zone is
    // a focusable button named for what it takes, which it also writes.
    expect(partAttrs(html, "file-upload", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "file-upload", "dropzone", "role")).toEqual(["button", "button"]);
    // Solid writes the attribute as tabIndex; HTML reads it either way.
    expect(partAttrs(html, "file-upload", "dropzone", "tabIndex")).toEqual(["0", "0"]);
    expect(partAttrs(html, "file-upload", "dropzone", "aria-label")).toEqual([
      "Upload logo, SVG or PNG, up to 2 MB",
      "Drop files here or click to browse, OTF or WOFF2, up to 4 files",
    ]);
    expect(texts(html, "dropzone-hint")).toEqual([
      "SVG or PNG, up to 2 MB",
      "OTF or WOFF2, up to 4 files",
    ]);
    // Inside the Field, its label points at the file input and, with the
    // hint, names the zone.
    const labelFor = partAttrs(html, "field", "label", "for");
    expect(labelFor).toEqual([fileInputIds(html)[1]]);
    const labelId = partAttrs(html, "field", "label", "id")[0];
    const hintId = partAttrs(html, "file-upload", "dropzone-hint", "id")[1];
    expect(partAttrs(html, "file-upload", "dropzone", "aria-labelledby")).toEqual([
      undefined,
      `${labelId} ${hintId}`,
    ]);
    // No file is chosen yet: no list.
    expect(partTags(html, "file-upload", "item-group")).toEqual([]);
  });
});
