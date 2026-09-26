// @vitest-environment node
import { describe, expect, it } from "vitest";
import CardSection from "../../playground/sections/card.js";
import { renderSection } from "./render-section.js";

describe("Card SSR (Vue)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = await renderSection(CardSection);
    expect(html).toContain('data-scope="card"');
    // The card's compound anatomy survives serialisation part by part.
    expect(html).toContain('data-part="title"');
    expect(html).toContain('data-part="footer"');
  });
});
