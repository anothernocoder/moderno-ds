import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import SelectSection from "../../playground/sections/select.jsx";

describe("Select SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <SelectSection open={false} />);
    // The trigger is present even while the popover is closed.
    expect(html).toContain("Framework");
    expect(partAttrs(html, "select", "trigger", "data-state")).toEqual(["closed"]);
  });

  it("propagates defaultOpen through to the (non-portaled) trigger state", () => {
    // Solid's <Portal> is client-only, so the listbox isn't in the server
    // string — but the open state still serialises onto the trigger.
    const html = renderToString(() => <SelectSection open />);
    expect(partAttrs(html, "select", "trigger", "data-state")).toEqual(["open"]);
  });
});
