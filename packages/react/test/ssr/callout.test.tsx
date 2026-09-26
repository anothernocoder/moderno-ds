import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import CalloutSection from "../../playground/sections/callout.js";

describe("Callout SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<CalloutSection open={false} />);
    // A CSS-only note. Every root stays role="note" whatever its status
    // (nothing is a live region), and the optional icon is hidden.
    expect(partAttrs(html, "callout", "root", "role")).toEqual(["note", "note"]);
    expect(partAttrs(html, "callout", "root", "data-variant")).toEqual(["info", "warning"]);
    expect(partAttrs(html, "callout", "icon", "aria-hidden")).toEqual(["true"]);
    expect(partTags(html, "callout", "description")).toHaveLength(2);
  });
});
