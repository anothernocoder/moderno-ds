/**
 * The compounds a model cannot assemble from their parts (ADR-0011). A form
 * compound needs ids, values and collections that OpenUI Lang has no words
 * for, so the library gives it one **Simple form** instead: plain arguments
 * (`Select(label, options)`), and the framework adapter renders the whole
 * anatomy from the docs example. Its recipe variants (`size`) follow the
 * arguments listed here.
 */
import { z } from "zod/v4";

/** `["Red", {label: "Dark blue", value: "navy"}]`: a label alone is its own value. */
const options = () =>
  z
    .array(z.union([z.string(), z.object({ label: z.string(), value: z.string() })]))
    .describe(
      'A label, or {label, value} when the value differs: ["Red", {label: "Dark blue", value: "navy"}]',
    );

const label = () => z.string().describe("Names the control, above it.");
const optional = (schema: z.ZodType, note: string) => schema.describe(note).optional();
const number = (note: string) => optional(z.number(), note);
const text = (note: string) => optional(z.string(), note);

export interface SimpleForm {
  fields: [string, z.ZodType][];
  /**
   * Holds one panel per entry of its first argument (`Tabs(["Day", "Week"],
   * [dayPanel, weekPanel])`): `children` follows the fields.
   */
  panels?: true;
}

export const SIMPLE_FORMS = {
  Field: {
    fields: [
      ["label", label()],
      ["placeholder", text("Example text shown while it is empty.")],
      ["helperText", text("A hint below the input.")],
      [
        "type",
        optional(
          z.enum(["text", "email", "password", "tel", "url", "search"]),
          "Default: text. Use NumberInput for an amount.",
        ),
      ],
      [
        "inputMode",
        optional(
          z.enum(["text", "numeric", "decimal", "tel", "email", "url"]),
          "The phone keyboard to show.",
        ),
      ],
      ["maxLength", number("The most characters it accepts.")],
    ],
  },
  NumberInput: {
    fields: [
      ["label", label()],
      ["min", number("The smallest value.")],
      ["max", number("The largest value.")],
      ["step", number("Default: 1")],
      ["defaultValue", number("The starting value.")],
    ],
  },
  PinInput: {
    fields: [
      ["label", label()],
      ["length", z.number().describe("How many boxes, one character each.")],
    ],
  },
  Select: {
    fields: [
      ["label", label()],
      ["options", options()],
      ["placeholder", text("Shown until the user picks one.")],
    ],
  },
  Combobox: {
    fields: [
      ["label", label()],
      ["options", options()],
      ["placeholder", text("Shown in the search box while it is empty.")],
    ],
  },
  RadioGroup: {
    fields: [
      ["label", label()],
      ["options", options()],
      ["defaultValue", text("The value picked at first.")],
    ],
  },
  SegmentedControl: {
    fields: [
      ["label", label().describe("Names the control for screen readers.")],
      ["options", options()],
      ["defaultValue", text("Default: the first option's value.")],
    ],
  },
  ToggleGroup: {
    fields: [
      ["label", label().describe("Names the group for screen readers.")],
      ["options", options()],
      ["multiple", optional(z.boolean(), "Default: false, one pressed at a time.")],
    ],
  },
  TagsInput: {
    fields: [
      ["label", label()],
      ["defaultValue", optional(z.array(z.string()), "The tags it starts with.")],
      ["placeholder", text("Shown in the box while it is empty.")],
    ],
  },
  Checkbox: {
    fields: [
      ["label", label().describe("The text beside the box.")],
      ["defaultChecked", optional(z.boolean(), "Default: false")],
    ],
  },
  Switch: {
    fields: [
      ["label", label().describe("The text beside the switch.")],
      ["defaultChecked", optional(z.boolean(), "Default: false")],
    ],
  },
  Slider: {
    fields: [
      ["label", label()],
      ["min", number("Default: 0")],
      ["max", number("Default: 100")],
      ["step", number("Default: 1")],
      ["defaultValue", number("Default: min")],
    ],
  },
  Progress: {
    fields: [
      ["label", label()],
      ["value", z.number().describe("How much is done, from 0 to max.")],
      ["max", number("Default: 100")],
    ],
  },
  DatePicker: {
    fields: [
      ["label", label()],
      ["placeholder", text("Shown in the box while it is empty.")],
    ],
  },
  Tabs: {
    fields: [["tabs", z.array(z.string()).describe("The tab labels, one per panel.")]],
    panels: true,
  },
  Accordion: {
    fields: [["titles", z.array(z.string()).describe("The item titles, one per panel.")]],
    panels: true,
  },
} satisfies Record<string, SimpleForm>;

export function simpleFormOf(name: string): SimpleForm | undefined {
  return Object.hasOwn(SIMPLE_FORMS, name)
    ? (SIMPLE_FORMS as Record<string, SimpleForm>)[name]
    : undefined;
}

/**
 * Left out of the library. Overlays and toasts open over the page, not inside
 * an answer, and need a trigger or a toaster the host owns; the app-shell
 * layouts and the in-place editors arrange or edit the app's own data, which
 * an answer does not have.
 */
// ponytail: a Simple form for any of these when a model needs one.
export const NOT_GENERATIVE = new Set([
  "Dialog",
  "Drawer",
  "Popover",
  "Tooltip",
  "Menu",
  "Toast",
  "Splitter",
  "Carousel",
  "SortableList",
  "Toolbar",
  "Pagination",
  "Editable",
  "AngleSlider",
  "VectorPad",
]);
