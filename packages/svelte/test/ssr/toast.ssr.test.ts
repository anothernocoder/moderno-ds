import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { partAttrs } from "../../../core/test/ssr-parts.ts";
import ToastSection from "../../playground/sections/Toast.svelte";

describe("Toast SSR (Svelte, server-only island)", () => {
  it("server-renders its playground section to a stable HTML string", () => {
    const { html } = render(ToastSection, { props: { open: false } });
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
