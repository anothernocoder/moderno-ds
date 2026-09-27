import { expect } from "vitest";
import type { AgentComponent } from "../../src/agent-manifest.ts";

/** DatePicker's recipe prop, size and Ark parts. */
export default function expectDatePicker(datePicker: AgentComponent): void {
  expect(datePicker.scope).toBe("date-picker");
  expect(datePicker.props.map((p) => p.name)).toEqual(["size"]);
  expect(datePicker.variants).toEqual({ size: ["sm", "md", "lg"] });
  expect(datePicker.parts.map((p) => p.name)).toEqual([
    "root",
    "label",
    "control",
    "input",
    "trigger",
    "clear-trigger",
    "value-text",
    "positioner",
    "content",
    "view",
    "view-control",
    "prev-trigger",
    "view-trigger",
    "range-text",
    "next-trigger",
    "table",
    "table-head",
    "table-header",
    "table-body",
    "table-row",
    "table-cell",
    "table-cell-trigger",
    "month-select",
    "year-select",
    "preset-trigger",
  ]);
  // Ark's own Root props (value, selectionMode, locale, …) live under node_modules.
  expect(datePicker.propsComplete).toBe(false);
}
