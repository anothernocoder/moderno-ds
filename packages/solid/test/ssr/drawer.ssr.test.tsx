import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import DrawerSection from "../../playground/sections/drawer.jsx";

describe("Drawer SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = renderToString(() => <DrawerSection open={false} />);
    // Solid disposes a server render on a timer, and zag runs the machine's
    // exit action then; wait for it, so a throw there fails this test.
    await new Promise((resolve) => setTimeout(resolve));
    // Ark's dialog machine under the "drawer" scope: no part keeps Ark's
    // "dialog" scope. Each trigger announces the dialog it controls, closed;
    // each content is that dialog, hidden, labelled by its own title and
    // description, and it and its positioner carry the Root's placement.
    expect(html).not.toContain('data-scope="dialog"');
    const contentIds = partAttrs(html, "drawer", "content", "id");
    expect(contentIds).toHaveLength(2);
    expect(partAttrs(html, "drawer", "trigger", "aria-haspopup")).toEqual(["dialog", "dialog"]);
    expect(partAttrs(html, "drawer", "trigger", "aria-expanded")).toEqual(["false", "false"]);
    expect(partAttrs(html, "drawer", "trigger", "aria-controls")).toEqual(contentIds);
    expect(partAttrs(html, "drawer", "content", "role")).toEqual(["dialog", "dialog"]);
    // Vue serialises a bare `hidden`, the others `hidden=""`.
    const hidden = partTags(html, "drawer", "content").map((tag) =>
      /\shidden(?:=""|[\s>])/.test(tag),
    );
    expect(hidden).toEqual([true, true]);
    expect(partAttrs(html, "drawer", "positioner", "data-placement")).toEqual(["right", "bottom"]);
    expect(partAttrs(html, "drawer", "content", "data-placement")).toEqual(["right", "bottom"]);
    expect(partAttrs(html, "drawer", "content", "aria-labelledby")).toEqual(
      partAttrs(html, "drawer", "title", "id"),
    );
    expect(partAttrs(html, "drawer", "content", "aria-describedby")).toEqual(
      partAttrs(html, "drawer", "description", "id"),
    );
    expect(partAttrs(html, "drawer", "close-trigger", "aria-label")).toEqual(["Close"]);
  });

  it("serialises the open state when the drawer starts open", async () => {
    const html = renderToString(() => <DrawerSection open />);
    await new Promise((resolve) => setTimeout(resolve));
    expect(partAttrs(html, "drawer", "trigger", "aria-expanded")).toEqual(["true", "false"]);
    expect(partAttrs(html, "drawer", "content", "data-state")).toEqual(["open", "closed"]);
    expect(partAttrs(html, "drawer", "backdrop", "data-state")).toEqual(["open", "closed"]);
  });
});
