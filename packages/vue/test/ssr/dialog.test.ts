// @vitest-environment node
import { describe, expect, it } from "vitest";
import DialogSection from "../../playground/sections/dialog.js";
import { renderSection } from "./render-section.js";

describe("Dialog SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(DialogSection);
    // The trigger is present even while the popover is closed.
    expect(html).toContain("Open dialog");
  });
});
