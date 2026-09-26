import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import ChipSection from "../../playground/sections/Chip.svelte";

describe("Chip SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(ChipSection, { props: { open: false } });
    // A CSS-only chip: the recipe lands on each root, and the optional remove button serialises
    // with its accessible name.
    expect(partAttrs(html, "chip", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "chip", "remove-trigger", "aria-label")).toEqual(["Remove React"]);
  });
});
