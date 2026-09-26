import { describe, expect, it } from "vitest";
import { alertRecipe, alertRole } from "../../src/recipes/alert.js";

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
