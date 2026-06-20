import { describe, expect, it } from "vitest";
import { cva } from "../src/index.js";

// A representative Button-shaped variant table (the real one lands in Phase 2).
const button = cva({
  variants: {
    variant: ["solid", "outline", "ghost"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "solid", size: "md" },
});

describe("cva — props resolve to data-attributes (F1.1)", () => {
  it("maps each variant prop to a data-<prop> attribute", () => {
    expect(button({ variant: "outline", size: "sm" })).toEqual({
      "data-variant": "outline",
      "data-size": "sm",
    });
  });

  it("fills omitted props from defaultVariants", () => {
    expect(button({ variant: "ghost" })).toEqual({
      "data-variant": "ghost",
      "data-size": "md",
    });
  });

  it("falls back to all defaults when called with no props", () => {
    expect(button()).toEqual({ "data-variant": "solid", "data-size": "md" });
  });

  it("is deterministic: same input → byte-identical output", () => {
    expect(button({ size: "lg" })).toEqual(button({ size: "lg" }));
  });

  it("omits an attribute that has neither a prop nor a default", () => {
    const partial = cva({
      variants: { variant: ["a", "b"], tone: ["x", "y"] },
      defaultVariants: { variant: "a" },
    });
    expect(partial()).toEqual({ "data-variant": "a" });
  });

  it("kebab-cases camelCase prop names", () => {
    const box = cva({
      variants: { fullWidth: ["true", "false"] },
      defaultVariants: { fullWidth: "true" },
    });
    expect(box()).toEqual({ "data-full-width": "true" });
  });

  it("throws on a value outside the declared set", () => {
    // @ts-expect-error — "huge" is not an allowed size
    expect(() => button({ size: "huge" })).toThrow(/size/);
  });

  it("exposes the variant schema for introspection", () => {
    expect(button.variants.variant).toEqual(["solid", "outline", "ghost"]);
  });
});
