import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { App } from "../playground/app.js";
import type { Section } from "../playground/section.js";

/**
 * Whole-app checks. Each component's server string is asserted on its own, in
 * `ssr/<slug>.test.ts`, over its playground section alone; what needs every
 * section at once stays here: the open popovers' teleported markup and a
 * warning-free hydration.
 */

afterEach(() => {
  document.body.replaceChildren();
});

/** Modules in `src/` that are not components, so they have no section. */
const NOT_COMPONENTS = ["index", "slot-content"];

/** The slugs of the files in `dir` (relative to this test) ending in `suffix`, sorted. */
function slugsIn(dir: string, suffix: string): string[] {
  return readdirSync(fileURLToPath(new URL(dir, import.meta.url)))
    .filter((file) => file.endsWith(suffix))
    .map((file) => file.slice(0, -suffix.length))
    .sort();
}

describe("SSR (Vue)", () => {
  it("gives every component a playground section and its own SSR test", () => {
    const components = slugsIn("../src/", ".ts").filter((slug) => !NOT_COMPONENTS.includes(slug));
    expect(slugsIn("../playground/sections/", ".ts")).toEqual(components);
    expect(slugsIn("./ssr/", ".test.ts")).toEqual(components);
  });

  it("mounts every section in the playground", async () => {
    const html = await renderToString(createSSRApp({ render: () => h(App) }));
    const mounted = html.match(/<section aria-label="/g) ?? [];
    expect(mounted).toHaveLength(slugsIn("../playground/sections/", ".ts").length);
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
 * must match across server and client render, and PinInput derives every cell
 * id (plus the label's `for`) from the same root id. Every playground section
 * hydrates together in one tree, so the ids of one component cannot shift
 * another's. A section that teleports (Ark's portaled popovers, Dialog and
 * Select) is left out: it positions via floating-ui measurement that jsdom
 * does not provide, so its hydration is covered by the string + interaction
 * suites instead. Which sections teleport is read from their server render,
 * so a new component adds a section and edits nothing here.
 */
const sections = Object.values(
  import.meta.glob<{ default: Section }>("../playground/sections/*.ts", { eager: true }),
).map((module) => module.default);

/** Whether `section`'s server render sends any markup through a `<Teleport>`. */
async function teleports(section: Section): Promise<boolean> {
  const ctx: { teleports?: Record<string, string> } = {};
  await renderToString(createSSRApp({ render: () => h(section, { open: false }) }), ctx);
  return Object.keys(ctx.teleports ?? {}).length > 0;
}

describe("Hydration (Vue)", () => {
  it("hydrates every portal-free section together with zero Vue warnings", async () => {
    const portalFree: Section[] = [];
    for (const section of sections) {
      if (!(await teleports(section))) portalFree.push(section);
    }
    const HydrationApp = defineComponent({
      name: "VueHydrationApp",
      setup: () => () =>
        h(
          "main",
          {},
          portalFree.map((section) => h(section, { open: false })),
        ),
    });
    const html = await renderToString(createSSRApp({ render: () => h(HydrationApp) }));
    expect(html.match(/<section aria-label="/g)).toHaveLength(portalFree.length);
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
