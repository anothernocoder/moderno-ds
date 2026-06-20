// @vitest-environment jsdom
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { App } from "../playground/app.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("SSR + hydration (React 19)", () => {
  it("server-renders the primitives to a stable HTML string", () => {
    const html = renderToString(<App />);
    expect(html).toContain('data-scope="button"');
    expect(html).toContain('data-scope="field"');
    // Triggers are present even while the dialog/select popovers are closed.
    expect(html).toContain("Open dialog");
    expect(html).toContain("Framework");
    // The recipe attributes survive serialisation.
    expect(html).toContain('data-variant="destructive"');
    expect(html).toContain('data-size="md"');
  });

  async function hydrateAndCountWarnings(tree: ReactElement): Promise<number> {
    // Seed the container with our own trusted server markup, then hydrate it.
    const html = renderToString(tree);
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.insertAdjacentHTML("afterbegin", html);

    // React reports hydration mismatches via console.error.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: Root;
    await act(async () => {
      root = hydrateRoot(container, tree);
    });
    const calls = errSpy.mock.calls.length;
    errSpy.mockRestore();
    await act(async () => {
      root.unmount();
    });
    return calls;
  }

  it("hydrates the closed primitives with zero React warnings", async () => {
    expect(await hydrateAndCountWarnings(<App />)).toBe(0);
  });

  it("hydrates with the Dialog + Select popovers open (portal + id path)", async () => {
    // The harder case the spec names: open content lives in a Portal and the
    // trigger's aria-controls / active-descendant ids come from useId — both
    // must agree across server and client.
    expect(await hydrateAndCountWarnings(<App open />)).toBe(0);
  });
});
