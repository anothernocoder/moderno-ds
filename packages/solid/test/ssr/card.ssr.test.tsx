import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import CardSection from "../../playground/sections/card.jsx";

describe("Card SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <CardSection open={false} />);
    expect(html).toContain('data-scope="card"');
    // The card's compound anatomy survives serialisation part by part.
    expect(html).toContain('data-part="title"');
    expect(html).toContain('data-part="footer"');
  });
});
