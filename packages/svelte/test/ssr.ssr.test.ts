import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import App from "../playground/App.svelte";
import { partAttrs, partTags } from "../../core/test/ssr-parts.ts";

/**
 * SSR — the F3.5 guarantee. `svelte/server`'s `render()` compiles and renders
 * the component to a static HTML string in Node with no browser and no client
 * runtime, exactly as an Astro server-only island would. Proves the primitives
 * serialise with the contract attributes intact.
 */
describe("SSR (Svelte, server-only island)", () => {
  it("server-renders the primitives to a stable HTML string", () => {
    const { html } = render(App);
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

  it("emits static markup with no client runtime (zero <script>)", () => {
    const { html } = render(App);
    // A server-only island is pure HTML — no hydration script is injected by the
    // component itself.
    expect(html).not.toContain("<script");
  });

  it("propagates defaultOpen through to the (non-portaled) trigger state", () => {
    const { html } = render(App, { props: { open: true } });
    expect(html).toContain('data-scope="dialog"');
    expect(html).toContain('data-scope="select"');
    expect(html).toMatch(/data-part="trigger"[^>]*data-state="open"/);
  });
});
