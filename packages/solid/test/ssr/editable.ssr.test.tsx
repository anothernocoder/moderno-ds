import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import EditableSection from "../../playground/sections/editable.jsx";

/**
 * Whether each Editable `part` tag carries `attr`, with or without a value:
 * Vue and Solid write an empty one without its `=""`, and Solid's server
 * writes `tabIndex` as JSX spells it.
 */
const carries = (html: string, part: string, attr: string) =>
  partTags(html, "editable", part).map((tag) =>
    new RegExp(`\\s${attr}(?=[\\s=>/])`, "i").test(tag),
  );

describe("Editable SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <EditableSection open={false} />);
    // Ark's editable machine. The recipe lands on each root; each text
    // reaches the server as a button in the tab order, named by its label
    // and its value (the placeholder when empty), with the input hidden and
    // named by the same label — a Field's label when it sits in a Field.
    // The buttons carry their words as names; a disabled text is no button.
    expect(partAttrs(html, "editable", "root", "data-size")).toEqual(["md", "sm", "lg"]);
    expect(partAttrs(html, "editable", "preview", "role")).toEqual(["button", "button", undefined]);
    expect(carries(html, "preview", "tabindex")).toEqual([true, true, false]);
    expect(partAttrs(html, "editable", "preview", "aria-label")).toEqual([
      "Background",
      "Untitled",
      "Track 1",
    ]);
    expect(carries(html, "preview", "data-placeholder-shown")).toEqual([false, true, false]);
    expect(carries(html, "preview", "data-disabled")).toEqual([false, false, true]);
    const [layerLabel, trackLabel] = partAttrs(html, "editable", "label", "id");
    const [fieldLabel] = partAttrs(html, "field", "label", "id");
    const previews = partAttrs(html, "editable", "preview", "id");
    expect(partAttrs(html, "editable", "preview", "aria-labelledby")).toEqual([
      `${layerLabel} ${previews[0]}`,
      `${fieldLabel} ${previews[1]}`,
      undefined,
    ]);
    expect(carries(html, "input", "hidden")).toEqual([true, true, true]);
    expect(partAttrs(html, "editable", "input", "aria-labelledby")).toEqual([
      layerLabel,
      fieldLabel,
      trackLabel,
    ]);
    expect(partAttrs(html, "field", "label", "for")).toEqual([
      partAttrs(html, "editable", "input", "id")[1],
    ]);
    expect(partAttrs(html, "editable", "edit-trigger", "aria-label")).toEqual(["Edit"]);
    expect(partAttrs(html, "editable", "submit-trigger", "aria-label")).toEqual(["Save"]);
    expect(partAttrs(html, "editable", "cancel-trigger", "aria-label")).toEqual(["Cancel"]);
  });
});
