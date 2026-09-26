import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import SelectSection from "../../playground/sections/Select.svelte";

describe("Select SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(SelectSection, { props: { open: false } });
    // The trigger is present even while the popover is closed.
    expect(html).toContain("Framework");
  });
});
