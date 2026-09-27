import { describe, expect, it } from "vitest";
import {
  angleFromInput,
  angleSliderChangeDetails,
  angleSliderPageValue,
  angleSliderRecipe,
  angleSliderValueText,
  createShiftTracker,
  isAngleOutsideTurn,
  resolveAngle,
  snapAngleToMarks,
  snapAngleToStep,
  wrapAngle,
} from "../../src/recipes/angle-slider.js";

describe("angleSliderRecipe", () => {
  it("defaults to size md", () => {
    expect(angleSliderRecipe()).toEqual({ "data-size": "md" });
  });

  it("maps size to a data-attribute", () => {
    expect(angleSliderRecipe({ size: "sm" })).toEqual({ "data-size": "sm" });
  });

  it("carries no variant for what Ark already decides", () => {
    // The angle, step, disabled, read-only and invalid are Ark's props and data-*.
    expect(Object.keys(angleSliderRecipe.variants)).toEqual(["size"]);
  });

  it("rejects values outside the schema", () => {
    // @ts-expect-error — "xl" is not an angle slider size
    expect(() => angleSliderRecipe({ size: "xl" })).toThrow(/invalid value/);
  });
});

describe("angle arithmetic", () => {
  it("wraps any angle into one turn", () => {
    expect([0, 45, 359, 360, 370, 725, -30, -360].map(wrapAngle)).toEqual([
      0, 45, 359, 0, 10, 5, 330, 0,
    ]);
    expect(Object.is(wrapAngle(-360), 0)).toBe(true);
  });

  it("snaps to the nearest step, wrapping a full turn to 0", () => {
    expect(snapAngleToStep(47, 5)).toBe(45);
    expect(snapAngleToStep(48, 5)).toBe(50);
    expect(snapAngleToStep(350, 45)).toBe(0);
    expect(snapAngleToStep(-30, 45)).toBe(315);
    expect(snapAngleToStep(0.30000000000000004, 0.1)).toBe(0.3);
  });

  it("snaps to the nearest mark around the dial", () => {
    expect(snapAngleToMarks(50, [0, 45, 90])).toBe(45);
    expect(snapAngleToMarks(350, [0, 90, 180, 270])).toBe(0);
    expect(snapAngleToMarks(200, [360, 180])).toBe(180);
    expect(snapAngleToMarks(123, [])).toBe(123);
  });

  it("resolves a reported value: wrapped, and on the nearest mark only when asked", () => {
    expect(resolveAngle(360)).toBe(0);
    expect(resolveAngle(50, { marks: [0, 90] })).toBe(50);
    expect(resolveAngle(50, { marks: [0, 90], snapToMarks: true })).toBe(90);
    expect(resolveAngle(50, { marks: [], snapToMarks: true })).toBe(50);
  });

  it("turns 15° a page, or the whole steps covering it, within 0° and the last step", () => {
    expect(angleSliderPageValue(40, 1, 1)).toBe(55);
    expect(angleSliderPageValue(40, 1, -1)).toBe(25);
    expect(angleSliderPageValue(40, 10, 1)).toBe(60);
    expect(angleSliderPageValue(90, 45, -1)).toBe(45);
    expect(angleSliderPageValue(350, 1, 1)).toBe(359);
    expect(angleSliderPageValue(300, 45, 1)).toBe(315);
    expect(angleSliderPageValue(5, 1, -1)).toBe(0);
    // From Ark's End (359°) at step 45, back onto the step grid.
    expect(angleSliderPageValue(359, 45, -1)).toBe(315);
  });

  it("reports the angle and its CSS form", () => {
    expect(angleSliderChangeDetails(45)).toEqual({ value: 45, valueAsDegree: "45deg" });
  });

  it("says the angle in degrees", () => {
    expect(angleSliderValueText(45)).toBe("45 degrees");
  });

  it("reads the field's number as an angle, or nothing while it holds none", () => {
    expect(angleFromInput(92, 5)).toBe(90);
    expect(angleFromInput(400, 1)).toBe(40);
    expect(angleFromInput(-30, 1)).toBe(330);
    expect(angleFromInput(Number.NaN, 1)).toBeUndefined();
    expect([0, 359, 360, -1].map(isAngleOutsideTurn)).toEqual([false, false, true, true]);
  });
});

describe("createShiftTracker", () => {
  it("holds Shift only while the pointer is pressed", () => {
    const shift = createShiftTracker();
    expect(shift.isHeld()).toBe(false);
    shift.track({ type: "pointerdown", shiftKey: true });
    expect(shift.isHeld()).toBe(true);
    shift.track({ type: "pointermove", shiftKey: false });
    expect(shift.isHeld()).toBe(false);
    shift.track({ type: "pointermove", shiftKey: true });
    shift.track({ type: "pointerup", shiftKey: true });
    expect(shift.isHeld()).toBe(false);
  });
});
