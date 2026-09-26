import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ButtonSection from "../../playground/sections/button.js";

describe("Button SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<ButtonSection open={false} />);
    expect(html).toContain('data-scope="button"');
    // The recipe attributes survive serialisation.
    expect(html).toContain('data-variant="destructive"');
    expect(html).toContain('data-size="md"');
  });
});
