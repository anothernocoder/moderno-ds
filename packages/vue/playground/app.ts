/**
 * SSR playground — the Vue twin of the React harness. Mounts every one of the
 * primitives in their default (closed) state so the SSR suite can assert a
 * stable server string and a warning-free hydration. `open` mounts the Dialog +
 * Select popovers to exercise the harder portal/id path.
 * SSR playground — the Vue twin of the React harness. Mounts the primitives in
 * their default (closed) state so the SSR suite can assert a stable server
 * string and a warning-free hydration. `open` mounts the Dialog + Select
 * popovers to exercise the harder portal/id path.
 */
import { defineComponent, h, type Component } from "vue";
import { Alert } from "../src/alert.js";
import { Callout } from "../src/callout.js";
import { Button } from "../src/button.js";
import { Divider } from "../src/divider.js";
import { Badge } from "../src/badge.js";
import { Chip } from "../src/chip.js";
import { Indicator } from "../src/indicator.js";
import { Skeleton } from "../src/skeleton.js";
import { Spinner } from "../src/spinner.js";
import { Card } from "../src/card.js";
import { Field } from "../src/field.js";
import { Avatar } from "../src/avatar.js";
import { Checkbox } from "../src/checkbox.js";
import { Switch } from "../src/switch.js";
import { RadioGroup } from "../src/radio-group.js";
import { Toggle } from "../src/toggle.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { Tabs } from "../src/tabs.js";
import { Accordion } from "../src/accordion.js";
import { Progress } from "../src/progress.js";
import { Slider } from "../src/slider.js";
import { NumberInput } from "../src/number-input.js";
import { Pagination } from "../src/pagination.js";
import { Dialog, Portal } from "../src/dialog.js";
import { Select, createListCollection } from "../src/select.js";
import { PinInput } from "../src/pin-input.js";
import { AreaChart, BarChart, LineChart, ScatterChart } from "../src/charts.js";

// A shared sample dataset for the four chart examples (Phase 4 deliverable).
const sales = [
  {
    name: "2023",
    points: [
      { x: 0, y: 10 },
      { x: 1, y: 40 },
      { x: 2, y: 30 },
      { x: 3, y: 55 },
      { x: 4, y: 48 },
    ],
  },
  {
    name: "2024",
    points: [
      { x: 0, y: 5 },
      { x: 1, y: 18 },
      { x: 2, y: 25 },
      { x: 3, y: 22 },
      { x: 4, y: 35 },
    ],
  },
];
const quarters = ["Q1", "Q2", "Q3", "Q4"];
const revenue = [{ name: "revenue", values: [12, 28, 19, 34] }];

// A six-digit one-time code: the cell indices the PinInput renders. `count` on
// the Root tells Ark the same number so the server-rendered aria labels match.
const CODE_CELLS = [0, 1, 2, 3, 4, 5];

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});

type Page = { type: "page"; value: number } | { type: "ellipsis" };

// A Pagination row: prev, the page list Ark's Context hands back (pages and
// ellipses), next.
const pageRow = () => [
  h(Pagination.PrevTrigger, {}, () => "‹"),
  h(Pagination.Context, null, {
    default: ({ pages }: { pages: Page[] }) =>
      pages.map((page, index) =>
        page.type === "page"
          ? h(Pagination.Item, { key: index, ...page }, () => String(page.value))
          : h(Pagination.Ellipsis, { key: index, index }, () => "…"),
      ),
  }),
  h(Pagination.NextTrigger, {}, () => "›"),
];

