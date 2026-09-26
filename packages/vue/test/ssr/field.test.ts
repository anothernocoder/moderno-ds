// @vitest-environment node
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import FieldSection from "../../playground/sections/field.js";
import { renderSection } from "./render-section.js";

describe("Field SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(FieldSection);
    expect(html).toContain('data-scope="field"');
    // Field's own recipe, read off the field roots themselves: a Root that
    // stopped applying the recipe (Vue's attrs forwarding is exactly the kind
    // of thing that can drop it) fails here.
    expect(partAttrs(html, "field", "root", "data-size")).toEqual(["sm", "lg"]);
    // The second field's control is Field's own Textarea part.
    expect(partTags(html, "field", "textarea")).toHaveLength(1);
  });
});
