// @vitest-environment jsdom
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { App } from "../playground/app.js";

/**
 * Whole-app checks. Each component's server string is asserted on its own, in
 * `ssr/<slug>.test.tsx`, over its playground section alone; hydration stays
 * one test over every section at once, because a `useId` mismatch only shows
 * when the whole tree hydrates together.
 */

afterEach(() => {
  document.body.replaceChildren();
});

/** The slugs of the files in `dir` (relative to this test) ending in `suffix`, sorted. */
function slugsIn(dir: string, suffix: string): string[] {
  return readdirSync(fileURLToPath(new URL(dir, import.meta.url)))
    .filter((file) => file.endsWith(suffix))
    .map((file) => file.slice(0, -suffix.length))
    .sort();
}

describe("SSR + hydration (React 19)", () => {
  it("gives every component a playground section and its own SSR test", () => {
    const components = slugsIn("../src/", ".tsx");
    expect(slugsIn("../playground/sections/", ".tsx")).toEqual(components);
    expect(slugsIn("./ssr/", ".test.tsx")).toEqual(components);
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