export const App = defineComponent({
  name: "VueSsrApp",
  props: {
    open: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h("main", {}, [
        h("section", { "aria-label": "buttons" }, [
          h(Button, { variant: "primary" }, () => "Primary"),
          h(Button, { variant: "secondary" }, () => "Secondary"),
          h(Button, { variant: "outline" }, () => "Outline"),
          h(Button, { variant: "ghost", size: "sm" }, () => "Ghost"),
          h(Button, { variant: "destructive", size: "lg" }, () => "Destructive"),
        ]),

        h("section", { "aria-label": "dividers" }, [
          h(Divider),
          h(Divider, { align: "start" }, () => "Or"),
          h(Divider, { orientation: "vertical" }),
          h(Divider, { orientation: "vertical" }, () => "Or"),
        ]),

        h("section", { "aria-label": "badges" }, [
          h(Badge, {}, () => "Draft"),
          h(Badge, { variant: "success", dot: true }, () => "Paid"),
          h(Badge, { variant: "error", size: "sm" }, () => "Overdue"),
        ]),

        h("section", { "aria-label": "chips" }, [
          h(Chip, {}, () => "Design"),
          h(
            Chip,
            { variant: "muted", size: "sm", removable: true, removeLabel: "Remove React" },
            () => "React",
          ),
        ]),

        h("section", { "aria-label": "indicators" }, [
          h(Indicator, { variant: "success", pulse: true }, () => "Online"),
          h(Indicator, { variant: "error", size: "sm", "aria-label": "Offline" }),
        ]),

        h("section", { "aria-label": "loading" }, [
          h(Skeleton),
          h(Skeleton, { shape: "rect" }),
          h(Skeleton, { shape: "circle" }),
          h(Spinner),
          h(Spinner, { size: "lg", label: "Saving changes" }),
        ]),

        h("section", { "aria-label": "avatars" }, [
          h(Avatar.Root, {}, () => [
            h(Avatar.Fallback, {}, () => "AL"),
            h(Avatar.Image, { src: "/ada.png", alt: "Ada Lovelace" }),
          ]),
          h(Avatar.Root, { size: "sm", shape: "square" }, () => [
            h(Avatar.Fallback, {}, () => "MD"),
          ]),
        ]),

        h("section", { "aria-label": "alerts" }, [
          h(Alert.Root, { variant: "info" }, () => [
            h(Alert.Icon, {}, () => "i"),
            h(Alert.Content, {}, () => [
              h(Alert.Title, {}, () => "Heads up"),
              h(Alert.Description, {}, () => "Your trial ends in three days."),
              h(Alert.Action, {}, () =>
                h(Button, { size: "sm", variant: "outline" }, () => "Manage plan"),
              ),
            ]),
          ]),
          h(Alert.Root, { variant: "error", size: "sm" }, () => [
            h(Alert.Icon, {}, () => "!"),
            h(Alert.Content, {}, () => [
              h(Alert.Title, {}, () => "Payment failed"),
              h(Alert.Description, {}, () => "We could not charge your card."),
            ]),
          ]),
        ]),

        h("section", { "aria-label": "callouts" }, [
          h(Callout.Root, {}, () => [
            h(Callout.Icon, {}, () => "i"),
            h(Callout.Content, {}, () => [
              h(Callout.Title, {}, () => "Good to know"),
              h(Callout.Description, {}, () => "Exports run overnight."),
            ]),
          ]),
          h(Callout.Root, { variant: "warning" }, () =>
            h(Callout.Content, {}, () =>
              h(Callout.Description, {}, () => "Renaming a workspace breaks old links."),
            ),
          ),
        ]),

        h("section", { "aria-label": "fields" }, [
          h(Field.Root as unknown as Component, { size: "sm" }, () => [
            h(Field.Label, {}, () => "Email"),
            h(Field.Input, { placeholder: "you@example.com" }),
            h(Field.HelperText, {}, () => "We never share it."),
            h(Field.ErrorText, {}, () => "Email is required."),
          ]),
          h(Field.Root as unknown as Component, { size: "lg", invalid: true }, () => [
            h(Field.Label, {}, () => "Bio"),
            h(Field.Textarea, { placeholder: "Tell us about yourself" }),
            h(Field.HelperText, {}, () => "A short introduction."),
            h(Field.ErrorText, {}, () => "Bio is required."),
          ]),
        ]),

        h(Card.Root, { variant: "outline", size: "md" }, () => [
          h(Card.Header, {}, () => [
            h(Card.Title, {}, () => "Monthly report"),
            h(Card.Description, {}, () => "Revenue across every channel."),
          ]),
          h(Card.Content, {}, () => "Up 12% on last month."),
          h(Card.Footer, {}, () => h(Button, { variant: "outline", size: "sm" }, () => "Export")),
        ]),

        h("section", { "aria-label": "checkboxes" }, [
          h(Checkbox.Root as unknown as Component, { defaultChecked: true }, () => [
            h(Checkbox.Control, {}, () => [
              h(Checkbox.Indicator, {}, () => "✓"),
              h(Checkbox.Indicator, { indeterminate: true }, () => "–"),
            ]),
            h(Checkbox.Label, {}, () => "Email me updates"),
            h(Checkbox.HiddenInput),
          ]),
          h(
            Checkbox.Root as unknown as Component,
            { size: "sm", defaultChecked: "indeterminate" },
            () => [
              h(Checkbox.Control, {}, () => [
                h(Checkbox.Indicator, {}, () => "✓"),
                h(Checkbox.Indicator, { indeterminate: true }, () => "–"),
              ]),
              h(Checkbox.Label, {}, () => "Select all"),
              h(Checkbox.HiddenInput),
            ],
          ),
          h(Checkbox.Root as unknown as Component, { size: "lg", disabled: true }, () => [
            h(Checkbox.Control, {}, () => h(Checkbox.Indicator, {}, () => "✓")),
            h(Checkbox.Label, {}, () => "Unavailable"),
            h(Checkbox.HiddenInput),
          ]),
        ]),

        h("section", { "aria-label": "switches" }, [
          h(Switch.Root, { defaultChecked: true }, () => [
            h(Switch.Control, {}, () => h(Switch.Thumb)),
            h(Switch.Label, {}, () => "Airplane mode"),
            h(Switch.HiddenInput),
          ]),
          h(Switch.Root, { size: "sm", disabled: true }, () => [
            h(Switch.Control, {}, () => h(Switch.Thumb)),
            h(Switch.Label, {}, () => "Bluetooth"),
            h(Switch.HiddenInput),
          ]),
        ]),

        h("section", { "aria-label": "radio groups" }, [
          h(RadioGroup.Root, { defaultValue: "standard" }, () => [
            h(RadioGroup.Label, {}, () => "Shipping"),
            h(RadioGroup.Item, { value: "standard" }, () => [
              h(RadioGroup.ItemControl),
              h(RadioGroup.ItemText, {}, () => [
                "Standard",
                h(RadioGroup.ItemDescription, {}, () => "3–5 business days"),
              ]),
              h(RadioGroup.ItemHiddenInput),
            ]),
            h(RadioGroup.Item, { value: "express" }, () => [
              h(RadioGroup.ItemControl),
              h(RadioGroup.ItemText, {}, () => [
                "Express",
                h(RadioGroup.ItemDescription, {}, () => "1–2 business days"),
              ]),
              h(RadioGroup.ItemHiddenInput),
            ]),
          ]),
          h(RadioGroup.Root, { size: "sm", orientation: "horizontal", disabled: true }, () => [
            h(RadioGroup.Label, {}, () => "Billing"),
            h(RadioGroup.Item, { value: "monthly" }, () => [
              h(RadioGroup.ItemControl),
              h(RadioGroup.ItemText, {}, () => "Monthly"),
              h(RadioGroup.ItemHiddenInput),
            ]),
            h(RadioGroup.Item, { value: "yearly" }, () => [
              h(RadioGroup.ItemControl),
              h(RadioGroup.ItemText, {}, () => "Yearly"),
              h(RadioGroup.ItemHiddenInput),
            ]),
          ]),
        ]),

        h("section", { "aria-label": "toggles" }, [
          h(Toggle.Root, { defaultPressed: true }, () => [
            h(Toggle.Indicator, null, { default: () => "★", fallback: () => "☆" }),
            "Favorite",
          ]),
          h(Toggle.Root, { variant: "outline", size: "sm", disabled: true }, () => [
            h(Toggle.Indicator, null, { default: () => "★", fallback: () => "☆" }),
            "Pin",
          ]),
          h(ToggleGroup.Root, { defaultValue: ["center"], "aria-label": "Text alignment" }, () => [
            h(ToggleGroup.Item, { value: "left" }, () => "Left"),
            h(ToggleGroup.Item, { value: "center" }, () => "Center"),
          ]),
          h(
            ToggleGroup.Root,
            {
              variant: "outline",
              size: "lg",
              orientation: "vertical",
              multiple: true,
              disabled: true,
              "aria-label": "Text style",
            },
            () => [
              h(ToggleGroup.Item, { value: "bold" }, () => "Bold"),
              h(ToggleGroup.Item, { value: "italic" }, () => "Italic"),
            ],
          ),
        ]),

        h("section", { "aria-label": "tabs" }, [
          h(Tabs.Root, { defaultValue: "account" }, () => [
            h(Tabs.List, { "aria-label": "Settings" }, () => [
              h(Tabs.Trigger, { value: "account" }, () => "Account"),
              h(Tabs.Trigger, { value: "password" }, () => "Password"),
              h(Tabs.Indicator),
            ]),
            h(Tabs.Content, { value: "account" }, () => "Account panel"),
            h(Tabs.Content, { value: "password" }, () => "Password panel"),
          ]),
          h(
            Tabs.Root,
            { variant: "enclosed", size: "sm", orientation: "vertical", defaultValue: "team" },
            () => [
              h(Tabs.List, { "aria-label": "Workspace" }, () => [
                h(Tabs.Trigger, { value: "billing", disabled: true }, () => "Billing"),
                h(Tabs.Trigger, { value: "team" }, () => "Team"),
                h(Tabs.Indicator),
              ]),
              h(Tabs.Content, { value: "billing" }, () => "Billing panel"),
              h(Tabs.Content, { value: "team" }, () => "Team panel"),
            ],
          ),
        ]),

        h("section", { "aria-label": "accordion" }, [
          h(Accordion.Root, { defaultValue: ["shipping"] }, () => [
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
          ]),
          h(
            Accordion.Root,
            { variant: "enclosed", size: "sm", multiple: true, defaultValue: ["support"] },
            () => [
              h(Accordion.Item, { value: "warranty", disabled: true }, () => [
                h(Accordion.ItemTrigger, {}, () => [
                  "Warranty",
                  h(Accordion.ItemIndicator, {}, () => "⌄"),
                ]),
                h(Accordion.ItemContent, {}, () => "Warranty answer"),
              ]),
              h(Accordion.Item, { value: "support" }, () => [
                h(Accordion.ItemTrigger, {}, () => [
                  "Support",
                  h(Accordion.ItemIndicator, {}, () => "⌄"),
                ]),
                h(Accordion.ItemContent, {}, () => "Support answer"),
              ]),
            ],
          ),
        ]),

        h("section", { "aria-label": "progress" }, [
          h(Progress.Root, { modelValue: 40 }, () => [
            h(Progress.Label, {}, () => "Uploading"),
            h(Progress.ValueText),
            h(Progress.Track, {}, () => h(Progress.Range)),
          ]),
          h(Progress.Root, { size: "sm", modelValue: 75 }, () => [
            h(Progress.Circle, {}, () => [h(Progress.CircleTrack), h(Progress.CircleRange)]),
            h(Progress.ValueText),
          ]),
          h(Progress.Root, { size: "lg", modelValue: null }, () => [
            h(Progress.Track, {}, () => h(Progress.Range)),
          ]),
        ]),

        h("section", { "aria-label": "slider" }, [
          h(Slider.Root, { defaultValue: [40] }, () => [
            h(Slider.Label, {}, () => "Volume"),
            h(Slider.ValueText),
            h(Slider.Control, {}, () => [
              h(Slider.Track, {}, () => h(Slider.Range)),
              h(Slider.Thumb, { index: 0 }, () => h(Slider.HiddenInput)),
            ]),
            h(Slider.MarkerGroup, {}, () => [
              h(Slider.Marker, { value: 0 }, () => "0"),
              h(Slider.Marker, { value: 50 }, () => "50"),
              h(Slider.Marker, { value: 100 }, () => "100"),
            ]),
          ]),
          h(Slider.Root, { size: "sm", defaultValue: [20, 80] }, () => [
            h(Slider.Label, {}, () => "Price"),
            h(Slider.Control, {}, () => [
              h(Slider.Track, {}, () => h(Slider.Range)),
              h(Slider.Thumb, { index: 0 }, () => h(Slider.HiddenInput)),
              h(Slider.Thumb, { index: 1 }, () => h(Slider.HiddenInput)),
            ]),
          ]),
        ]),

        h("section", { "aria-label": "number-input" }, [
          h(NumberInput.Root, { defaultValue: "10", min: 0, max: 10 }, () => [
            h(NumberInput.Label, {}, () => "Quantity"),
            h(NumberInput.Control, {}, () => [
              h(NumberInput.Input),
              h(NumberInput.DecrementTrigger, {}, () => "−"),
              h(NumberInput.IncrementTrigger, {}, () => "+"),
            ]),
          ]),
          h(
            NumberInput.Root,
            {
              size: "sm",
              defaultValue: "1234.5",
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
        ]),

        h("section", { "aria-label": "pagination" }, [
          h(Pagination.Root, { count: 100, pageSize: 10, defaultPage: 5 }, () => pageRow()),
          h(Pagination.Root, { size: "sm", count: 30, pageSize: 10 }, () => pageRow()),
        ]),

        h(Dialog.Root, { defaultOpen: props.open }, () => [
          h(Dialog.Trigger, {}, () => "Open dialog"),
          h(Portal, {}, () => [
            h(Dialog.Backdrop),
            h(Dialog.Positioner, {}, () =>
              h(Dialog.Content, {}, () => [
                h(Dialog.Title, {}, () => "Delete account"),
                h(Dialog.Description, {}, () => "This action cannot be undone."),
                h(Dialog.CloseTrigger, {}, () => "Cancel"),
              ]),
            ),
          ]),
        ]),

        h(
          Select.Root as unknown as Component,
          { collection: frameworks, size: "md", defaultOpen: props.open },
          () => [
            h(Select.Label, {}, () => "Framework"),
            h(Select.Control, {}, () =>
              h(Select.Trigger, {}, () => [
                h(Select.ValueText, { placeholder: "Pick one" }),
                h(Select.Indicator, {}, () => "▾"),
              ]),
            ),
            h(Portal, {}, () =>
              h(Select.Positioner, {}, () =>
                h(Select.Content, {}, () =>
                  frameworks.items.map((item) =>
                    h(Select.Item, { key: item.value, item }, () => [
                      h(Select.ItemText, {}, () => item.label),
                      h(Select.ItemIndicator, {}, () => "✓"),
                    ]),
                  ),
                ),
              ),
            ),
          ],
        ),

        h(PinInput.Root, { count: CODE_CELLS.length, otp: true, size: "md" }, () => [
          h(PinInput.Label, {}, () => "Verification code"),
          h(PinInput.Control, {}, () =>
            CODE_CELLS.map((index) => h(PinInput.Input, { key: index, index })),
          ),
          h(PinInput.HiddenInput),
        ]),

        h("section", { "aria-label": "charts" }, [
          h(LineChart, { width: 320, height: 180, series: sales }),
          h(AreaChart, { width: 320, height: 180, series: sales }),
          h(BarChart, { width: 320, height: 180, categories: quarters, series: revenue }),
          h(ScatterChart, { width: 320, height: 180, series: sales }),
        ]),
      ]);
  },
});
