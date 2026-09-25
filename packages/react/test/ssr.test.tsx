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
    expect(html).toContain('data-scope="divider"');
    // Both divider shapes survive serialisation: the bare rule keeps its
    // separator role, the captioned one its label part.
    expect(html).toContain('role="separator"');
    expect(html).toMatch(/data-scope="divider"[^>]*data-part="label"/);
    // …including the captioned *vertical* rule: that combination is the one
    // whose gap depends on the label's rotated writing mode, so orientation and
    // label have to serialise onto the same root.
    expect(html).toMatch(/data-orientation="vertical"(?:(?!<\/div>)[\s\S])*?data-part="label"/);
    // Badge, Chip and Indicator: the CSS-only status trio. Each optional part
    // and the bare data-pulse attribute have to serialise on the right element.
    expect(partAttrs(html, "badge", "root", "data-variant")).toEqual([
      "neutral",
      "success",
      "error",
    ]);
    expect(partTags(html, "badge", "dot")).toHaveLength(1);
    expect(partAttrs(html, "chip", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "chip", "remove-trigger", "aria-label")).toEqual(["Remove React"]);
    // data-pulse is a bare flag: some renderers write `data-pulse=""`, Vue writes
    // `data-pulse`; both are the same attribute to the `[data-pulse]` selector.
    const pulsing = partTags(html, "indicator", "root").map((tag) =>
      /\sdata-pulse(?:=""|[\s>])/.test(tag),
    );
    expect(pulsing).toEqual([true, false]);
    expect(partTags(html, "indicator", "dot")).toHaveLength(2);
    expect(partTags(html, "indicator", "label")).toHaveLength(1);
    // Callout: a CSS-only note. Every root stays role="note" whatever its
    // status (nothing is a live region), and the optional icon is hidden.
    expect(partAttrs(html, "callout", "root", "role")).toEqual(["note", "note"]);
    expect(partAttrs(html, "callout", "root", "data-variant")).toEqual(["info", "warning"]);
    expect(partAttrs(html, "callout", "icon", "aria-hidden")).toEqual(["true"]);
    expect(partTags(html, "callout", "description")).toHaveLength(2);
    // Skeleton and Spinner: the CSS-only loading states. Every shape reaches the
    // server, and the spinner's status role, hidden ring and label serialise
    // on the right elements.
    expect(partAttrs(html, "skeleton", "root", "data-shape")).toEqual(["text", "rect", "circle"]);
    expect(partAttrs(html, "skeleton", "root", "aria-hidden")).toEqual(["true", "true", "true"]);
    expect(partAttrs(html, "spinner", "root", "role")).toEqual(["status", "status"]);
    expect(partAttrs(html, "spinner", "root", "data-size")).toEqual(["md", "lg"]);
    expect(partAttrs(html, "spinner", "circle", "aria-hidden")).toEqual(["true", "true"]);
    expect(html).toMatch(/data-part="label"[^>]*>Saving changes</);
    // Avatar: Ark's image-loading machine. On the server the image has not
    // loaded, so the initials show and the image is hidden; the recipe lands on
    // each root.
    expect(partAttrs(html, "avatar", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "avatar", "root", "data-shape")).toEqual(["circle", "square"]);
    expect(partAttrs(html, "avatar", "fallback", "data-state")).toEqual(["visible", "visible"]);
    expect(partAttrs(html, "avatar", "image", "data-state")).toEqual(["hidden"]);
    expect(partTags(html, "avatar", "image")[0]).toMatch(/\shidden(?:=""|[\s>])/);
    // Vue and Svelte put hydration comments between the tag and its text.
    expect(html).toMatch(/data-part="fallback"[^>]*>(?:<!--[^>]*-->)*AL</);
    expect(html).toContain('data-scope="pin-input"');
    // Every code cell is on the server, and `count` makes the server's aria
    // labels agree with the client's — the PinInput-specific SSR hazard.
    expect(html.match(/data-index="/g) ?? []).toHaveLength(6);
    expect(html).toContain('aria-label="pin code 6 of 6"');
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
