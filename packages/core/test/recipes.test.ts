import { describe, expect, it } from "vitest";
import {
  alertRecipe,
  avatarRecipe,
  switchRecipe,
  alertRole,
  badgeRecipe,
  buttonRecipe,
  calloutRecipe,
  cardRecipe,
  checkboxRecipe,
  chipRecipe,
  dividerRecipe,
  fieldRecipe,
  indicatorAttrs,
  indicatorRecipe,
  indicatorRole,
  pinInputRecipe,
  selectRecipe,
  skeletonRecipe,
  spinnerRecipe,
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

describe("calloutRecipe", () => {
  it("defaults to the informational status", () => {
    expect(calloutRecipe()).toEqual({ "data-variant": "info" });
  });

  it("maps variant to data-variant and has no size", () => {
    expect(calloutRecipe({ variant: "warning" })).toEqual({ "data-variant": "warning" });
    expect(Object.keys(calloutRecipe.variants)).toEqual(["variant"]);
  });

  it("covers the same four statuses as Alert", () => {
    expect(calloutRecipe.variants.variant).toEqual(alertRecipe.variants.variant);
  });

  it("rejects a status outside the schema", () => {
    // @ts-expect-error — "tip" is not a Moderno status
    expect(() => calloutRecipe({ variant: "tip" })).toThrow(/invalid value/);
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

describe("badgeRecipe", () => {
  it("defaults to a neutral md badge", () => {
    expect(badgeRecipe()).toEqual({ "data-size": "md", "data-variant": "neutral" });
  });

  it("carries the four statuses beside the three plain styles", () => {
    expect(badgeRecipe.variants.variant).toEqual([
      "neutral",
      "solid",
      "outline",
      "info",
      "success",
      "warning",
      "error",
    ]);
    expect(badgeRecipe({ variant: "error", size: "sm" })).toEqual({
      "data-size": "sm",
      "data-variant": "error",
    });
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "danger" is not a badge variant ("error" is)
    expect(() => badgeRecipe({ variant: "danger" })).toThrow(/invalid value/);
  });
});

describe("chipRecipe", () => {
  it("defaults to an outline md chip", () => {
    expect(chipRecipe()).toEqual({ "data-size": "md", "data-variant": "outline" });
  });

  it("maps variant/size to data-attributes", () => {
    expect(chipRecipe({ variant: "solid", size: "sm" })).toEqual({
      "data-size": "sm",
      "data-variant": "solid",
    });
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "lg" is not a chip size
    expect(() => chipRecipe({ size: "lg" })).toThrow(/invalid value/);
  });
});

describe("indicatorRecipe / indicatorAttrs", () => {
  it("defaults to a neutral md dot with no pulse", () => {
    expect(indicatorRecipe()).toEqual({ "data-size": "md", "data-variant": "neutral" });
    expect(indicatorAttrs()).toEqual({ "data-size": "md", "data-variant": "neutral" });
  });

  it("adds a bare data-pulse only when pulse is on", () => {
    expect(indicatorAttrs({ variant: "success", pulse: true })).toEqual({
      "data-size": "md",
      "data-variant": "success",
      "data-pulse": "",
    });
    expect(indicatorAttrs({ pulse: false })).not.toHaveProperty("data-pulse");
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "solid" is a badge variant, not an indicator status
    expect(() => indicatorAttrs({ variant: "solid" })).toThrow(/invalid value/);
  });
});

describe("indicatorRole", () => {
  it("makes a named bare dot an image, so its name is read", () => {
    expect(indicatorRole(false, { "aria-label": "Offline" })).toBe("img");
    expect(indicatorRole(false, { "aria-labelledby": "status-text" })).toBe("img");
  });

  it("leaves a labelled indicator a plain span", () => {
    expect(indicatorRole(true, { "aria-label": "Offline" })).toBeUndefined();
    expect(indicatorRole(true, {})).toBeUndefined();
  });

  it("leaves an unnamed bare dot decorative", () => {
    expect(indicatorRole(false, {})).toBeUndefined();
    expect(indicatorRole(false, { "aria-label": "" })).toBeUndefined();
  });
});

describe("skeletonRecipe", () => {
  it("defaults to a text line", () => {
    expect(skeletonRecipe()).toEqual({ "data-shape": "text" });
  });

  it("maps shape to data-shape and carries no size", () => {
    expect(skeletonRecipe({ shape: "circle" })).toEqual({ "data-shape": "circle" });
    expect(Object.keys(skeletonRecipe.variants)).toEqual(["shape"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "square" is not a skeleton shape ("rect" is)
    expect(() => skeletonRecipe({ shape: "square" })).toThrow(/invalid value/);
  });
});

describe("spinnerRecipe", () => {
  it("defaults to an md ring", () => {
    expect(spinnerRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to data-size", () => {
    expect(spinnerRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
    expect(Object.keys(spinnerRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a spinner size
    expect(() => spinnerRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});

describe("avatarRecipe", () => {
  it("defaults to an md circle", () => {
    expect(avatarRecipe()).toEqual({ "data-size": "md", "data-shape": "circle" });
  });

  it("maps size and shape to data-size and data-shape", () => {
    expect(avatarRecipe({ size: "lg", shape: "square" })).toEqual({
      "data-size": "lg",
      "data-shape": "square",
    });
    expect(Object.keys(avatarRecipe.variants)).toEqual(["size", "shape"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "rounded" is not an avatar shape
    expect(() => avatarRecipe({ shape: "rounded" })).toThrow(/invalid value/);
    // @ts-expect-error — "xl" is not an avatar size
    expect(() => avatarRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});

describe("switchRecipe", () => {
  it("defaults to size md", () => {
    expect(switchRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(switchRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });

  it("carries no variant for the states Ark already tracks", () => {
    // on/off, disabled, invalid and read-only surface as Ark's own
    // data-attributes, so they must never become recipe variants.
    expect(Object.keys(switchRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a switch size
    expect(() => switchRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});
