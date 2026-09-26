import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import DialogSection from "../../playground/sections/Dialog.svelte";

describe("Dialog SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(DialogSection, { props: { open: false } });
    // The trigger is present even while the popover is closed.
    expect(html).toContain("Open dialog");
  });
});
