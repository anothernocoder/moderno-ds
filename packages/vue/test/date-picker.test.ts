import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref, type PropType, type UnwrapRef } from "vue";
import type { UseDatePickerContext } from "@ark-ui/vue";
import {
  DatePicker,
  parseDate,
  type DatePickerSize,
  type DatePickerValueChangeDetails,
  type DateValue,
} from "../src/index.js";

afterEach(cleanup);

describe("DatePicker surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { DatePicker: ArkDatePicker } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkDatePicker)) {
      expect(
        DatePicker[part as keyof typeof DatePicker],
        `DatePicker.${part} missing`,
      ).toBeDefined();
    }
  });
});

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<DatePickerSize>, default: undefined },
    selectionMode: { type: String as PropType<"single" | "range">, default: undefined },
    locale: { type: String, default: undefined },
    modelValue: { type: Array as PropType<DateValue[]>, default: undefined },
    onValueChange: {
      type: Function as PropType<(details: DatePickerValueChangeDetails) => void>,
      default: undefined,
    },
    "onUpdate:modelValue": {
      type: Function as PropType<(value: DateValue[]) => void>,
      default: undefined,
    },
  },
  setup(props) {
    return () =>
      h(
        DatePicker.Root,
        {
          size: props.size,
          selectionMode: props.selectionMode,
          locale: props.locale,
          modelValue: props.modelValue,
          onValueChange: props.onValueChange,
          "onUpdate:modelValue": props["onUpdate:modelValue"],
          defaultFocusedValue: parseDate("2024-05-15"),
          class: "due",
          "data-testid": "root",
        },
        () => [
          h(DatePicker.Label, {}, () => "Due date"),
          h(DatePicker.Control, {}, () => [
            h(DatePicker.Input, { index: 0 }),
            props.selectionMode === "range" ? h(DatePicker.Input, { index: 1 }) : null,
            h(DatePicker.Trigger, { "aria-label": "Open calendar" }, () => "▾"),
          ]),
          h(DatePicker.Positioner, {}, () =>
            h(DatePicker.Content, { "data-testid": "content" }, () =>
              h(DatePicker.View, { view: "day" }, () =>
                h(DatePicker.Context, null, {
                  default: (datePicker: UnwrapRef<UseDatePickerContext>) => [
                    h(DatePicker.ViewControl, {}, () => [
                      h(DatePicker.PrevTrigger, {}, () => "‹"),
                      h(DatePicker.ViewTrigger, {}, () => h(DatePicker.RangeText)),
                      h(DatePicker.NextTrigger, {}, () => "›"),
                    ]),
                    h(DatePicker.Table, {}, () =>
                      h(DatePicker.TableBody, {}, () =>
                        datePicker.weeks.map((week, i) =>
                          h(DatePicker.TableRow, { key: i }, () =>
                            week.map((day, j) =>
                              h(DatePicker.TableCell, { key: j, value: day }, () =>
                                h(DatePicker.TableCellTrigger, {}, () => String(day.day)),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                }),
              ),
            ),
          ),
        ],
      );
  },
});

const trigger = () => screen.getByRole("button", { name: "Open calendar" });
const content = () => screen.getByTestId("content");
const input = (index = 0) => screen.getAllByRole("textbox")[index] as HTMLInputElement;
/** The ISO dates of the last value a spy was handed. */
const lastPicked = (spy: ReturnType<typeof vi.fn>) =>
  (spy.mock.lastCall![0] as DatePickerValueChangeDetails).value.map(String);
/** A day of the focused month, by its date. */
const day = (iso: string) =>
  content().querySelector<HTMLElement>(`[data-part="table-cell-trigger"][data-value="${iso}"]`)!;

describe("DatePicker (Vue)", () => {
  it("puts the recipe's size on the root and the content, md by default", () => {
    render(Demo);
    expect(screen.getByTestId("root").getAttribute("data-size")).toBe("md");
    expect(content().getAttribute("data-size")).toBe("md");
    cleanup();
    render(Demo, { props: { size: "lg" } });
    expect(screen.getByTestId("root").getAttribute("data-size")).toBe("lg");
    expect(content().getAttribute("data-size")).toBe("lg");
  });

  it("forwards native props to the root", () => {
    render(Demo);
    expect(screen.getByTestId("root").classList.contains("due")).toBe(true);
  });

  it("is closed by default: the calendar is hidden and the trigger says so", () => {
    render(Demo);
    expect(content().hidden).toBe(true);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().getAttribute("aria-controls")).toBe(content().id);
  });

  it("opens on the trigger and shows the focused month as a grid", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(trigger());
    await waitFor(() => expect(content().hidden).toBe(false));
    expect(content().getAttribute("data-state")).toBe("open");
    expect(screen.getByRole("grid")).toBeTruthy();
    expect(content().querySelector('[data-part="range-text"]')?.textContent).toBe("May 2024");
  });

  it("picks a day: the input shows it, onValueChange reports it and the calendar closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });
    await user.click(trigger());
    await user.click(day("2024-05-20"));
    expect(lastPicked(onValueChange)).toEqual(["2024-05-20"]);
    await waitFor(() => expect(input().value).toBe("05/20/2024"));
    await waitFor(() => expect(content().hidden).toBe(true));
    expect(day("2024-05-20").hasAttribute("data-selected")).toBe(true);
  });

  it("formats and parses dates for its locale", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { locale: "de-DE", onValueChange } });
    expect(input().placeholder).toBe("dd.mm.yyyy");
    // One paste, not key by key: jsdom puts the caret back at the start each
    // time Vue writes the input's value, which would reverse typed text.
    await user.click(input());
    await user.paste("03.06.2024");
    await user.keyboard("{Enter}");
    expect(lastPicked(onValueChange)).toEqual(["2024-06-03"]);
    expect(onValueChange.mock.lastCall![0].valueAsString).toEqual(["03.06.2024"]);
  });

  it("picks a range: two clicks, one band between the ends", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { selectionMode: "range", onValueChange } });
    await user.click(trigger());
    await user.click(day("2024-05-06"));
    await user.click(day("2024-05-10"));
    expect(lastPicked(onValueChange)).toEqual(["2024-05-06", "2024-05-10"]);
    await waitFor(() =>
      expect([input(0).value, input(1).value]).toEqual(["05/06/2024", "05/10/2024"]),
    );
    expect(day("2024-05-06").hasAttribute("data-range-start")).toBe(true);
    expect(day("2024-05-08").hasAttribute("data-in-range")).toBe(true);
    expect(day("2024-05-10").hasAttribute("data-range-end")).toBe(true);
  });

  it("follows a controlled value (v-model)", async () => {
    const user = userEvent.setup();
    const value = ref<DateValue[]>([parseDate("2024-05-02")]);
    const Controlled = defineComponent({
      setup() {
        return () => [
          h(Demo, {
            modelValue: value.value,
            "onUpdate:modelValue": (next: DateValue[]) => (value.value = next),
          }),
          h(
            "button",
            { type: "button", onClick: () => (value.value = [parseDate("2024-05-30")]) },
            "End of month",
          ),
        ];
      },
    });
    render(Controlled);
    await waitFor(() => expect(input().value).toBe("05/02/2024"));
    await user.click(screen.getByRole("button", { name: "End of month" }));
    await waitFor(() => expect(input().value).toBe("05/30/2024"));
    expect(day("2024-05-30").hasAttribute("data-selected")).toBe(true);
    await user.click(trigger());
    await user.click(day("2024-05-21"));
    expect(value.value.map(String)).toEqual(["2024-05-21"]);
  });
});
