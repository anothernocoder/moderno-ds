import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import ColorPickerSection from "../../playground/sections/color-picker.jsx";

/** Whether each `scope`/`part` tag carries the boolean attribute `name`. */
const flags = (html: string, part: string, name: string) =>
  partTags(html, "color-picker", part).map((tag) =>
    new RegExp(`\\s${name}(?:=""|[\\s>])`).test(tag),
  );

/** The text of each `value-text` part, in document order. */
const valueTexts = (html: string) =>
  [...html.matchAll(/data-part="value-text"[^>]*>([^<]*)</g)].map((match) => match[1]);

describe("ColorPicker SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = renderToString(() => <ColorPickerSection open={false} />);
    // Solid disposes a server render on a timer, and zag runs the machine's
    // exit action then; wait for it, so a throw there fails this test.
    await new Promise((resolve) => setTimeout(resolve));
    // Ark's color-picker machine. The recipe lands on each root; the trigger
    // shows the hex and announces the dialog it controls, closed.
    expect(partAttrs(html, "color-picker", "root", "data-size")).toEqual(["md", "sm"]);
    expect(valueTexts(html)).toEqual(["#1E90FF", "#1E90FF80"]);
    const contentIds = partAttrs(html, "color-picker", "content", "id");
    expect(partAttrs(html, "color-picker", "trigger", "aria-controls")).toEqual(contentIds);
    expect(partAttrs(html, "color-picker", "trigger", "aria-haspopup")).toEqual([
      "dialog",
      "dialog",
    ]);
    expect(partAttrs(html, "color-picker", "trigger", "aria-expanded")).toEqual(["false", "false"]);
    expect(partAttrs(html, "color-picker", "trigger", "aria-label")).toEqual([
      "Color #1E90FF",
      "Color #1E90FF80",
    ]);
    expect(flags(html, "content", "hidden")).toEqual([true, true]);
    // Inside the Field, its label points at the trigger.
    const triggerIds = partAttrs(html, "color-picker", "trigger", "id");
    expect(partAttrs(html, "field", "label", "for")).toEqual([triggerIds[1]]);
    // The area and the sliders are named; only the second picker has alpha.
    expect(partAttrs(html, "color-picker", "area-thumb", "aria-label")).toEqual([
      "Saturation and brightness",
      "Saturation and brightness",
    ]);
    expect(partAttrs(html, "color-picker", "channel-slider", "data-channel")).toEqual([
      "hue",
      "hue",
      "alpha",
    ]);
    expect(partAttrs(html, "color-picker", "channel-slider-thumb", "aria-label")).toEqual([
      "Hue",
      "Hue",
      "Alpha",
    ]);
    expect(partAttrs(html, "color-picker", "hex-input", "value")).toEqual(["#1E90FF", "#1E90FF80"]);
    expect(partAttrs(html, "color-picker", "swatch-trigger", "aria-label")).toEqual([
      "Select #EF4444",
      "Select #22C55E",
      "Select #3B82F680",
    ]);
    // The eyedropper waits for a browser that has one.
    expect(partTags(html, "color-picker", "eye-dropper-trigger")).toEqual([]);
  });

  it("serialises the open state when the picker starts open", () => {
    const html = renderToString(() => <ColorPickerSection open />);
    expect(partAttrs(html, "color-picker", "trigger", "aria-expanded")).toEqual(["true", "false"]);
    expect(partAttrs(html, "color-picker", "content", "data-state")).toEqual(["open", "closed"]);
  });
});
