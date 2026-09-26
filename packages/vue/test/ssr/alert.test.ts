// @vitest-environment node
import { describe, expect, it } from "vitest";
import AlertSection from "../../playground/sections/alert.js";
import { renderSection } from "./render-section.js";

describe("Alert SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(AlertSection);
    expect(html).toContain('data-scope="alert"');
    // The CSS-only primitive serialises its anatomy plus the resolved role:
    // "info" reports politely, "error" interrupts.
    expect(html).toContain("Payment failed");
    expect(html).toContain('role="status"');
    expect(html).toContain('role="alert"');
  });
});
