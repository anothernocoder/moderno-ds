// @vitest-environment node
import { describe, expect, it } from "vitest";
import ButtonSection from "../../playground/sections/button.js";
import { renderSection } from "./render-section.js";

describe("Button SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(ButtonSection);
    expect(html).toContain('data-scope="button"');
    // The recipe attributes survive serialisation.
    expect(html).toContain('data-variant="destructive"');
    expect(html).toContain('data-size="md"');
  });
});
