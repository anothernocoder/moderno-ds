import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { confirmCard, paymentAlert, salesCard } from "../../playground/examples.ts";
import { GenUI } from "../../src/react.ts";

describe("GenUI SSR", () => {
  // moderno styles by data attributes (`data-scope`, `data-part`, recipe variants).
  it("server-renders the sales card with moderno's data attributes", () => {
    const html = renderToString(<GenUI response={salesCard.response} />);

    expect(html).toContain('data-scope="card"');
    expect(html).toContain('data-variant="outline"');
    expect(html).toContain('data-part="title"');
    expect(html).toContain("Sales this month");
    expect(html).toMatch(/<svg[^>]*data-scope="chart" data-part="root" data-chart="bar"/);
  });

  it("server-renders the confirm card's buttons and the alert", () => {
    expect(renderToString(<GenUI response={confirmCard.response} />)).toMatch(
      /<button[^>]*data-scope="button"[^>]*data-variant="primary">Confirm order<\/button>/,
    );
    expect(renderToString(<GenUI response={paymentAlert.response} />)).toContain(
      'data-variant="warning"',
    );
  });
});
