import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import BadgeSection from "../../playground/sections/badge.js";

describe("Badge SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<BadgeSection open={false} />);
    // A CSS-only status part: the optional dot has to serialise on the right
    // element.
    expect(partAttrs(html, "badge", "root", "data-variant")).toEqual([
      "neutral",
      "success",
      "error",
    ]);
    expect(partTags(html, "badge", "dot")).toHaveLength(1);
  });
});
