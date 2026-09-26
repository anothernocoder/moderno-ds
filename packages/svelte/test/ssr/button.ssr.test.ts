import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import ButtonSection from "../../playground/sections/Button.svelte";

describe("Button SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(ButtonSection, { props: { open: false } });
    expect(html).toContain('data-scope="button"');
    // The recipe attributes survive serialisation.
    expect(html).toContain('data-variant="destructive"');
    expect(html).toContain('data-size="md"');
  });
});
