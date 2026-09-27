import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Index, Show, createSignal } from "solid-js";
import {
  DatePicker,
  parseDate,
  type DatePickerSize,
  type DatePickerValueChangeDetails,
  type DateValue,
} from "../src/index.jsx";

afterEach(cleanup);

describe("DatePicker surface (Solid)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { DatePicker: ArkDatePicker } = await import("@ark-ui/solid");
    for (const part of Object.keys(ArkDatePicker)) {
      expect(
        DatePicker[part as keyof typeof DatePicker],
        `DatePicker.${part} missing`,
      ).toBeDefined();
    }
  });
});

function Demo(props: {
  size?: DatePickerSize;
  selectionMode?: "single" | "range";
  locale?: string;
  value?: DateValue[];
  onValueChange?: (details: DatePickerValueChangeDetails) => void;
}) {
  return (
    <DatePicker.Root
      size={props.size}
      selectionMode={props.selectionMode}
      locale={props.locale}
      value={props.value}
      onValueChange={props.onValueChange}
      defaultFocusedValue={parseDate("2024-05-15")}
      class="due"
      data-testid="root"
    >
      <DatePicker.Label>Due date</DatePicker.Label>
      <DatePicker.Control>
        <DatePicker.Input index={0} />
        <Show when={props.selectionMode === "range"}>
          <DatePicker.Input index={1} />
        </Show>
        <DatePicker.Trigger aria-label="Open calendar">▾</DatePicker.Trigger>
      </DatePicker.Control>
      <DatePicker.Positioner>
        <DatePicker.Content data-testid="content">
          <DatePicker.View view="day">
            <DatePicker.Context>
              {(datePicker) => (
                <>
                  <DatePicker.ViewControl>
                    <DatePicker.PrevTrigger>‹</DatePicker.PrevTrigger>
                    <DatePicker.ViewTrigger>
                      <DatePicker.RangeText />
                    </DatePicker.ViewTrigger>
                    <DatePicker.NextTrigger>›</DatePicker.NextTrigger>
                  </DatePicker.ViewControl>
                  <DatePicker.Table>
                    <DatePicker.TableBody>
                      <Index each={datePicker().weeks}>
                        {(week) => (
                          <DatePicker.TableRow>
                            <Index each={week()}>
                              {(day) => (
                                <DatePicker.TableCell value={day()}>
                                  <DatePicker.TableCellTrigger>
                                    {day().day}
                                  </DatePicker.TableCellTrigger>
                                </DatePicker.TableCell>
                              )}
                            </Index>
                          </DatePicker.TableRow>
                        )}
                      </Index>
                    </DatePicker.TableBody>
                  </DatePicker.Table>
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </DatePicker.Root>
  );
}

const trigger = () => screen.getByRole("button", { name: "Open calendar" });
const content = () => screen.getByTestId("content");
const input = (index = 0) => screen.getAllByRole("textbox")[index] as HTMLInputElement;
/** The ISO dates of the last value a spy was handed. */
const lastPicked = (spy: ReturnType<typeof vi.fn>) =>
  (spy.mock.lastCall![0] as DatePickerValueChangeDetails).value.map(String);
/** A day of the focused month, by its date. */
const day = (iso: string) =>
  content().querySelector<HTMLElement>(`[data-part="table-cell-trigger"][data-value="${iso}"]`)!;

describe("DatePicker (Solid)", () => {
  it("puts the recipe's size on the root and the content, md by default", () => {
    render(() => <Demo />);
    expect(screen.getByTestId("root").getAttribute("data-size")).toBe("md");
    expect(content().getAttribute("data-size")).toBe("md");
    cleanup();
    render(() => <Demo size="lg" />);
    expect(screen.getByTestId("root").getAttribute("data-size")).toBe("lg");
    expect(content().getAttribute("data-size")).toBe("lg");
  });

  it("forwards native props to the root", () => {
    render(() => <Demo />);
    expect(screen.getByTestId("root").classList.contains("due")).toBe(true);
  });

  it("is closed by default: the calendar is hidden and the trigger says so", () => {
    render(() => <Demo />);
    expect(content().hidden).toBe(true);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().getAttribute("aria-controls")).toBe(content().id);
  });

  it("opens on the trigger and shows the focused month as a grid", async () => {
    const user = userEvent.setup();
    render(() => <Demo />);
    await user.click(trigger());
    await waitFor(() => expect(content().hidden).toBe(false));
    expect(content().getAttribute("data-state")).toBe("open");
    expect(screen.getByRole("grid")).toBeTruthy();
    expect(content().querySelector('[data-part="range-text"]')?.textContent).toBe("May 2024");
  });

  it("picks a day: the input shows it, onValueChange reports it and the calendar closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(() => <Demo onValueChange={onValueChange} />);
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
    render(() => <Demo locale="de-DE" onValueChange={onValueChange} />);
    expect(input().placeholder).toBe("dd.mm.yyyy");
    await user.click(input());
    await user.paste("03.06.2024");
    await user.keyboard("{Enter}");
    expect(lastPicked(onValueChange)).toEqual(["2024-06-03"]);
    expect(onValueChange.mock.lastCall![0].valueAsString).toEqual(["03.06.2024"]);
  });

  it("picks a range: two clicks, one band between the ends", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(() => <Demo selectionMode="range" onValueChange={onValueChange} />);
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

  it("follows a controlled value", async () => {
    const user = userEvent.setup();
    const [value, setValue] = createSignal<DateValue[]>([parseDate("2024-05-02")]);
    render(() => (
      <>
        <Demo value={value()} onValueChange={(details) => setValue(details.value)} />
        <button type="button" onClick={() => setValue([parseDate("2024-05-30")])}>
          End of month
        </button>
      </>
    ));
    await waitFor(() => expect(input().value).toBe("05/02/2024"));
    await user.click(screen.getByRole("button", { name: "End of month" }));
    await waitFor(() => expect(input().value).toBe("05/30/2024"));
    expect(day("2024-05-30").hasAttribute("data-selected")).toBe(true);
  });
});
