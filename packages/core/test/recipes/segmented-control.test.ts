import { describe, expect, it } from "vitest";
import {
  segmentedControlAttrs,
  segmentedControlFieldProps,
  segmentedControlRecipe,
  syncTruncationTitle,
  type TruncatableText,
} from "../../src/recipes/segmented-control.js";

describe("segmentedControlRecipe / segmentedControlAttrs", () => {
  it("defaults to size md, not full width", () => {
    expect(segmentedControlRecipe()).toEqual({ "data-size": "md" });
    expect(segmentedControlAttrs()).toEqual({ "data-size": "md" });
  });

  it("offers Field's sizes", () => {
    expect(segmentedControlRecipe.variants).toEqual({ size: ["sm", "md", "lg"] });
    expect(segmentedControlAttrs({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("adds a bare data-full-width only when fullWidth is on", () => {
    expect(segmentedControlAttrs({ size: "sm", fullWidth: true })).toEqual({
      "data-size": "sm",
      "data-full-width": "",
    });
    expect(segmentedControlAttrs({ fullWidth: false })).not.toHaveProperty("data-full-width");
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a Field size
    expect(() => segmentedControlAttrs({ size: "xl" })).toThrow(/invalid value/);
  });
});

describe("segmentedControlFieldProps", () => {
  const field = {
    ids: { label: "field::1::label" },
    disabled: true,
    invalid: true,
    readOnly: false,
    required: true,
    ariaDescribedby: "field::1::helper-text",
  };

  it("supplies nothing outside a Field", () => {
    expect(segmentedControlFieldProps(undefined, { disabled: true })).toEqual({});
  });

  it("names the group by the Field's label and describes it by the Field's texts", () => {
    expect(segmentedControlFieldProps(field, {})).toEqual({
      ids: { label: "field::1::label" },
      disabled: true,
      invalid: true,
      readOnly: false,
      required: true,
      "aria-describedby": "field::1::helper-text",
    });
  });

  it("lets every prop the consumer set win", () => {
    const own = {
      ids: { label: "mine", root: "root" },
      disabled: false,
      invalid: false,
      readOnly: true,
      required: false,
      "aria-describedby": "hint",
    };
    expect(segmentedControlFieldProps(field, own)).toEqual(own);
  });
});

describe("syncTruncationTitle", () => {
  function text(label: string, widths: { scroll: number; client: number }, title?: string) {
    const attributes = new Map<string, string>(title === undefined ? [] : [["title", title]]);
    const element: TruncatableText & { attributes: Map<string, string> } = {
      attributes,
      scrollWidth: widths.scroll,
      clientWidth: widths.client,
      textContent: `  ${label}  `,
      getAttribute: (name) => attributes.get(name) ?? null,
      setAttribute: (name, value) => void attributes.set(name, value),
      removeAttribute: (name) => void attributes.delete(name),
    };
    return element;
  }

  it("titles a cut-off label with its full text", () => {
    const cut = text("Stretch to fill", { scroll: 120, client: 80 });
    syncTruncationTitle(cut);
    expect(cut.attributes.get("title")).toBe("Stretch to fill");
  });

  it("gives a label that fits no title, and drops the one it gave once it fits", () => {
    const fits = text("Fit", { scroll: 40, client: 40 });
    syncTruncationTitle(fits);
    expect(fits.attributes.has("title")).toBe(false);

    const grown = text("Stretch", { scroll: 60, client: 60 }, "Stretch");
    syncTruncationTitle(grown);
    expect(grown.attributes.has("title")).toBe(false);
  });

  it("leaves a title the consumer set", () => {
    const own = text("Fit", { scroll: 40, client: 40 }, "Scale to fit the frame");
    syncTruncationTitle(own);
    expect(own.attributes.get("title")).toBe("Scale to fit the frame");
  });
});
