import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import App from "../playground/App.svelte";

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
    expect(html).toContain('data-scope="field"');
    expect(html).toContain("Open dialog");
    expect(html).toContain("Framework");
    expect(html).toContain('data-variant="destructive"');
    expect(html).toContain('data-size="md"');
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
