import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import AlertSection from "../../playground/sections/alert.jsx";

describe("Alert SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <AlertSection open={false} />);
    expect(html).toContain('data-scope="alert"');
    // The CSS-only primitive serialises its anatomy plus the resolved role:
    // "info" reports politely, "error" interrupts.
    expect(html).toContain("Payment failed");
    expect(html).toContain('role="status"');
    expect(html).toContain('role="alert"');
  });
});
