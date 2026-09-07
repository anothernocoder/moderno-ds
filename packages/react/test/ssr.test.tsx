// @vitest-environment jsdom
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { App } from "../playground/app.js";
import { partAttrs, partTags } from "../../core/test/ssr-parts.ts";

afterEach(() => {
  document.body.replaceChildren();
});

describe("SSR + hydration (React 19)", () => {
  it("server-renders the primitives to a stable HTML string", () => {
    const html = renderToString(<App />);
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
    // Root that stopped applying the recipe.
    expect(partAttrs(html, "field", "root", "data-size")).toEqual(["sm", "lg"]);
    // The second field's control is Field's own Textarea part.
    expect(partTags(html, "field", "textarea")).toHaveLength(1);
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
