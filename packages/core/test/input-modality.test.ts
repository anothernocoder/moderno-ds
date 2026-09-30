// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { trackInputModality } from "../src/input-modality.js";

const modality = () => document.documentElement.dataset.inputModality;
// jsdom has no PointerEvent, so Zag listens for mousedown instead.
const press = () => document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
const key = (key: string) =>
  document.body.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

let stop = () => {};
afterEach(() => {
  stop();
  delete document.documentElement.dataset.inputModality;
});

describe("trackInputModality", () => {
  it("marks <html> with pointer on a press and keyboard on a key", () => {
    stop = trackInputModality();

    press();
    expect(modality()).toBe("pointer");
    key("ArrowRight");
    expect(modality()).toBe("keyboard");
    press();
    expect(modality()).toBe("pointer");
  });

  it("ignores a modifier key pressed alone", () => {
    stop = trackInputModality();

    press();
    key("Shift");
    expect(modality()).toBe("pointer");
  });

  it("stops marking once cleaned up", () => {
    stop = trackInputModality();
    press();
    stop();

    key("Tab");
    expect(modality()).toBe("pointer");
  });
});
