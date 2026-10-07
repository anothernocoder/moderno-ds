// @vitest-environment jsdom
/**
 * Every component the library exposes renders through `<GenUI>` with no
 * error, and the interactive ones work: an input takes typing, a select lists
 * its options, a button changes the value. OpenUI hides a component that
 * throws, so only this test sees a broken one.
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import type { ComponentsManifest, ContractManifest } from "@moderno-ui/lint-core";
import contract from "@moderno-ui/css/moderno.agent.json" with { type: "json" };
import reactManifest from "@moderno-ui/react/moderno.agent.json" with { type: "json" };
import { afterEach, describe, expect, it, vi } from "vitest";
import { GenUI, type ActionEvent } from "../../src/react.ts";
import { fromManifest } from "../../src/server.ts";

afterEach(cleanup);

const libraryNames = fromManifest(
  reactManifest as unknown as ComponentsManifest,
  contract as unknown as ContractManifest,
).map((component) => component.name);

interface Contract {
  program: string;
  /** Uses the rendered program the way a person would. */
  works?: (user: UserEvent, onAction: ReturnType<typeof vi.fn>) => Promise<void>;
}

const program = (...lines: string[]) => lines.join("\n");

/** A part of the first component of `scope` under `within`. */
const part = (scope: string, name: string, within: ParentNode = document) =>
  within.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!;

