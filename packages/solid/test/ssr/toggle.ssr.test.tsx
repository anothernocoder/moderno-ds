import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import ToggleSection from "../../playground/sections/toggle.jsx";

describe("Toggle SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(() => <ToggleSection open={false} />);
    // Ark's toggle machine on a native button. The recipe lands on each root,
    // the pressed state reaches the server string (aria-pressed / data-state),
    // and the Indicator renders its on or off content (past any framework
    // hydration comments).
    expect(partAttrs(html, "toggle", "root", "data-variant")).toEqual(["ghost", "outline"]);
    expect(partAttrs(html, "toggle", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "toggle", "root", "aria-pressed")).toEqual(["true", "false"]);
    expect(partAttrs(html, "toggle", "root", "data-state")).toEqual(["on", "off"]);
    expect(partAttrs(html, "toggle", "indicator", "data-state")).toEqual(["on", "off"]);
    expect(html).toMatch(/data-part="indicator"[^>]*>(?:\s|<!--[^>]*-->)*★/);
    expect(html).toMatch(/data-part="indicator"[^>]*>(?:\s|<!--[^>]*-->)*☆/);
    const disabledToggles = partTags(html, "toggle", "root").map((tag) =>
      /\sdisabled(?:=""|[\s>])/.test(tag),
    );
    expect(disabledToggles).toEqual([false, true]);
  });
});
