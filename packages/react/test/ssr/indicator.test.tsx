import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partTags } from "../../../core/test/ssr-parts.ts";
import IndicatorSection from "../../playground/sections/indicator.js";

describe("Indicator SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<IndicatorSection open={false} />);
    // data-pulse is a bare flag: some renderers write `data-pulse=""`, Vue writes
    // `data-pulse`; both are the same attribute to the `[data-pulse]` selector.
    const pulsing = partTags(html, "indicator", "root").map((tag) =>
      /\sdata-pulse(?:=""|[\s>])/.test(tag),
    );
    expect(pulsing).toEqual([true, false]);
    expect(partTags(html, "indicator", "dot")).toHaveLength(2);
    expect(partTags(html, "indicator", "label")).toHaveLength(1);
  });
});
