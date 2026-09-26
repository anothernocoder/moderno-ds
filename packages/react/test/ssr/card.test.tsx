import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CardSection from "../../playground/sections/card.js";

describe("Card SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<CardSection open={false} />);
    expect(html).toContain('data-scope="card"');
    // The card's compound anatomy survives serialisation part by part.
    expect(html).toContain('data-part="title"');
    expect(html).toContain('data-part="footer"');
  });
});
