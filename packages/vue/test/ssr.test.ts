import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, type Component } from "vue";
import { renderToString } from "@vue/server-renderer";
import { App } from "../playground/app.js";
import { Accordion } from "../src/accordion.js";
import { Alert } from "../src/alert.js";
import { Avatar } from "../src/avatar.js";
import { Badge } from "../src/badge.js";
import { Button } from "../src/button.js";
import { Callout } from "../src/callout.js";
import { Card } from "../src/card.js";
import { Checkbox } from "../src/checkbox.js";
import { Chip } from "../src/chip.js";
import { Divider } from "../src/divider.js";
import { Field } from "../src/field.js";
import { Indicator } from "../src/indicator.js";
import { NumberInput } from "../src/number-input.js";
import { Pagination } from "../src/pagination.js";
import { PinInput } from "../src/pin-input.js";
import { Progress } from "../src/progress.js";
import { RadioGroup } from "../src/radio-group.js";
import { Skeleton } from "../src/skeleton.js";
import { Slider } from "../src/slider.js";
import { Spinner } from "../src/spinner.js";
import { Switch } from "../src/switch.js";
import { Tabs } from "../src/tabs.js";
import { Toggle } from "../src/toggle.js";
import { ToggleGroup } from "../src/toggle-group.js";

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
 * id (plus the label's `for`) from the same root id. The portal-free
 * primitives below exercise exactly that, so a warning-free hydration here
 * proves the id path is stable. Ark's portaled popovers (Dialog/Select)
 * position via floating-ui measurement that jsdom does not provide, so their
 * hydration is covered by the string + interaction suites instead.
 */
type HydrationPage = { type: "page"; value: number } | { type: "ellipsis" };

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
        h(Tabs.Root, { defaultValue: "password", variant: "enclosed" }, () => [
          h(Tabs.List, { "aria-label": "Settings" }, () => [
            h(Tabs.Trigger, { value: "account" }, () => "Account"),
            h(Tabs.Trigger, { value: "password" }, () => "Password"),
            h(Tabs.Trigger, { value: "billing", disabled: true }, () => "Billing"),
            h(Tabs.Indicator),
          ]),
          h(Tabs.Content, { value: "account" }, () => "Account panel"),
          h(Tabs.Content, { value: "password" }, () => "Password panel"),
          h(Tabs.Content, { value: "billing" }, () => "Billing panel"),
        ]),
        h(Accordion.Root, { defaultValue: ["returns"], variant: "enclosed" }, () => [
          h(Accordion.Item, { value: "shipping" }, () => [
            h(Accordion.ItemTrigger, {}, () => [
              "Shipping",
              h(Accordion.ItemIndicator, {}, () => "⌄"),
            ]),
            h(Accordion.ItemContent, {}, () => "Shipping answer"),
          ]),
          h(Accordion.Item, { value: "returns" }, () => [
            h(Accordion.ItemTrigger, {}, () => [
              "Returns",
              h(Accordion.ItemIndicator, {}, () => "⌄"),
            ]),
            h(Accordion.ItemContent, {}, () => "Returns answer"),
          ]),
          h(Accordion.Item, { value: "warranty", disabled: true }, () => [
            h(Accordion.ItemTrigger, {}, () => "Warranty"),
            h(Accordion.ItemContent, {}, () => "Warranty answer"),
          ]),
        ]),
        h(Progress.Root, { modelValue: 60, size: "sm" }, () => [
          h(Progress.Label, {}, () => "Uploading"),
          h(Progress.ValueText),
          h(Progress.Track, {}, () => h(Progress.Range)),
        ]),
        h(Progress.Root, { modelValue: null }, () => [
          h(Progress.Circle, {}, () => [h(Progress.CircleTrack), h(Progress.CircleRange)]),
        ]),
        h(Slider.Root, { modelValue: [20, 80], size: "sm" }, () => [
          h(Slider.Label, {}, () => "Price"),
          h(Slider.ValueText),
          h(Slider.Control, {}, () => [
            h(Slider.Track, {}, () => h(Slider.Range)),
            h(Slider.Thumb, { index: 0 }, () => h(Slider.HiddenInput)),
            h(Slider.Thumb, { index: 1 }, () => h(Slider.HiddenInput)),
          ]),
          h(Slider.MarkerGroup, {}, () => [
            h(Slider.Marker, { value: 0 }, () => "0"),
            h(Slider.Marker, { value: 100 }, () => "100"),
          ]),
        ]),
        h(
          NumberInput.Root,
          {
            modelValue: "1234.5",
            size: "sm",
            max: 2000,
            formatOptions: { style: "currency", currency: "USD" },
          },
          () => [
            h(NumberInput.Label, {}, () => "Price"),
            h(NumberInput.Control, {}, () => [
              h(NumberInput.Input),
              h(NumberInput.DecrementTrigger, {}, () => "−"),
              h(NumberInput.IncrementTrigger, {}, () => "+"),
            ]),
          ],
        ),
        h(Pagination.Root, { page: 5, count: 100, pageSize: 10, size: "sm" }, () => [
          h(Pagination.PrevTrigger, {}, () => "‹"),
          h(Pagination.Context, null, {
            default: ({ pages }: { pages: HydrationPage[] }) =>
              pages.map((page, index) =>
                page.type === "page"
                  ? h(Pagination.Item, { key: index, ...page }, () => String(page.value))
                  : h(Pagination.Ellipsis, { key: index, index }, () => "…"),
              ),
          }),
          h(Pagination.NextTrigger, {}, () => "›"),
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
