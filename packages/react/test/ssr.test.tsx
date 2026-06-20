// @vitest-environment jsdom
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

  it("hydrates with zero React warnings (no id/portal mismatch)", async () => {
    // Seed the container with our own trusted server markup, then hydrate it.
    const html = renderToString(<App />);
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.insertAdjacentHTML("afterbegin", html);

    // React reports hydration mismatches via console.error — fail on any call.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: Root;
    await act(async () => {
      root = hydrateRoot(container, <App />);
    });

    expect(errSpy).not.toHaveBeenCalled();

    errSpy.mockRestore();
    await act(async () => {
      root.unmount();
    });
  });
});
