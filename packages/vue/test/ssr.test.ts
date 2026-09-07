import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, type Component } from "vue";
import { renderToString } from "@vue/server-renderer";
import { App } from "../playground/app.js";
import { Alert } from "../src/alert.js";
import { Button } from "../src/button.js";
import { Field } from "../src/field.js";
import { Checkbox } from "../src/checkbox.js";
import { partAttrs, partTags } from "../../core/test/ssr-parts.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("SSR (Vue)", () => {
  it("server-renders the primitives to a stable HTML string", async () => {
    const html = await renderToString(createSSRApp({ render: () => h(App) }));
    expect(html).toContain('data-scope="button"');
    expect(html).toContain('data-scope="field"');
    expect(html).toContain('data-scope="checkbox"');
    expect(html).toContain('data-scope="alert"');
    // The CSS-only primitive serialises its anatomy plus the resolved role:
    // "info" reports politely, "error" interrupts.
    expect(html).toContain("Payment failed");
    expect(html).toContain('role="status"');
    expect(html).toContain('role="alert"');
    // Triggers are present even while the dialog/select popovers are closed.
    expect(html).toContain("Open dialog");
    expect(html).toContain("Framework");
    // The recipe attributes survive serialisation.
    expect(html).toContain('data-variant="destructive"');
    expect(html).toContain('data-size="md"');
    // Checkbox serialises its Ark state, not just its scope.
    expect(html).toMatch(/data-part="control"[^>]*data-state="checked"/);
    expect(html).toMatch(/data-part="control"[^>]*data-state="indeterminate"/);
    // Field's own recipe, read off the field roots themselves — a whole-document
    // match would be satisfied by the Buttons' `data-size` and would survive a
    // Root that stopped applying the recipe (Vue's attrs forwarding is exactly
    // the kind of thing that can drop it).
    expect(partAttrs(html, "field", "root", "data-size")).toEqual(["sm", "lg"]);
    // The second field's control is Field's own Textarea part.
    expect(partTags(html, "field", "textarea")).toHaveLength(1);
  });

  it("server-renders the dialog/select popover markup when open", async () => {
    const html = await renderToString(createSSRApp({ render: () => h(App, { open: true }) }));
    // Ark teleports popovers to <body>; @vue/server-renderer collects that
    // markup in ctx.teleports, but the scope/part attributes still serialise.
    const ctx: { teleports?: Record<string, string> } = {};
    await renderToString(createSSRApp({ render: () => h(App, { open: true }) }), ctx);
    const body = ctx.teleports?.body ?? "";
    expect(body).toContain('data-scope="dialog"');
    expect(body).toContain('data-scope="select"');
    expect(html).toContain("Open dialog");
  });
});

/**
 * Hydration safety — the genuine, deterministic SSR hazard is `useId`: the
 * Field's label/control ids and the Checkbox's label ↔ hidden-input pairing
 * must match across server and client render. The portal-free primitives
 * (Button + Field + Checkbox + Alert) exercise exactly that, so a warning-free
 * hydration here proves the id path is stable. Ark's portaled popovers
 * (Dialog/Select) position via floating-ui measurement that jsdom does not
 * provide, so their hydration is covered by the string + interaction suites
 * instead.
 */
const HydrationApp = defineComponent({
  name: "VueHydrationApp",
  setup() {
    return () =>
      h("main", {}, [
        h(Button, { variant: "primary" }, () => "Primary"),
        h(Button, { variant: "destructive", size: "lg" }, () => "Destructive"),
        h(Field.Root, {}, () => [
          h(Field.Label, {}, () => "Email"),
          h(Field.Input, { placeholder: "you@example.com" }),
          h(Field.HelperText, {}, () => "We never share it."),
        ]),
        h(Checkbox.Root as unknown as Component, { defaultChecked: true }, () => [
          h(Checkbox.Control, {}, () => h(Checkbox.Indicator, {}, () => "✓")),
          h(Checkbox.Label, {}, () => "Email me updates"),
          h(Checkbox.HiddenInput),
        ]),
        h(Alert.Root, { variant: "error" }, () => [
          h(Alert.Icon, {}, () => "!"),
          h(Alert.Content, {}, () => [
            h(Alert.Title, {}, () => "Payment failed"),
            h(Alert.Description, {}, () => "We could not charge your card."),
          ]),
        ]),
      ]);
  },
});

describe("Hydration (Vue)", () => {
  it("hydrates the portal-free primitives with zero Vue warnings", async () => {
    const html = await renderToString(createSSRApp({ render: () => h(HydrationApp) }));
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.insertAdjacentHTML("afterbegin", html);

    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = createSSRApp({ render: () => h(HydrationApp) });
    client.mount(container);
    await Promise.resolve();
    const calls = errSpy.mock.calls.length + warnSpy.mock.calls.length;
    errSpy.mockRestore();
    warnSpy.mockRestore();
    client.unmount();

    expect(calls).toBe(0);
  });
});
