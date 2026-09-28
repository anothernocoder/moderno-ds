import { afterEach, describe, expect, it } from "vitest";
import {
  COLOR_PICKER_DEFAULT_VALUE,
  COLOR_PICKER_TRANSLATIONS,
  colorPickerRecipe,
  colorPickerSwatches,
  parseHexColor,
  supportsEyeDropper,
} from "../../src/recipes/color-picker.js";

describe("colorPickerRecipe", () => {
  it("defaults to size md", () => {
    expect(colorPickerRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(colorPickerRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
    expect(colorPickerRecipe({ size: "lg" })).toEqual({ "data-size": "lg" });
  });

  it("carries no variant for what the props and Ark already own", () => {
    // alpha and swatches change what renders; open, invalid and disabled are Ark's data-*.
    expect(Object.keys(colorPickerRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not a color picker size
    expect(() => colorPickerRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});

describe("parseHexColor", () => {
  it("takes #RGB, #RRGGBB and #RRGGBBAA, with or without the #", () => {
    expect(parseHexColor("#1e9")).toBe("#11EE99");
    expect(parseHexColor("1e9")).toBe("#11EE99");
    expect(parseHexColor("#1e90ff")).toBe("#1E90FF");
    expect(parseHexColor("1E90FF")).toBe("#1E90FF");
    expect(parseHexColor("#1e90ff80")).toBe("#1E90FF80");
    expect(parseHexColor("1e90ff80")).toBe("#1E90FF80");
  });

  it("takes the short #RGBA form", () => {
    expect(parseHexColor("#f008")).toBe("#FF000088");
  });

  it("trims the spaces a paste brings along", () => {
    expect(parseHexColor("  #1e90ff \n")).toBe("#1E90FF");
  });

  it("writes an opaque colour without its alpha digits", () => {
    expect(parseHexColor("#1e90ffff")).toBe("#1E90FF");
    expect(parseHexColor("#f00f")).toBe("#FF0000");
  });

  it("drops the alpha when the picker has none", () => {
    expect(parseHexColor("#1e90ff80", { alpha: false })).toBe("#1E90FF");
    expect(parseHexColor("#f008", { alpha: false })).toBe("#FF0000");
  });

  it("is null for anything that is not a hex colour", () => {
    for (const input of [
      "",
      "#",
      "#12",
      "#12345",
      "#1234567",
      "#123456789",
      "#ggg",
      "red",
      "##fff",
    ]) {
      expect(parseHexColor(input), input).toBeNull();
    }
  });

  it("starts from a default the parser accepts", () => {
    expect(parseHexColor(COLOR_PICKER_DEFAULT_VALUE)).toBe("#000000");
  });
});

describe("colorPickerSwatches", () => {
  it("writes each swatch as the picker reports a colour, in the order given", () => {
    expect(colorPickerSwatches(["#f00", "1e90ff", "#00ff0080"])).toEqual([
      "#FF0000",
      "#1E90FF",
      "#00FF0080",
    ]);
  });

  it("makes every swatch opaque when the picker has no alpha", () => {
    expect(colorPickerSwatches(["#00ff0080"], { alpha: false })).toEqual(["#00FF00"]);
  });

  it("leaves out what is not a hex colour and keeps one of each", () => {
    expect(colorPickerSwatches(["red", "#f00", "#FF0000", "#zzz"])).toEqual(["#FF0000"]);
  });

  it("is empty without swatches", () => {
    expect(colorPickerSwatches(undefined)).toEqual([]);
  });
});

describe("COLOR_PICKER_TRANSLATIONS", () => {
  it("names the area and the sliders as a reader expects", () => {
    expect(COLOR_PICKER_TRANSLATIONS.area).toBe("Saturation and brightness");
    expect(COLOR_PICKER_TRANSLATIONS.hue).toBe("Hue");
    expect(COLOR_PICKER_TRANSLATIONS.alpha).toBe("Alpha");
  });
});

describe("supportsEyeDropper", () => {
  const scope = globalThis as { EyeDropper?: unknown };
  afterEach(() => {
    delete scope.EyeDropper;
  });

  it("is false where the EyeDropper API is missing", () => {
    expect(supportsEyeDropper()).toBe(false);
  });

  it("is true where the browser has it", () => {
    scope.EyeDropper = class {};
    expect(supportsEyeDropper()).toBe(true);
  });
});
