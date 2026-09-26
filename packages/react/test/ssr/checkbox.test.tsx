import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CheckboxSection from "../../playground/sections/checkbox.js";

describe("Checkbox SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<CheckboxSection open={false} />);
    expect(html).toContain('data-scope="checkbox"');
    // Checkbox serialises its Ark state, not just its scope.
    expect(html).toMatch(/data-part="control"[^>]*data-state="checked"/);
    expect(html).toMatch(/data-part="control"[^>]*data-state="indeterminate"/);
  });
});
