import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DialogSection from "../../playground/sections/dialog.js";

describe("Dialog SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<DialogSection open={false} />);
    // The trigger is present even while the popover is closed.
    expect(html).toContain("Open dialog");
  });
});
