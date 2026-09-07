import { describe, expect, it } from "vitest";
import { renderToString } from "solid-js/web";
import { App } from "../playground/app.jsx";
import { partAttrs, partTags } from "../../core/test/ssr-parts.ts";

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
    expect(html).toContain('data-scope="card"');
    expect(html).toContain('data-scope="field"');
    expect(html).toContain('data-scope="checkbox"');
    expect(html).toContain('data-scope="alert"');
    // The CSS-only primitive serialises its anatomy plus the resolved role:
    // "info" reports politely, "error" interrupts.
    expect(html).toContain("Payment failed");
    expect(html).toContain('role="status"');
    expect(html).toContain('role="alert"');
    // The card's compound anatomy survives serialisation part by part.
    expect(html).toContain('data-part="title"');
    expect(html).toContain('data-part="footer"');
    expect(html).toContain('data-scope="divider"');
    // Both divider shapes survive serialisation: the bare rule keeps its
    // separator role, the captioned one its label part.
    expect(html).toContain('role="separator"');
    expect(html).toMatch(/data-scope="divider"[^>]*data-part="label"/);
    // …including the captioned *vertical* rule: that combination is the one
    // whose gap depends on the label's rotated writing mode, so orientation and
    // label have to serialise onto the same root.
    expect(html).toMatch(/data-orientation="vertical"(?:(?!<\/div>)[\s\S])*?data-part="label"/);
    expect(html).toContain("Open dialog");
    expect(html).toContain("Framework");
    expect(html).toContain('data-variant="destructive"');
    expect(html).toContain('data-size="md"');
    expect(html).toMatch(/data-part="control"[^>]*data-state="checked"/);
    expect(html).toMatch(/data-part="control"[^>]*data-state="indeterminate"/);
    // Field's own recipe, read off the field roots themselves — a whole-document
    // match would be satisfied by the Buttons' `data-size` and would survive a
    // Root that stopped applying the recipe.
    expect(partAttrs(html, "field", "root", "data-size")).toEqual(["sm", "lg"]);
    // The second field's control is Field's own Textarea part.
    expect(partTags(html, "field", "textarea")).toHaveLength(1);
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
