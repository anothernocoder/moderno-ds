import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import App from "../playground/App.svelte";
import { attrOf, partAttrs, partTags } from "../../core/test/ssr-parts.ts";

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
    // Toggle and ToggleGroup: Ark's toggle machines on native buttons. The
    // recipes land on each root, the pressed state reaches the server string
    // (aria-pressed / aria-checked / data-state), the Indicator renders its
    // on or off content (past any framework hydration comments), and each group carries its role and orientation.
    expect(partAttrs(html, "toggle", "root", "data-variant")).toEqual(["ghost", "outline"]);
    expect(partAttrs(html, "toggle", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "toggle", "root", "aria-pressed")).toEqual(["true", "false"]);
    expect(partAttrs(html, "toggle", "root", "data-state")).toEqual(["on", "off"]);
    expect(partAttrs(html, "toggle", "indicator", "data-state")).toEqual(["on", "off"]);
    expect(html).toMatch(/data-part="indicator"[^>]*>(?:\s|<!--[^>]*-->)*★/);
    expect(html).toMatch(/data-part="indicator"[^>]*>(?:\s|<!--[^>]*-->)*☆/);
    const disabledToggles = partTags(html, "toggle", "root").map((tag) =>
      /\sdisabled(?:=""|[\s>])/.test(tag),
    );
    expect(disabledToggles).toEqual([false, true]);
    expect(partAttrs(html, "toggle-group", "root", "data-variant")).toEqual(["ghost", "outline"]);
    expect(partAttrs(html, "toggle-group", "root", "data-size")).toEqual(["md", "lg"]);
    expect(partAttrs(html, "toggle-group", "root", "data-orientation")).toEqual([
      "horizontal",
      "vertical",
    ]);
    expect(partAttrs(html, "toggle-group", "root", "role")).toEqual(["radiogroup", "group"]);
    expect(partAttrs(html, "toggle-group", "item", "data-state")).toEqual([
      "off",
      "on",
      "off",
      "off",
    ]);
    const groupItems = partTags(html, "toggle-group", "item");
    expect(groupItems.slice(0, 2).map((tag) => attrOf(tag, "aria-checked"))).toEqual([
      "false",
      "true",
    ]);
    expect(groupItems.slice(2).map((tag) => attrOf(tag, "aria-pressed"))).toEqual([
      "false",
      "false",
    ]);
    expect(groupItems.map((tag) => /\sdisabled(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      false,
      true,
      true,
    ]);
    // Tabs: Ark's tabs machine. The recipe lands on each root, the list is a
    // tablist, the selected tab reaches the server string (aria-selected +
    // data-selected), every panel is labelled by its own tab's id, the panels of
    // unselected tabs are hidden, and a disabled tab is a disabled button.
    expect(partAttrs(html, "tabs", "root", "data-variant")).toEqual(["line", "enclosed"]);
    expect(partAttrs(html, "tabs", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "tabs", "root", "data-orientation")).toEqual(["horizontal", "vertical"]);
    expect(partAttrs(html, "tabs", "list", "role")).toEqual(["tablist", "tablist"]);
    expect(partTags(html, "tabs", "indicator")).toHaveLength(2);
    const tabTriggers = partTags(html, "tabs", "trigger");
    expect(tabTriggers.map((tag) => attrOf(tag, "aria-selected"))).toEqual([
      "true",
      "false",
      "false",
      "true",
    ]);
    expect(tabTriggers.map((tag) => /\sdata-selected(?:=""|[\s>])/.test(tag))).toEqual([
      true,
      false,
      false,
      true,
    ]);
    expect(tabTriggers.map((tag) => /\sdisabled(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      false,
      true,
      false,
    ]);
    const tabPanels = partTags(html, "tabs", "content");
    expect(tabPanels.map((tag) => attrOf(tag, "role"))).toEqual([
      "tabpanel",
      "tabpanel",
      "tabpanel",
      "tabpanel",
    ]);
    expect(tabPanels.map((tag) => attrOf(tag, "aria-labelledby"))).toEqual(
      tabTriggers.map((tag) => attrOf(tag, "id")),
    );
    expect(tabPanels.map((tag) => /\shidden(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      true,
      true,
      false,
    ]);
    expect(html).toContain("Account panel");
    expect(html).toContain("Team panel");
    // Accordion: Ark's accordion machine over collapsible items. The recipe
    // lands on each root, the open items reach the server string
    // (aria-expanded + data-state), every content is a region labelled by its
    // own trigger's id, the contents of closed items are hidden, and a disabled
    // item's trigger is a disabled button.
    expect(partAttrs(html, "accordion", "root", "data-variant")).toEqual(["line", "enclosed"]);
    expect(partAttrs(html, "accordion", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "accordion", "item", "data-state")).toEqual([
      "open",
      "closed",
      "closed",
      "open",
    ]);
    expect(partTags(html, "accordion", "item-indicator")).toHaveLength(4);
    const accordionTriggers = partTags(html, "accordion", "item-trigger");
    expect(accordionTriggers.map((tag) => attrOf(tag, "aria-expanded"))).toEqual([
      "true",
      "false",
      "false",
      "true",
    ]);
    expect(accordionTriggers.map((tag) => /\sdisabled(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      false,
      true,
      false,
    ]);
    const accordionContents = partTags(html, "accordion", "item-content");
    expect(accordionContents.map((tag) => attrOf(tag, "role"))).toEqual([
      "region",
      "region",
      "region",
      "region",
    ]);
    expect(accordionContents.map((tag) => attrOf(tag, "aria-labelledby"))).toEqual(
      accordionTriggers.map((tag) => attrOf(tag, "id")),
    );
    expect(accordionContents.map((tag) => /\shidden(?:=""|[\s>])/.test(tag))).toEqual([
      false,
      true,
      true,
      false,
    ]);
    expect(html).toContain("Shipping answer");
    expect(html).toContain("Support answer");
    // Progress: Ark's progress machine. The recipe lands on each root, the
    // state reaches the server, the track or the circle is the progressbar
    // with its value, and the percentage is inline on the range; an
    // indeterminate progress has no value and no width.
    expect(partAttrs(html, "progress", "root", "data-size")).toEqual(["md", "sm", "lg"]);
    expect(partAttrs(html, "progress", "root", "data-state")).toEqual([
      "loading",
      "loading",
      "indeterminate",
    ]);
    expect(partAttrs(html, "progress", "track", "role")).toEqual(["progressbar", "progressbar"]);
    expect(partAttrs(html, "progress", "track", "aria-valuenow")).toEqual(["40", undefined]);
    const progressRanges = partAttrs(html, "progress", "range", "style");
    expect(progressRanges[0]).toMatch(/^width:\s*40%;?$/);
    expect(progressRanges[1] ?? "").not.toMatch(/width/);
    expect(partTags(html, "progress", "circle")[0]).toMatch(/^<svg/);
    expect(partAttrs(html, "progress", "circle", "role")).toEqual(["progressbar"]);
    expect(partAttrs(html, "progress", "circle", "aria-valuenow")).toEqual(["75"]);
    expect(partTags(html, "progress", "circle-range")).toHaveLength(1);
    expect(html).toMatch(/data-part="value-text"[^>]*>(?:<!--[^>]*-->)*40%/);
    // Slider: Ark's slider machine. The recipe lands on each root, every thumb
    // reaches the server as a slider with its value and bounds (a range's two
    // thumbs bound each other) named by its label, the root carries the
    // range's offsets inline, and each marker knows where it sits.
    expect(partAttrs(html, "slider", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "slider", "thumb", "role")).toEqual(["slider", "slider", "slider"]);
    expect(partAttrs(html, "slider", "thumb", "aria-valuenow")).toEqual(["40", "20", "80"]);
    expect(partAttrs(html, "slider", "thumb", "aria-valuemin")).toEqual(["0", "0", "20"]);
    expect(partAttrs(html, "slider", "thumb", "aria-valuemax")).toEqual(["100", "80", "100"]);
    const [volumeLabel, priceLabel] = partAttrs(html, "slider", "label", "id");
    expect(partAttrs(html, "slider", "thumb", "aria-labelledby")).toEqual([
      volumeLabel,
      priceLabel,
      priceLabel,
    ]);
    const sliderRoots = partAttrs(html, "slider", "root", "style");
    expect(sliderRoots[0]).toMatch(/--slider-range-start:\s*0%/);
    expect(sliderRoots[0]).toMatch(/--slider-range-end:\s*60%/);
    expect(sliderRoots[1]).toMatch(/--slider-range-start:\s*20%/);
    expect(sliderRoots[1]).toMatch(/--slider-range-end:\s*20%/);
    expect(partAttrs(html, "slider", "marker", "data-state")).toEqual([
      "under-value",
      "over-value",
      "over-value",
    ]);
    expect(html).toMatch(
      /data-scope="slider"[^>]*data-part="value-text"[^>]*>(?:<!--[^>]*-->)*40</,
    );
    expect(html).toContain('data-scope="pin-input"');
    // Every code cell is on the server, and `count` makes the server's aria
    // labels agree with the client's — the PinInput-specific SSR hazard.
    expect(partAttrs(html, "pin-input", "input", "data-index")).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
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
