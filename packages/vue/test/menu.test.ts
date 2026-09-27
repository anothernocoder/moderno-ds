import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref, type Component, type PropType } from "vue";
import { Menu, Portal, type MenuSize } from "../src/index.js";

// See field.test.ts — cast around Ark-Vue's heavy prop unions for the test tree.
const MenuRoot = Menu.Root as unknown as Component;
const CheckboxItem = Menu.CheckboxItem as unknown as Component;
const RadioItemGroup = Menu.RadioItemGroup as unknown as Component;

afterEach(cleanup);

describe("Menu surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Menu: ArkMenu } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkMenu)) {
      expect(Menu[part as keyof typeof Menu], `Menu.${part} missing`).toBeDefined();
    }
  });
});

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<MenuSize>, default: undefined },
    submenuSize: { type: String as PropType<MenuSize>, default: undefined },
    onSelect: { type: Function, default: undefined },
  },
  setup(props) {
    const wrap = ref(false);
    const sort = ref("name");
    return () =>
      h(MenuRoot, { size: props.size, onSelect: props.onSelect }, () => [
        h(Menu.Trigger, {}, () => ["Actions ", h(Menu.Indicator, {}, () => "▾")]),
        h(Portal, {}, () =>
          h(Menu.Positioner, {}, () =>
            h(Menu.Content, {}, () => [
              h(Menu.ItemGroup, {}, () => [
                h(Menu.ItemGroupLabel, {}, () => "File"),
                h(Menu.Item, { value: "new" }, () => "New file"),
                h(Menu.Item, { value: "rename", disabled: true }, () => "Rename"),
              ]),
              h(Menu.Separator),
              h(
                CheckboxItem,
                {
                  value: "wrap",
                  checked: wrap.value,
                  "onUpdate:checked": (checked: boolean) => (wrap.value = checked),
                },
                () => [
                  h(Menu.ItemText, {}, () => "Word wrap"),
                  h(Menu.ItemIndicator, {}, () => "✓"),
                ],
              ),
              h(
                RadioItemGroup,
                {
                  modelValue: sort.value,
                  "onUpdate:modelValue": (value: string) => (sort.value = value),
                },
                () => [
                  h(Menu.ItemGroupLabel, {}, () => "Sort by"),
                  ...["Name", "Date"].map((label) =>
                    h(Menu.RadioItem, { value: label.toLowerCase() }, () => [
                      h(Menu.ItemText, {}, () => label),
                      h(Menu.ItemIndicator, {}, () => "✓"),
                    ]),
                  ),
                ],
              ),
              h(MenuRoot, { size: props.submenuSize }, () => [
                h(Menu.TriggerItem, {}, () => "Share"),
                h(Portal, {}, () =>
                  h(Menu.Positioner, {}, () =>
                    h(Menu.Content, {}, () => h(Menu.Item, { value: "email" }, () => "Email")),
                  ),
                ),
              ]),
            ]),
          ),
        ),
      ]);
  },
});

const trigger = () => screen.getByRole("button", { name: /Actions/ });

/** The size on the content that the opener labelled `label` controls, open or not. */
function menuSize(label: RegExp): string | null {
  const opener = [...document.querySelectorAll('[aria-haspopup="menu"]')].find((el) =>
    label.test(el.textContent ?? ""),
  )!;
  return document.getElementById(opener.getAttribute("aria-controls")!)!.getAttribute("data-size");
}

describe("Menu (Vue)", () => {
  it("puts the size on the trigger and the content, md by default", () => {
    const { unmount } = render(Demo);
    expect(trigger().getAttribute("data-size")).toBe("md");
    expect([menuSize(/Actions/), menuSize(/Share/)]).toEqual(["md", "md"]);
    unmount();

    render(Demo, { props: { size: "lg" } });
    expect(trigger().getAttribute("data-size")).toBe("lg");
    expect(menuSize(/Actions/)).toBe("lg");
  });

  it("gives a submenu its parent's size unless it sets its own", () => {
    const { unmount } = render(Demo, { props: { size: "sm" } });
    expect([menuSize(/Actions/), menuSize(/Share/)]).toEqual(["sm", "sm"]);
    unmount();

    render(Demo, { props: { size: "sm", submenuSize: "lg" } });
    expect([menuSize(/Actions/), menuSize(/Share/)]).toEqual(["sm", "lg"]);
  });

  it("opens from the trigger as a menu labelled by it", async () => {
    const user = userEvent.setup();
    render(Demo);
    expect(trigger().getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");

    await user.click(trigger());
    const menu = await screen.findByRole("menu", { name: /Actions/ });
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("data-state")).toBe("open");
    expect(menu.getAttribute("data-state")).toBe("open");
    expect(screen.getByRole("group", { name: "File" })).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
  });

  it("reports the chosen item and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(Demo, { props: { onSelect } });
    await user.click(trigger());
    await user.click(await screen.findByRole("menuitem", { name: "New file" }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "new" }));
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("false"));
  });

  it("marks a disabled item and does not select it", async () => {
    // Disabled items take no pointer events; click through that on purpose.
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSelect = vi.fn();
    render(Demo, { props: { onSelect } });
    await user.click(trigger());
    const rename = await screen.findByRole("menuitem", { name: "Rename" });
    expect(rename.getAttribute("aria-disabled")).toBe("true");
    expect(rename.hasAttribute("data-disabled")).toBe(true);

    await user.click(rename);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("toggles a checkbox item and checks one radio item", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(trigger());
    const wrap = await screen.findByRole("menuitemcheckbox", { name: /Word wrap/ });
    expect(wrap.getAttribute("aria-checked")).toBe("false");
    await user.click(wrap);

    await user.click(trigger());
    await waitFor(() =>
      expect(
        screen.getByRole("menuitemcheckbox", { name: /Word wrap/ }).getAttribute("aria-checked"),
      ).toBe("true"),
    );

    await user.click(screen.getByRole("menuitemradio", { name: /Date/ }));
    await user.click(trigger());
    await waitFor(() =>
      expect(screen.getByRole("menuitemradio", { name: /Date/ }).getAttribute("data-state")).toBe(
        "checked",
      ),
    );
    expect(screen.getByRole("menuitemradio", { name: /Name/ }).getAttribute("data-state")).toBe(
      "unchecked",
    );
  });

  it("opens from the keyboard", async () => {
    const user = userEvent.setup();
    render(Demo);
    trigger().focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu", { name: /Actions/ });
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
  });

  it("names the submenu's trigger item after the Ark part", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(trigger());
    const share = await screen.findByRole("menuitem", { name: "Share" });
    await waitFor(() => expect(share.getAttribute("data-part")).toBe("trigger-item"));
    expect(share.getAttribute("aria-haspopup")).toBe("menu");
  });
});
