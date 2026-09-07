import { describe, expect, it } from "vitest";
import {
  alertRecipe,
  alertRole,
  buttonRecipe,
  cardRecipe,
  checkboxRecipe,
  dividerRecipe,
  fieldRecipe,
  pinInputRecipe,
  selectRecipe,
} from "../src/recipes.js";

describe("buttonRecipe", () => {
  it("applies defaults when no props are given", () => {
    expect(buttonRecipe()).toEqual({
      "data-variant": "primary",
      "data-size": "md",
    });
  });

  it("maps props to data-attributes", () => {
    expect(buttonRecipe({ variant: "outline", size: "lg" })).toEqual({
      "data-variant": "outline",
      "data-size": "lg",
    });
  });

  it("exposes its variant schema for introspection", () => {
    expect(buttonRecipe.variants.variant).toContain("destructive");
    expect(buttonRecipe.variants.size).toEqual(["sm", "md", "lg"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "huge" is not a valid size
    expect(() => buttonRecipe({ size: "huge" })).toThrow(/invalid value/);
  });
});

describe("cardRecipe", () => {
  it("applies defaults when no props are given", () => {
    expect(cardRecipe()).toEqual({ "data-variant": "outline", "data-size": "md" });
  });

  it("maps props to data-attributes", () => {
    expect(cardRecipe({ variant: "muted", size: "lg" })).toEqual({
      "data-variant": "muted",
      "data-size": "lg",
    });
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "elevated" is not a valid card variant
    expect(() => cardRecipe({ variant: "elevated" })).toThrow(/invalid value/);
  });
});

describe("checkboxRecipe", () => {
  it("defaults to size md", () => {
    expect(checkboxRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(checkboxRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for the states Ark already tracks", () => {
    // checked / indeterminate / disabled / invalid surface as Ark's own
    // data-attributes, so they must never become recipe variants.
    expect(Object.keys(checkboxRecipe.variants)).toEqual(["size"]);
  });
});

describe("selectRecipe", () => {
  it("defaults to size md", () => {
    expect(selectRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(selectRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });
});

describe("fieldRecipe", () => {
  it("defaults to size md", () => {
    expect(fieldRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(fieldRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for the states Ark already tracks", () => {
    // invalid/disabled/required are Ark data-attributes, not recipe variants.
    expect(Object.keys(fieldRecipe.variants)).toEqual(["size"]);
  });
});

describe("alertRecipe", () => {
  it("defaults to the informational status at md", () => {
    expect(alertRecipe()).toEqual({ "data-variant": "info", "data-size": "md" });
  });

  it("maps variant/size to data-attributes", () => {
    expect(alertRecipe({ variant: "error", size: "sm" })).toEqual({
      "data-variant": "error",
      "data-size": "sm",
    });
  });

  it("covers the four statuses", () => {
    expect(alertRecipe.variants.variant).toEqual(["info", "success", "warning", "error"]);
  });

  it("rejects a status outside the schema", () => {
    // @ts-expect-error — "danger" is not a Moderno status; the slot is "error"
    expect(() => alertRecipe({ variant: "danger" })).toThrow(/invalid value/);
  });
});

describe("alertRole", () => {
  it("interrupts for the urgent statuses", () => {
    expect(alertRole("warning")).toBe("alert");
    expect(alertRole("error")).toBe("alert");
  });

  it("reports politely for the non-urgent ones, including the default", () => {
    expect(alertRole("info")).toBe("status");
    expect(alertRole("success")).toBe("status");
    expect(alertRole()).toBe("status");
  });
});

describe("dividerRecipe", () => {
  it("defaults to a centred horizontal rule", () => {
    expect(dividerRecipe()).toEqual({ "data-align": "center", "data-orientation": "horizontal" });
  });

  it("maps orientation/align to data-attributes", () => {
    expect(dividerRecipe({ orientation: "vertical", align: "start" })).toEqual({
      "data-align": "start",
      "data-orientation": "vertical",
    });
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "diagonal" is not a valid orientation
    expect(() => dividerRecipe({ orientation: "diagonal" })).toThrow(/invalid value/);
  });
});

describe("pinInputRecipe", () => {
  it("defaults to size md", () => {
    expect(pinInputRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(pinInputRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for the states Ark already tracks", () => {
    // filled / complete / invalid / disabled arrive as Ark data-attributes, so
    // the recipe must not grow a parallel (and divergible) variant for them.
    expect(Object.keys(pinInputRecipe.variants)).toEqual(["size"]);
  });
});
