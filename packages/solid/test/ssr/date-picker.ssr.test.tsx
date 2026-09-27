import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { attrOf, partAttrs, partTags } from "../../../core/test/ssr-parts.ts";
import DatePickerSection from "../../playground/sections/date-picker.jsx";

/** Whether each `scope`/`part` tag carries the boolean attribute `name`. */
const flags = (html: string, part: string, name: string) =>
  partTags(html, "date-picker", part).map((tag) =>
    new RegExp(`\\s${name}(?:=""|[\\s>])`).test(tag),
  );

describe("DatePicker SSR (Solid)", () => {
  it("server-renders its playground section to a stable HTML string", async () => {
    const html = renderToString(() => <DatePickerSection open={false} />);
    // Solid disposes a server render on a timer, and zag runs the machine's
    // exit action then; wait for it, so a throw there fails this test.
    await new Promise((resolve) => setTimeout(resolve));
    // Ark's date-picker machine. The recipe lands on each root and on its
    // calendar; the trigger announces the grid it controls, closed; each label
    // points at its first input; the inputs format for their locale.
    expect(partAttrs(html, "date-picker", "root", "data-size")).toEqual(["md", "sm"]);
    expect(partAttrs(html, "date-picker", "content", "data-size")).toEqual(["md", "sm"]);
    const contentIds = partAttrs(html, "date-picker", "content", "id");
    expect(partAttrs(html, "date-picker", "trigger", "aria-controls")).toEqual([contentIds[0]]);
    expect(partAttrs(html, "date-picker", "trigger", "aria-haspopup")).toEqual(["grid"]);
    expect(partAttrs(html, "date-picker", "trigger", "aria-expanded")).toEqual(["false"]);
    expect(partAttrs(html, "date-picker", "content", "role")).toEqual([
      "application",
      "application",
    ]);
    expect(flags(html, "content", "hidden")).toEqual([true, true]);
    const inputIds = partAttrs(html, "date-picker", "input", "id");
    expect(partAttrs(html, "date-picker", "label", "for")).toEqual([inputIds[0], inputIds[1]]);
    expect(partAttrs(html, "date-picker", "input", "placeholder")).toEqual([
      "mm/dd/yyyy",
      "dd.mm.yyyy",
      "dd.mm.yyyy",
    ]);
    expect(partAttrs(html, "date-picker", "input", "value")).toEqual([
      undefined,
      "06.05.2024",
      "10.05.2024",
    ]);
    // The day view shows; the month view waits, hidden.
    expect(flags(html, "view", "hidden")).toEqual([false, true, false]);
    expect(partAttrs(html, "date-picker", "table", "role")).toEqual(["grid", "grid", "grid"]);
    // The range reaches the server as its two ends and the days between.
    const selected = partTags(html, "date-picker", "table-cell-trigger").filter((tag) =>
      /\sdata-selected(?:=""|[\s>])/.test(tag),
    );
    expect(selected.map((tag) => attrOf(tag, "data-value"))).toEqual(["2024-05-06", "2024-05-10"]);
    const inRange = partTags(html, "date-picker", "table-cell-trigger").filter((tag) =>
      /\sdata-in-range(?:=""|[\s>])/.test(tag),
    );
    expect(inRange).toHaveLength(5);
  });

  it("serialises the open state when the picker starts open", async () => {
    const html = renderToString(() => <DatePickerSection open />);
    await new Promise((resolve) => setTimeout(resolve));
    expect(partAttrs(html, "date-picker", "trigger", "aria-expanded")).toEqual(["true"]);
    expect(partAttrs(html, "date-picker", "content", "data-state")).toEqual(["open", "closed"]);
  });
});
