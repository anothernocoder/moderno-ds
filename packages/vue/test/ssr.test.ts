import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { App } from "../playground/app.js";
import { Button } from "../src/button.js";
import { Field } from "../src/field.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("SSR (Vue)", () => {
  it("server-renders the primitives to a stable HTML string", async () => {
    const html = await renderToString(createSSRApp({ render: () => h(App) }));
    expect(html).toContain('data-scope="button"');
    expect(html).toContain('data-scope="field"');
    // Triggers are present even while the dialog/select popovers are closed.
    expect(html).toContain("Open dialog");
    expect(html).toContain("Framework");
    // The recipe attributes survive serialisation.
    expect(html).toContain('data-variant="destructive"');
    expect(html).toContain('data-size="md"');
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
 * Field's label/control ids must match across server and client render. The
 * portal-free primitives (Button + Field) exercise exactly that, so a
 * warning-free hydration here proves the id path is stable. Ark's portaled
 * popovers (Dialog/Select) position via floating-ui measurement that jsdom
 * does not provide, so their hydration is covered by the string + interaction
 * suites instead.
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
