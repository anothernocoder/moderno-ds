import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, type PropType } from "vue";
import { Tabs, type TabsSize, type TabsVariant } from "../src/index.js";

afterEach(cleanup);

describe("Tabs surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Tabs: ArkTabs } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkTabs)) {
      if (part === "Root") continue; // wrapped below
      expect(Tabs[part as keyof typeof Tabs], `Tabs.${part} missing`).toBeDefined();
    }
  });
});

const TABS = [
  { value: "account", label: "Account" },
  { value: "password", label: "Password" },
  { value: "billing", label: "Billing", disabled: true },
  { value: "team", label: "Team" },
];

const Demo = defineComponent({
  props: {
    variant: { type: String as PropType<TabsVariant>, default: undefined },
    size: { type: String as PropType<TabsSize>, default: undefined },
    orientation: { type: String as PropType<"horizontal" | "vertical">, default: undefined },
    activationMode: { type: String as PropType<"automatic" | "manual">, default: undefined },
    defaultValue: { type: String, default: "account" },
    onValueChange: { type: Function, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        Tabs.Root,
        {
          variant: props.variant,
          size: props.size,
          orientation: props.orientation,
          activationMode: props.activationMode,
          defaultValue: props.defaultValue,
          class: "settings",
          onValueChange: props.onValueChange as (() => void) | undefined,
        },
        () => [
          h(Tabs.List, { "aria-label": "Settings" }, () => [
            ...TABS.map((tab) =>
              h(
                Tabs.Trigger,
                { key: tab.value, value: tab.value, disabled: tab.disabled },
                () => tab.label,
              ),
            ),
            h(Tabs.Indicator),
          ]),
          ...TABS.map((tab) =>
            h(Tabs.Content, { key: tab.value, value: tab.value }, () => `${tab.label} panel`),
          ),
        ],
      );
  },
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="tabs"][data-part="${name}"]`)!;
const triggers = () =>
  Array.from(
    document.querySelectorAll<HTMLButtonElement>(`[data-scope="tabs"][data-part="trigger"]`),
  );
const panels = () =>
  Array.from(document.querySelectorAll<HTMLElement>(`[data-scope="tabs"][data-part="content"]`));
const visiblePanels = () => panels().filter((panel) => !panel.hidden);

describe("Tabs", () => {
  it("applies the recipe to the root part, defaulting to line md", () => {
    render(Demo, { props: { variant: "enclosed" as const, size: "sm" as const } });
    expect(part("root").getAttribute("data-variant")).toBe("enclosed");
    expect(part("root").getAttribute("data-size")).toBe("sm");
    // Ark's own anatomy is intact around the recipe attributes.
    expect(part("list").contains(part("indicator"))).toBe(true);

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-variant")).toBe("line");
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("settings");
  });

  it("lays out horizontally by default and vertically on request", () => {
    render(Demo);
    expect(part("root").getAttribute("data-orientation")).toBe("horizontal");

    cleanup();
    render(Demo, { props: { orientation: "vertical" as const } });
    expect(part("root").getAttribute("data-orientation")).toBe("vertical");
    expect(part("list").getAttribute("aria-orientation")).toBe("vertical");
    expect(triggers()[0]!.getAttribute("data-orientation")).toBe("vertical");
  });

  it("is a tablist of native button tabs, each labelling its panel", () => {
    render(Demo);
    expect(screen.getByRole("tablist", { name: "Settings" })).toBe(part("list"));
    const account = screen.getByRole("tab", { name: "Account" }) as HTMLButtonElement;
    expect(account.tagName).toBe("BUTTON");
    expect(account.type).toBe("button");
    expect(account.getAttribute("aria-selected")).toBe("true");
    expect(account.hasAttribute("data-selected")).toBe(true);
    expect(screen.getByRole("tab", { name: "Password" }).getAttribute("aria-selected")).toBe(
      "false",
    );

    const panel = screen.getByRole("tabpanel", { name: "Account" });
    expect(panel.textContent).toBe("Account panel");
    expect(account.getAttribute("aria-controls")).toBe(panel.id);
    expect(visiblePanels()).toEqual([panel]);
  });

  it("selects a tab on click, shows its panel and reports the new value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });

    await user.click(screen.getByRole("tab", { name: "Password" }));

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: "password" }));
    expect(screen.getByRole("tab", { name: "Password" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    await waitFor(() =>
      expect(visiblePanels().map((panel) => panel.textContent)).toEqual(["Password panel"]),
    );
  });

  it("moves focus between tabs with the arrow keys, skipping a disabled tab", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { defaultValue: "password" } });
    // Tab lands on the selected tab; Ark moves focus on the next frame.
    await user.tab();
    expect(document.activeElement).toBe(triggers()[1]);

    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(document.activeElement).toBe(triggers()[3]));
    await user.keyboard("{Home}");
    await waitFor(() => expect(document.activeElement).toBe(triggers()[0]));
  });

  it("uses the up and down arrows when vertical", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { orientation: "vertical" as const } });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(triggers()[0]);
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toBe(triggers()[1]));
  });

  it("selects the focused tab with Enter", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { activationMode: "manual" as const } });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(document.activeElement).toBe(triggers()[1]));
    expect(triggers()[0]!.getAttribute("aria-selected")).toBe("true");

    await user.keyboard("{Enter}");
    expect(triggers()[1]!.getAttribute("aria-selected")).toBe("true");
  });

  it("marks a disabled tab natively and with data-disabled, and refuses to select it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });
    const billing = screen.getByRole("tab", { name: "Billing" }) as HTMLButtonElement;

    expect(billing.disabled).toBe(true);
    expect(billing.hasAttribute("data-disabled")).toBe(true);

    await user.click(billing);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(billing.getAttribute("aria-selected")).toBe("false");
  });
});
