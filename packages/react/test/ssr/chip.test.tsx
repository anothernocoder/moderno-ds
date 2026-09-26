import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import ChipSection from "../../playground/sections/chip.js";

describe("Chip SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<ChipSection open={false} />);
    // A CSS-only status part: the optional remove button has to serialise on
    // the right element.
    expect(partAttrs(html, "chip", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "chip", "remove-trigger", "aria-label")).toEqual(["Remove React"]);
  });
});
