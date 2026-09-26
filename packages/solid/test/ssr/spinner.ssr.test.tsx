import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import SpinnerSection from "../../playground/sections/spinner.jsx";

describe("Spinner SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <SpinnerSection open={false} />);
    // A CSS-only loading state: the status role, hidden ring and label
    // serialise on the right elements.
    expect(partAttrs(html, "spinner", "root", "role")).toEqual(["status", "status"]);
    expect(partAttrs(html, "spinner", "root", "data-size")).toEqual(["md", "lg"]);
    expect(partAttrs(html, "spinner", "circle", "aria-hidden")).toEqual(["true", "true"]);
    expect(html).toMatch(/data-part="label"[^>]*>Saving changes</);
  });
});
