import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SelectSection from "../../playground/sections/select.js";

describe("Select SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<SelectSection open={false} />);
    // The trigger is present even while the popover is closed.
    expect(html).toContain("Framework");
  });
});