/** The smallest valid program per component, parts included in their root's. */
const CONTRACTS: Record<string, Contract> = {
  Badge: { program: program("root = Stack([b])", 'b = Badge("info", false, ["New"])') },
  Button: {
    program: program("root = Stack([b])", 'b = Button("primary", ["Save"])'),
    async works(user, onAction) {
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onAction).toHaveBeenCalledWith(
        expect.objectContaining({ humanFriendlyMessage: "Save" }),
      );
    },
  },
  Chip: {
    program: program("root = Stack([c])", 'c = Chip("outline", false, null, ["React"])'),
  },
  ColorPicker: { program: program("root = Stack([c])", "c = ColorPicker()") },
  Divider: { program: program("root = Stack([d])", 'd = Divider("horizontal")') },
  FileUpload: { program: program("root = Stack([f])", 'f = FileUpload(false, "Logo")') },
  Indicator: {
    program: program("root = Stack([i])", 'i = Indicator("success", false, ["Online"])'),
  },
  Skeleton: { program: program("root = Stack([s])", 's = Skeleton("text")') },
  Spinner: { program: program("root = Stack([s])", 's = Spinner("Loading")') },
  AreaChart: {
    program: program(
      "root = Stack([c])",
      'c = AreaChart(200, [{name: "Visits", points: [{x: 1, y: 2}, {x: 2, y: 5}]}], 320)',
    ),
  },
  BarChart: {
    program: program(
      "root = Stack([c])",
      'c = BarChart(["Mon", "Tue"], 200, [{name: "Sales", values: [3, 5]}], 320)',
    ),
  },
  BarList: {
    program: program("root = Stack([c])", 'c = BarList([{name: "Docs", value: 12}], 320)'),
  },
  DonutChart: {
    program: program("root = Stack([c])", 'c = DonutChart([{name: "Ads", value: 3}], 200, 200)'),
  },
  LineChart: {
    program: program(
      "root = Stack([c])",
      'c = LineChart(200, [{name: "Visits", points: [{x: 1, y: 2}, {x: 2, y: 5}]}], 320)',
    ),
  },
  ScatterChart: {
    program: program(
      "root = Stack([c])",
      "c = ScatterChart(200, [{points: [{x: 1, y: 2}, {x: 2, y: 5}]}], 320)",
    ),
  },
  SparkChart: {
    program: program("root = Stack([c])", "c = SparkChart([{x: 1, y: 2}, {x: 2, y: 5}])"),
  },
  Alert: {
    program: program(
      "root = Stack([a])",
      'a = Alert("warning", [icon, content, action])',
      'icon = AlertIcon(["!"])',
      "content = AlertContent([title, description])",
      'title = AlertTitle(["Payment failed"])',
      'description = AlertDescription(["Update your card."])',
      'action = AlertAction([Button("outline", ["Update"])])',
    ),
  },
  Callout: {
    program: program(
      "root = Stack([c])",
      'c = Callout("info", [icon, content])',
      'icon = CalloutIcon(["i"])',
      "content = CalloutContent([title, description])",
      'title = CalloutTitle(["Heads up"])',
      'description = CalloutDescription(["Prices change on Monday."])',
    ),
  },
  Card: {
    program: program(
      'root = Grid([card], 1, "2")',
      'card = Card("outline", [header, content, footer])',
      "header = CardHeader([title, description])",
      'title = CardTitle(["Order"])',
      'description = CardDescription(["3 items"])',
      'content = CardContent(["Total: $84.00"])',
      'footer = CardFooter([Button("primary", ["Pay"])])',
    ),
  },
  Avatar: {
    program: program(
      "root = Stack([a])",
      'a = Avatar("circle", [image, fallback])',
      "image = AvatarImage()",
      'fallback = AvatarFallback(["AL"])',
    ),
    async works() {
      expect(screen.getByText("AL")).toBeTruthy();
    },
  },
  Toggle: {
    program: program(
      "root = Stack([t])",
      't = Toggle("ghost", [ToggleIndicator(["★"]), "Favorite"])',
    ),
    async works(user) {
      const toggle = screen.getByRole("button", { name: /Favorite/ });
      await user.click(toggle);
      expect(toggle.getAttribute("aria-pressed")).toBe("true");
    },
  },
  Field: {
    program: program(
      "root = Stack([f])",
      'f = Field("Email", "you@example.com", "We never share it.", "email")',
    ),
    async works(user) {
      const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Email" });
      await user.type(input, "ada@example.com");
      expect(input.value).toBe("ada@example.com");
      expect(input.type).toBe("email");
      expect(screen.getByText("We never share it.")).toBeTruthy();
    },
  },
  NumberInput: {
    program: program("root = Stack([n])", 'n = NumberInput("Guests", 1, 10, 1, 2)'),
    async works(user) {
      const input = screen.getByRole<HTMLInputElement>("spinbutton", { name: "Guests" });
      expect(input.value).toBe("2");
      await user.click(part("number-input", "increment-trigger"));
      await waitFor(() => expect(input.value).toBe("3"));
      await user.clear(input);
      await user.type(input, "7");
      expect(input.value).toBe("7");
    },
  },
  PinInput: {
    program: program("root = Stack([p])", 'p = PinInput("Code", 4)'),
    async works(user) {
      const boxes = screen.getAllByRole<HTMLInputElement>("textbox");
      expect(boxes).toHaveLength(4);
      await user.click(boxes[0]!);
      await user.keyboard("1234");
      expect(boxes.map((box) => box.value).join("")).toBe("1234");
    },
  },
  Select: {
    program: program(
      "root = Stack([s])",
      's = Select("Size", ["Small", {label: "Large", value: "lg"}], "Pick one")',
    ),
    async works(user) {
      await user.click(screen.getByRole("combobox", { name: "Size" }));
      const options = await screen.findAllByRole("option");
      expect(options.map((option) => option.textContent)).toEqual(["Small✓", "Large✓"]);
      await user.click(options[1]!);
      expect(screen.getByRole("combobox", { name: "Size" }).textContent).toContain("Large");
    },
  },
  Combobox: {
    program: program(
      "root = Stack([c])",
      'c = Combobox("Country", ["Chile", "Colombia", "Peru"], "Search")',
    ),
    async works(user) {
      await user.type(screen.getByRole("combobox", { name: "Country" }), "Co");
      const options = await screen.findAllByRole("option");
      expect(options.map((option) => option.textContent)).toEqual(["Colombia✓"]);
    },
  },
  RadioGroup: {
    program: program(
      "root = Stack([r])",
      'r = RadioGroup("Shipping", ["Standard", "Express"], "Standard")',
    ),
    async works(user) {
      const express = screen.getByRole<HTMLInputElement>("radio", { name: "Express" });
      expect(screen.getByRole<HTMLInputElement>("radio", { name: "Standard" }).checked).toBe(true);
      await user.click(screen.getByText("Express"));
      expect(express.checked).toBe(true);
    },
  },
  SegmentedControl: {
    program: program("root = Stack([s])", 's = SegmentedControl("Scale", ["Fit", "Fill"])'),
    async works(user) {
      expect(screen.getByRole<HTMLInputElement>("radio", { name: "Fit" }).checked).toBe(true);
      await user.click(screen.getByText("Fill"));
      expect(screen.getByRole<HTMLInputElement>("radio", { name: "Fill" }).checked).toBe(true);
    },
  },
  ToggleGroup: {
    program: program("root = Stack([t])", 't = ToggleGroup("Align", ["Left", "Right"])'),
    async works(user) {
      const right = screen.getByRole("radio", { name: "Right" });
      await user.click(right);
      expect(right.getAttribute("aria-checked")).toBe("true");
    },
  },
  TagsInput: {
    program: program("root = Stack([t])", 't = TagsInput("Topics", ["design"], "Add a topic")'),
    async works(user) {
      expect(screen.getByText("design")).toBeTruthy();
      await user.type(screen.getByPlaceholderText("Add a topic"), "code{Enter}");
      expect(screen.getByText("code")).toBeTruthy();
    },
  },
  Checkbox: {
    program: program("root = Stack([c])", 'c = Checkbox("Email me updates")'),
    async works(user) {
      const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name: "Email me updates" });
      await user.click(screen.getByText("Email me updates"));
      expect(checkbox.checked).toBe(true);
    },
  },
  Switch: {
    program: program("root = Stack([s])", 's = Switch("Notifications", true)'),
    async works(user) {
      const toggle = screen.getByRole<HTMLInputElement>("switch", { name: "Notifications" });
      expect(toggle.checked).toBe(true);
      await user.click(screen.getByText("Notifications"));
      expect(toggle.checked).toBe(false);
    },
  },
  Slider: {
    program: program("root = Stack([s])", 's = Slider("Volume", 0, 100, 10, 50)'),
    async works(user) {
      // Ark hides a thumb until it has measured it, and jsdom measures nothing.
      const thumb = screen.getByRole("slider", { hidden: true });
      expect(thumb.getAttribute("aria-valuenow")).toBe("50");
      thumb.focus();
      await user.keyboard("{ArrowRight}");
      expect(thumb.getAttribute("aria-valuenow")).toBe("60");
    },
  },
  Progress: {
    program: program("root = Stack([p])", 'p = Progress("Upload", 40)'),
    async works() {
      expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("40");
    },
  },
  DatePicker: {
    program: program("root = Stack([d])", 'd = DatePicker("Check-in", "Pick a date")'),
    async works(user) {
      await user.click(screen.getByRole("button", { name: "Open calendar" }));
      expect((await screen.findAllByRole("gridcell")).length).toBeGreaterThanOrEqual(28);
    },
  },
  Tabs: {
    program: program(
      "root = Stack([t])",
      't = Tabs(["Day", "Week"], ["Today: 3", "This week: 12"])',
    ),
    async works(user) {
      const shown = () =>
        [...document.querySelectorAll<HTMLElement>('[role="tabpanel"]')]
          .filter((panel) => !panel.hidden)
          .map((panel) => panel.textContent)
          .join();
      expect(shown()).toBe("Today: 3");
      await user.click(screen.getByRole("tab", { name: "Week" }));
      await waitFor(() => expect(shown()).toBe("This week: 12"));
    },
  },
  Accordion: {
    program: program(
      "root = Stack([a])",
      'a = Accordion(["Shipping"], [Badge("info", false, ["3 days"])])',
    ),
    async works(user) {
      const trigger = screen.getByRole("button", { name: /Shipping/ });
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      await user.click(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(screen.getByText("3 days")).toBeTruthy();
    },
  },
};

