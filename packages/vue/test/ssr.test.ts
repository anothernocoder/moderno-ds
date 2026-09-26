import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, type Component } from "vue";
import { renderToString } from "@vue/server-renderer";
import { App } from "../playground/app.js";
import { Alert } from "../src/alert.js";
import { Callout } from "../src/callout.js";
import { Button } from "../src/button.js";
import { Card } from "../src/card.js";
import { Divider } from "../src/divider.js";
import { Badge } from "../src/badge.js";
import { Chip } from "../src/chip.js";
import { Indicator } from "../src/indicator.js";
import { Skeleton } from "../src/skeleton.js";
import { Spinner } from "../src/spinner.js";
import { Avatar } from "../src/avatar.js";
import { Field } from "../src/field.js";
import { Checkbox } from "../src/checkbox.js";
import { Switch } from "../src/switch.js";
import { RadioGroup } from "../src/radio-group.js";
import { Toggle } from "../src/toggle.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { attrOf, partAttrs, partTags } from "../../core/test/ssr-parts.ts";
import { PinInput } from "../src/pin-input.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("SSR (Vue)", () => {
  it("server-renders the primitives to a stable HTML string", async () => {
    const html = await renderToString(createSSRApp({ render: () => h(App) }));
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
 * (Button, Card, Field and Checkbox) exercise exactly that, so a warning-free
 * must match across server and client render, and PinInput derives every cell
 * id (plus the label's `for`) from the same root id. The portal-free primitives
 * (Button + Field + Checkbox + PinInput) exercise exactly that, so a warning-free
 * hydration here proves the id path is stable. Ark's portaled popovers
 * (Dialog/Select) position via floating-ui measurement that jsdom does not
 * provide, so their hydration is covered by the string + interaction suites
 * (Button + Divider + Field + Checkbox) exercise exactly that, so a
 * warning-free hydration here proves the id path is stable. Ark's portaled
 * popovers (Dialog/Select) position via floating-ui measurement that jsdom does
 * not provide, so their hydration is covered by the string + interaction suites
 * instead.
 */
const HydrationApp = defineComponent({
  name: "VueHydrationApp",
  setup() {
    return () =>
      h("main", {}, [
        h(Button, { variant: "primary" }, () => "Primary"),
        h(Button, { variant: "destructive", size: "lg" }, () => "Destructive"),
        h(Card.Root, { variant: "muted", size: "sm" }, () => [
          h(Card.Header, {}, () => [
            h(Card.Title, {}, () => "Monthly report"),
            h(Card.Description, {}, () => "Revenue across every channel."),
          ]),
          h(Card.Content, {}, () => "Up 12% on last month."),
          h(Card.Footer, {}, () => h(Button, { size: "sm" }, () => "Export")),
        ]),
        h(Divider),
        h(Divider, { align: "start" }, () => "Or"),
        h(Divider, { orientation: "vertical" }, () => "Or"),
        h(Badge, { variant: "success", dot: true }, () => "Paid"),
        h(Chip, { removable: true, removeLabel: "Remove React" }, () => "React"),
        h(Indicator, { variant: "success", pulse: true }, () => "Online"),
        h(Skeleton, { shape: "circle" }),
        h(Spinner, { size: "sm" }),
        h(Avatar.Root, { shape: "square" }, () => [
          h(Avatar.Fallback, {}, () => "AL"),
          h(Avatar.Image, { src: "/ada.png", alt: "Ada Lovelace" }),
        ]),
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
        h(Switch.Root, { defaultChecked: true }, () => [
          h(Switch.Control, {}, () => h(Switch.Thumb)),
          h(Switch.Label, {}, () => "Airplane mode"),
          h(Switch.HiddenInput),
        ]),
        h(RadioGroup.Root, { defaultValue: "standard", orientation: "horizontal" }, () => [
          h(RadioGroup.Label, {}, () => "Shipping"),
          h(RadioGroup.Item, { value: "standard" }, () => [
            h(RadioGroup.ItemControl),
            h(RadioGroup.ItemText, {}, () => [
              "Standard",
              h(RadioGroup.ItemDescription, {}, () => "3–5 business days"),
            ]),
            h(RadioGroup.ItemHiddenInput),
          ]),
          h(RadioGroup.Item, { value: "express", disabled: true }, () => [
            h(RadioGroup.ItemControl),
            h(RadioGroup.ItemText, {}, () => "Express"),
            h(RadioGroup.ItemHiddenInput),
          ]),
        ]),
        h(Toggle.Root, { defaultPressed: true, variant: "outline" }, () => [
          h(Toggle.Indicator, null, { default: () => "★", fallback: () => "☆" }),
          "Favorite",
        ]),
        h(ToggleGroup.Root, { defaultValue: ["center"], "aria-label": "Text alignment" }, () => [
          h(ToggleGroup.Item, { value: "left" }, () => "Left"),
          h(ToggleGroup.Item, { value: "center", disabled: true }, () => "Center"),
        ]),
        h(Alert.Root, { variant: "error" }, () => [
          h(Alert.Icon, {}, () => "!"),
          h(Alert.Content, {}, () => [
            h(Alert.Title, {}, () => "Payment failed"),
            h(Alert.Description, {}, () => "We could not charge your card."),
          ]),
        ]),
        h(Callout.Root, { variant: "warning" }, () => [
          h(Callout.Icon, {}, () => "!"),
          h(Callout.Content, {}, () => h(Callout.Title, {}, () => "Renaming breaks old links")),
        ]),
        h(PinInput.Root, { count: 4, otp: true }, () => [
          h(PinInput.Label, {}, () => "Verification code"),
          h(PinInput.Control, {}, () =>
            [0, 1, 2, 3].map((index) => h(PinInput.Input, { key: index, index })),
          ),
          h(PinInput.HiddenInput),
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
