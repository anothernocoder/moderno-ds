import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import SkeletonSection from "../../playground/sections/skeleton.js";

describe("Skeleton SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<SkeletonSection open={false} />);
    // A CSS-only loading state: every shape reaches the server, hidden from
    // assistive technology.
    expect(partAttrs(html, "skeleton", "root", "data-shape")).toEqual(["text", "rect", "circle"]);
    expect(partAttrs(html, "skeleton", "root", "aria-hidden")).toEqual(["true", "true", "true"]);
  });
});
