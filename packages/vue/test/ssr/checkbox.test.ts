// @vitest-environment node
import { describe, expect, it } from "vitest";
import CheckboxSection from "../../playground/sections/checkbox.js";
import { renderSection } from "./render-section.js";

describe("Checkbox SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(CheckboxSection);
    expect(html).toContain('data-scope="checkbox"');
    // Checkbox serialises its Ark state, not just its scope.
    expect(html).toMatch(/data-part="control"[^>]*data-state="checked"/);
    expect(html).toMatch(/data-part="control"[^>]*data-state="indeterminate"/);
  });
});
