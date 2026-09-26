import { describe, expect, it } from "vitest";
import { renderToString } from "solid-js/web";
import { App } from "../playground/app.jsx";
import { partAttrs, partTags } from "../../core/test/ssr-parts.ts";

/**
 * SSR smoke — Solid compiles this file in server mode (see vitest.ssr.config.ts)
 * so `solid-js/web`'s `renderToString` is the real isomorphic renderer. Proves
 * the primitives serialise to stable HTML with the contract attributes intact;
 * Ark's portaled popovers render inline under SSR.
 */
describe("SSR (Solid)", () => {
  it("server-renders the primitives to a stable HTML string", () => {
    const html = renderToString(() => <App />);
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
    // Switch: Ark's on/off machine. The on/off state reaches every part on the
    // server, the recipe lands on each root, and the hidden input already
    // carries the switch role (and its checked state) before hydration.
    expect(partAttrs(html, "switch", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "switch", "control", "data-state")).toEqual(["checked", "unchecked"]);
    expect(partAttrs(html, "switch", "thumb", "data-state")).toEqual(["checked", "unchecked"]);
    // Vue serialises a bare `data-disabled`, the others `data-disabled=""`.
    const disabledRoots = partTags(html, "switch", "root").map((tag) =>
      /\sdata-disabled(?:=""|[\s>])/.test(tag),
    );
    expect(disabledRoots).toEqual([false, true]);
    const switchInputs = html.match(/<input[^>]*role="switch"[^>]*>/g) ?? [];
    expect(switchInputs).toHaveLength(2);
    expect(switchInputs[0]).toMatch(/\schecked(?:=""|[\s>/])/);
    expect(switchInputs[1]).toMatch(/\sdisabled(?:=""|[\s>/])/);
    // RadioGroup: Ark's radio machine. The recipe and Ark's orientation land
    // on each root, the checked item reaches its parts on the server, the
    // disabled group is marked, and every native radio is already there with
    // its checked / disabled state before hydration.
    expect(partAttrs(html, "radio-group", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "radio-group", "root", "data-orientation")).toEqual([
      "vertical",
      "horizontal",
    ]);
    expect(partAttrs(html, "radio-group", "root", "role")).toEqual(["radiogroup", "radiogroup"]);
    expect(partAttrs(html, "radio-group", "item", "data-state")).toEqual([
      "checked",
      "unchecked",
      "unchecked",
      "unchecked",
    ]);
    expect(partAttrs(html, "radio-group", "item-control", "data-state")).toEqual([
      "checked",
      "unchecked",
      "unchecked",
      "unchecked",
    ]);
    expect(partTags(html, "radio-group", "item-description")).toHaveLength(2);
    const disabledGroups = partTags(html, "radio-group", "root").map((tag) =>
      /\sdata-disabled(?:=""|[\s>])/.test(tag),
    );
    expect(disabledGroups).toEqual([false, true]);
    const radios = html.match(/<input[^>]*type="radio"[^>]*>/g) ?? [];
    expect(radios).toHaveLength(4);
    expect(radios[0]).toMatch(/\schecked(?:=""|[\s>/])/);
    expect(radios[1]).not.toMatch(/\schecked(?:=""|[\s>/])/);
    expect(radios[3]).toMatch(/\sdisabled(?:=""|[\s>/])/);
    expect(html).toContain('data-scope="pin-input"');
    // Every code cell is on the server, and `count` makes the server's aria
    // labels agree with the client's — the PinInput-specific SSR hazard.
    expect(html.match(/data-index="/g) ?? []).toHaveLength(6);
    expect(html).toContain('aria-label="pin code 6 of 6"');
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

  it("propagates defaultOpen through to the (non-portaled) trigger state", () => {
    // Solid's <Portal> is client-only, so the popover *content* isn't in the
    // server string (same as React's renderToString) — but the open state still
    // serialises onto the trigger, proving defaultOpen flows through SSR.
    const html = renderToString(() => <App open />);
    expect(html).toContain('data-scope="dialog"');
    expect(html).toContain('data-scope="select"');
    expect(html).toMatch(/data-part="trigger"[^>]*data-state="open"/);
  });
});
