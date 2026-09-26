import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import CardSection from "../../playground/sections/Card.svelte";

describe("Card SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(CardSection, { props: { open: false } });
    expect(html).toContain('data-scope="card"');
    // The card's compound anatomy survives serialisation part by part.
    expect(html).toContain('data-part="title"');
    expect(html).toContain('data-part="footer"');
  });
});
