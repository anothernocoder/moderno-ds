import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import ToastSection from "../../playground/sections/toast.jsx";

describe("Toast SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = renderToString(() => <ToastSection open={false} />);
    // Solid disposes a server render on a timer, and zag runs the machine's
    // exit action then; wait for it, so a throw there fails this test.
    await new Promise((resolve) => setTimeout(resolve));
    // Ark's toast group machine. The toaster's live region reaches the server
    // string, named after its placement; no toast has been created yet.
    expect(partAttrs(html, "toast", "group", "id")).toEqual(["toast-group:bottom-end"]);
    expect(partAttrs(html, "toast", "group", "role")).toEqual(["region"]);
    expect(partAttrs(html, "toast", "group", "aria-live")).toEqual(["polite"]);
    expect(partAttrs(html, "toast", "group", "aria-label")).toEqual([
      "Notifications, bottom-end (alt+T)",
    ]);
    expect(partAttrs(html, "toast", "group", "data-placement")).toEqual(["bottom-end"]);
    expect(partAttrs(html, "toast", "group", "data-side")).toEqual(["bottom"]);
    expect(partAttrs(html, "toast", "group", "data-align")).toEqual(["end"]);
    expect(partAttrs(html, "toast", "root", "data-part")).toEqual([]);
  });
});
