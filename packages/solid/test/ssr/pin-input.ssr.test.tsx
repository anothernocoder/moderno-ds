import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import PinInputSection from "../../playground/sections/pin-input.jsx";

describe("PinInput SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <PinInputSection open={false} />);
    expect(html).toContain('data-scope="pin-input"');
    // Every code cell is on the server, and `count` makes the server's aria
    // labels agree with the client's — the PinInput-specific SSR hazard.
    expect(partAttrs(html, "pin-input", "input", "data-index")).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
    expect(html).toContain('aria-label="pin code 6 of 6"');
  });
});