/** Renders a program and returns every error `<GenUI>` reported. */
function renderProgram(response: string, onAction = vi.fn()) {
  const errors: string[] = [];
  render(
    <GenUI
      response={response}
      onAction={onAction as (event: ActionEvent) => void}
      onError={(reported) =>
        errors.push(...reported.map((error) => `${error.source}/${error.code}: ${error.message}`))
      }
    />,
  );
  return errors;
}

describe("every library component", () => {
  it("has a contract program", () => {
    const programs = Object.values(CONTRACTS).map((contract) => contract.program);
    const uncovered = libraryNames.filter(
      (name) => !programs.some((code) => new RegExp(`\\b${name}\\(`).test(code)),
    );
    expect(uncovered).toEqual([]);
  });

  it.each(Object.entries(CONTRACTS))("%s renders with no error and works", async (_, contract) => {
    const onAction = vi.fn();
    const errors = renderProgram(contract.program, onAction);
    expect(errors).toEqual([]);
    await contract.works?.(userEvent.setup(), onAction);
    expect(errors).toEqual([]);
  });
});

describe("the chance card", () => {
  // The program a model wrote for a "chance" lottery ticket (issue #331).
  const chanceCard = program(
    "root = Stack([card])",
    'card = Card("outline", [header, content, footer])',
    'header = CardHeader([CardTitle(["Chance"]), CardDescription(["Pick a lottery, a number and your bet."])])',
    "content = CardContent([lottery, number, bet])",
    'lottery = Select("Lottery", ["Lotería de Bogotá", "Lotería de Medellín", "Lotería del Valle", "Lotería de Cundinamarca", "Lotería de Boyacá", "Lotería del Cauca"], "Pick a lottery")',
    'number = NumberInput("Number", 0, 9999, 1)',
    'bet = NumberInput("Bet (COP)", 1000, 100000, 1000, 5000)',
    'footer = CardFooter([Button("primary", ["Place bet"])])',
  );

  it("renders two working inputs and a Select with six options", async () => {
    const user = userEvent.setup();
    const errors = renderProgram(chanceCard);
    expect(errors).toEqual([]);

    const number = screen.getByRole<HTMLInputElement>("spinbutton", { name: "Number" });
    await user.type(number, "1234");
    expect(number.value).toBe("1234");

    const bet = screen.getByRole<HTMLInputElement>("spinbutton", { name: "Bet (COP)" });
    const betRoot = bet.closest<HTMLElement>('[data-scope="number-input"][data-part="root"]')!;
    await user.click(part("number-input", "increment-trigger", betRoot));
    await waitFor(() => expect(bet.getAttribute("aria-valuenow")).toBe("6000"));
    await user.click(part("number-input", "decrement-trigger", betRoot));
    await waitFor(() => expect(bet.getAttribute("aria-valuenow")).toBe("5000"));
    await user.click(part("number-input", "decrement-trigger", betRoot));
    await waitFor(() => expect(bet.getAttribute("aria-valuenow")).toBe("4000"));

    await user.click(screen.getByRole("combobox", { name: "Lottery" }));
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(6);
    await user.click(options[0]!);
    expect(screen.getByRole("combobox", { name: "Lottery" }).textContent).toContain(
      "Lotería de Bogotá",
    );
    expect(errors).toEqual([]);
  });

  it("renders every control at one size, so their heights match", () => {
    renderProgram(chanceCard);

    const sized = [...document.querySelectorAll<HTMLElement>("[data-size]")];
    const scopes = new Set(sized.map((element) => element.dataset.scope));
    expect([...scopes]).toEqual(expect.arrayContaining(["select", "number-input", "button"]));
    expect(new Set(sized.map((element) => element.dataset.size))).toEqual(new Set(["md"]));
  });

  it("sends the values of the form with its button's label", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderProgram(chanceCard, onAction);

    await user.type(screen.getByRole("spinbutton", { name: "Number" }), "4827");
    await user.click(screen.getByRole("combobox", { name: "Lottery" }));
    await user.click((await screen.findAllByRole("option"))[0]!);
    await user.click(screen.getByRole("button", { name: "Place bet" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    const message = (onAction.mock.calls[0]![0] as ActionEvent).humanFriendlyMessage;
    expect(message).toMatch(/^Place bet — /);
    expect(message.split(" — ")[1]!.split("; ").sort()).toEqual([
      "Bet (COP): 5000",
      "Lottery: Lotería de Bogotá",
      "Number: 4827",
    ]);
  });
});

describe("a Button with its own action", () => {
  it("sends its message as written, without the values", async () => {
    const onAction = vi.fn();
    renderProgram(
      program(
        "root = Stack([name, cancel])",
        'name = Field("Name")',
        'cancel = Button("outline", ["Cancel"], Action([@ToAssistant("Cancel it")]))',
      ),
      onAction,
    );

    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ humanFriendlyMessage: "Cancel it" }),
    );
  });
});

describe("a render error", () => {
  it("reaches onError as runtime/render-error", () => {
    const errors = renderProgram(
      program("root = Stack([s])", 's = Select("Size", ["Small"])'),
      vi.fn(),
    );
    expect(errors).toEqual([]);
    cleanup();

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    // A valid program, but min above max: Ark's slider throws while rendering.
    const broken = renderProgram(program("root = Stack([s])", 's = Slider("Volume", 10, 0)'));
    consoleError.mockRestore();
    expect(broken).toEqual([expect.stringMatching(/^runtime\/render-error: Component Slider/)]);
  });
});
