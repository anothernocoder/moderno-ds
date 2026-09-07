import { describe, expect, it } from "vitest";
import { renderToString } from "solid-js/web";
import { App } from "../playground/app.jsx";

/**
 * SSR smoke — Solid compiles this file in server mode (see vitest.ssr.config.ts)
 * so `solid-js/web`'s `renderToString` is the real isomorphic renderer. Proves
 * the primitives serialise to stable HTML with the contract attributes intact;
 * Ark's portaled popovers render inline under SSR.
 */
describe("SSR (Solid)", () => {
  it("server-renders the primitives to a stable HTML string", () => {
    const html = renderToString(() => <App />);
    expect(html).toContain('data-scope="button"');
    expect(html).toContain('data-scope="field"');
    expect(html).toContain('data-scope="checkbox"');
    expect(html).toContain("Open dialog");
    expect(html).toContain("Framework");
    expect(html).toContain('data-variant="destructive"');
    expect(html).toContain('data-size="md"');
    expect(html).toMatch(/data-part="control"[^>]*data-state="checked"/);
    expect(html).toMatch(/data-part="control"[^>]*data-state="indeterminate"/);
    // Field's own recipe, over both controls: the sized roots and the textarea.
    expect(html).toContain('data-size="sm"');
    expect(html).toContain('data-size="lg"');
    expect(html).toContain('data-part="textarea"');
  });

  it("propagates defaultOpen through to the (non-portaled) trigger state", () => {
    // Solid's <Portal> is client-only, so the popover *content* isn't in the
    // server string (same as React's renderToString) — but the open state still
    // serialises onto the trigger, proving defaultOpen flows through SSR.
    const html = renderToString(() => <App open />);
    expect(html).toContain('data-scope="dialog"');
    expect(html).toContain('data-scope="select"');
    expect(html).toMatch(/data-part="trigger"[^>]*data-state="open"/);
  });
});
