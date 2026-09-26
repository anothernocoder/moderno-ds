import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import AvatarSection from "../../playground/sections/avatar.js";

describe("Avatar SSR", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const html = renderToString(<AvatarSection open={false} />);
    // Ark's image-loading machine. On the server the image has not loaded, so
    // the initials show and the image is hidden; the recipe lands on each root.
    expect(partAttrs(html, "avatar", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "avatar", "root", "data-shape")).toEqual(["circle", "square"]);
    expect(partAttrs(html, "avatar", "fallback", "data-state")).toEqual(["visible", "visible"]);
    expect(partAttrs(html, "avatar", "image", "data-state")).toEqual(["hidden"]);
    expect(partTags(html, "avatar", "image")[0]).toMatch(/\shidden(?:=""|[\s>])/);
    // Vue and Svelte put hydration comments between the tag and its text.
    expect(html).toMatch(/data-part="fallback"[^>]*>(?:<!--[^>]*-->)*AL</);
  });
});
