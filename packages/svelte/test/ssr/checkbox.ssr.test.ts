import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import CheckboxSection from "../../playground/sections/Checkbox.svelte";

describe("Checkbox SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(CheckboxSection, { props: { open: false } });
    expect(html).toContain('data-scope="checkbox"');
    // Checkbox serialises its Ark state, not just its scope.
    expect(html).toMatch(/data-part="control"[^>]*data-state="checked"/);
    expect(html).toMatch(/data-part="control"[^>]*data-state="indeterminate"/);
  });
});
