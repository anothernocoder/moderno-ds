import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import CarouselSection from "../../playground/sections/Carousel.svelte";

describe("Carousel SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(CarouselSection, { props: { open: false } });
    // Carousel: Ark's carousel machine. The recipe lands on each root; each
    // root reaches the server as a region a screen reader calls a carousel,
    // its slides named by position, the current indicator marked, and the
    // trigger with nowhere to go already disabled.
    expect(partAttrs(html, "carousel", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "carousel", "root", "role")).toEqual(["region", "region"]);
    expect(partAttrs(html, "carousel", "root", "aria-roledescription")).toEqual([
      "carousel",
      "carousel",
    ]);
    expect(partAttrs(html, "carousel", "item", "aria-label")).toEqual([
      ...["1 of 3", "2 of 3", "3 of 3"],
      ...["1 of 4", "2 of 4", "3 of 4", "4 of 4"],
    ]);
    expect(
      partTags(html, "carousel", "indicator")
        .filter((tag) => /\sdata-current(?:=""|[\s>])/.test(tag))
        .map((tag) => attrOf(tag, "data-index")),
    ).toEqual(["0", "1"]);
    const triggersDisabled = (part: string) =>
      partTags(html, "carousel", part).map((tag) => /\sdisabled(?:=""|[\s>])/.test(tag));
    expect(triggersDisabled("prev-trigger")).toEqual([true, false]);
    expect(triggersDisabled("next-trigger")).toEqual([false, true]);
    expect(html.replace(/<!--.*?-->/g, "")).toMatch(/data-part="progress-text"[^>]*>2 \/ 2</);
  });
});
