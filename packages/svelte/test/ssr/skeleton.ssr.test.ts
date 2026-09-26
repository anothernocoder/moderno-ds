import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import SkeletonSection from "../../playground/sections/Skeleton.svelte";

describe("Skeleton SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(SkeletonSection, { props: { open: false } });
    // A CSS-only loading state: every shape reaches the server, hidden from assistive technology.
    expect(partAttrs(html, "skeleton", "root", "data-shape")).toEqual(["text", "rect", "circle"]);
    expect(partAttrs(html, "skeleton", "root", "aria-hidden")).toEqual(["true", "true", "true"]);
  });
});
