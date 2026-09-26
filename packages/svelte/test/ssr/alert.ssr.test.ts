import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import AlertSection from "../../playground/sections/Alert.svelte";

describe("Alert SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(AlertSection, { props: { open: false } });
    expect(html).toContain('data-scope="alert"');
    // The CSS-only primitive serialises its anatomy plus the resolved role:
    // "info" reports politely, "error" interrupts.
    expect(html).toContain("Payment failed");
    expect(html).toContain('role="status"');
    expect(html).toContain('role="alert"');
  });
});
