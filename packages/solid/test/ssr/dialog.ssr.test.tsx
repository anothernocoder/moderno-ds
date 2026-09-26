import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import DialogSection from "../../playground/sections/dialog.jsx";

describe("Dialog SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <DialogSection open={false} />);
    // The trigger is present even while the popover is closed.
    expect(html).toContain("Open dialog");
    expect(partAttrs(html, "dialog", "trigger", "data-state")).toEqual(["closed"]);
  });

  it("propagates defaultOpen through to the (non-portaled) trigger state", () => {
    // Solid's <Portal> is client-only, so the content isn't in the server
    // string — but the open state still serialises onto the trigger.
    const html = renderToString(() => <DialogSection open />);
    expect(partAttrs(html, "dialog", "trigger", "data-state")).toEqual(["open"]);
  });
});
