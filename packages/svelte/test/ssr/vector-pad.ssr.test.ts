import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import VectorPadSection from "../../playground/sections/VectorPad.svelte";

describe("VectorPad SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(VectorPadSection, { props: { open: false } });
    // Moderno's vector-pad machine. The recipe lands on each root, each
    // handle reaches the server as a slider named by its label that says both
    // values (the second centred in its own range), the root carries the
    // handle's place inline (y up, or down with invertY), and each field
    // shows its axis's value under its axis's name.
    expect(partAttrs(html, "vector-pad", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "vector-pad", "root", "role")).toEqual(["group", "group"]);
    expect(partAttrs(html, "vector-pad", "thumb", "role")).toEqual(["slider", "slider"]);
    expect(partAttrs(html, "vector-pad", "thumb", "aria-valuetext")).toEqual([
      "X 20, Y -10",
      "X 50, Y 25",
    ]);
    const labels = partAttrs(html, "vector-pad", "label", "id");
    expect(partAttrs(html, "vector-pad", "thumb", "aria-labelledby")).toEqual(labels);
    const roots = partAttrs(html, "vector-pad", "root", "style");
    expect(roots[0]).toMatch(/--vector-pad-x:\s*60%;\s*--vector-pad-y:\s*55%/);
    expect(roots[1]).toMatch(/--vector-pad-x:\s*50%;\s*--vector-pad-y:\s*50%/);
    expect(partAttrs(html, "vector-pad", "grid", "aria-hidden")).toEqual(["true"]);
    expect(partAttrs(html, "number-input", "root", "data-size")).toEqual(["md", "md"]);
    expect(partAttrs(html, "number-input", "root", "data-axis")).toEqual(["x", "y"]);
    expect(partAttrs(html, "number-input", "input", "value")).toEqual(["20", "-10"]);
    expect(partAttrs(html, "number-input", "input", "aria-valuemin")).toEqual(["-100", "-100"]);
  });
});
