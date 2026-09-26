// @vitest-environment node
import { describe, expect, it } from "vitest";
import SelectSection from "../../playground/sections/select.js";
import { renderSection } from "./render-section.js";

describe("Select SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(SelectSection);
    // The trigger is present even while the popover is closed.
    expect(html).toContain("Framework");
  });
});
