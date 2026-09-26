import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import FieldSection from "../../playground/sections/field.jsx";

describe("Field SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <FieldSection open={false} />);
    expect(html).toContain('data-scope="field"');
    // Field's own recipe, read off the field roots themselves — a whole-document
    // match would be satisfied by another component's `data-size` and would
    // survive a Root that stopped applying the recipe.
    expect(partAttrs(html, "field", "root", "data-size")).toEqual(["sm", "lg"]);
    // The second field's control is Field's own Textarea part.
    expect(partTags(html, "field", "textarea")).toHaveLength(1);
  });
});
