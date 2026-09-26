import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DividerSection from "../../playground/sections/divider.js";

describe("Divider SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<DividerSection open={false} />);
    expect(html).toContain('data-scope="divider"');
    // Both divider shapes survive serialisation: the bare rule keeps its
    // separator role, the captioned one its label part.
    expect(html).toContain('role="separator"');
    expect(html).toMatch(/data-scope="divider"[^>]*data-part="label"/);
    // …including the captioned *vertical* rule: that combination is the one
    // whose gap depends on the label's rotated writing mode, so orientation and
    // label have to serialise onto the same root.
    expect(html).toMatch(/data-orientation="vertical"(?:(?!<\/div>)[\s\S])*?data-part="label"/);
  });
});
