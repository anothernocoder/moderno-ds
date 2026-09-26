import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partTags } from "../../../core/test/ssr-parts.ts";
import IndicatorSection from "../../playground/sections/Indicator.svelte";

describe("Indicator SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(IndicatorSection, { props: { open: false } });
    // A CSS-only status dot: the bare data-pulse flag, the dot and the optional label serialise on
    // the right element.
    // data-pulse is a bare flag: some renderers write `data-pulse=""`, Vue writes
    // `data-pulse`; both are the same attribute to the `[data-pulse]` selector.
    const pulsing = partTags(html, "indicator", "root").map((tag) =>
      /\sdata-pulse(?:=""|[\s>])/.test(tag),
    );
    expect(pulsing).toEqual([true, false]);
    expect(partTags(html, "indicator", "dot")).toHaveLength(2);
    expect(partTags(html, "indicator", "label")).toHaveLength(1);
  });
});
