import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import BadgeSection from "../../playground/sections/Badge.svelte";

describe("Badge SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(BadgeSection, { props: { open: false } });
    // A CSS-only status badge: every variant lands on its root, and the optional dot part
    // serialises only where it is asked for.
    expect(partAttrs(html, "badge", "root", "data-variant")).toEqual([
      "neutral",
      "success",
      "error",
    ]);
    expect(partTags(html, "badge", "dot")).toHaveLength(1);
  });
});
