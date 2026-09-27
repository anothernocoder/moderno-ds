import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Menu, Portal, type MenuSize, type MenuSelectionDetails } from "../src/index.jsx";

afterEach(cleanup);

describe("Menu surface (Solid)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Menu: ArkMenu } = await import("@ark-ui/solid");
    for (const part of Object.keys(ArkMenu)) {
      expect(Menu[part as keyof typeof Menu], `Menu.${part} missing`).toBeDefined();
    }
  });
});

function Demo(props: {
  size?: MenuSize;
  submenuSize?: MenuSize;
  onSelect?: (details: MenuSelectionDetails) => void;
}) {
  const [wrap, setWrap] = createSignal(false);
  const [sort, setSort] = createSignal("name");
  return (
    <Menu.Root size={props.size} onSelect={props.onSelect}>
      <Menu.Trigger>
        Actions <Menu.Indicator>▾</Menu.Indicator>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>File</Menu.ItemGroupLabel>
              <Menu.Item value="new">New file</Menu.Item>
              <Menu.Item value="rename" disabled>
                Rename
              </Menu.Item>
            </Menu.ItemGroup>
            <Menu.Separator />
            <Menu.CheckboxItem value="wrap" checked={wrap()} onCheckedChange={setWrap}>
              <Menu.ItemText>Word wrap</Menu.ItemText>
              <Menu.ItemIndicator>✓</Menu.ItemIndicator>
            </Menu.CheckboxItem>
            <Menu.RadioItemGroup value={sort()} onValueChange={(details) => setSort(details.value)}>
              <Menu.ItemGroupLabel>Sort by</Menu.ItemGroupLabel>
              <Menu.RadioItem value="name">
                <Menu.ItemText>Name</Menu.ItemText>
                <Menu.ItemIndicator>✓</Menu.ItemIndicator>
              </Menu.RadioItem>
              <Menu.RadioItem value="date">
                <Menu.ItemText>Date</Menu.ItemText>
                <Menu.ItemIndicator>✓</Menu.ItemIndicator>
              </Menu.RadioItem>
            </Menu.RadioItemGroup>
            <Menu.Root size={props.submenuSize}>
              <Menu.TriggerItem>Share</Menu.TriggerItem>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="email">Email</Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

const trigger = () => screen.getByRole("button", { name: /Actions/ });
/** The size on the content that the opener labelled `label` controls, open or not. */
function menuSize(label: RegExp): string | null {
  const opener = [...document.querySelectorAll('[aria-haspopup="menu"]')].find((el) =>
    label.test(el.textContent ?? ""),
  )!;
  return document.getElementById(opener.getAttribute("aria-controls")!)!.getAttribute("data-size");
}

describe("Menu (Solid)", () => {
  it("puts the size on the trigger and the content, md by default", () => {
    const { unmount } = render(() => <Demo />);
    expect(trigger().getAttribute("data-size")).toBe("md");
    expect([menuSize(/Actions/), menuSize(/Share/)]).toEqual(["md", "md"]);
    unmount();

    render(() => <Demo size="lg" />);
    expect(trigger().getAttribute("data-size")).toBe("lg");
    expect(menuSize(/Actions/)).toBe("lg");
  });

  it("gives a submenu its parent's size unless it sets its own", () => {
    const { unmount } = render(() => <Demo size="sm" />);
    expect([menuSize(/Actions/), menuSize(/Share/)]).toEqual(["sm", "sm"]);
    unmount();

    render(() => <Demo size="sm" submenuSize="lg" />);
    expect([menuSize(/Actions/), menuSize(/Share/)]).toEqual(["sm", "lg"]);
  });

  it("opens from the trigger as a menu labelled by it", async () => {
    const user = userEvent.setup();
    render(() => <Demo />);
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
    render(() => <Demo onSelect={onSelect} />);
    await user.click(trigger());
    await user.click(await screen.findByRole("menuitem", { name: "New file" }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "new" }));
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("false"));
  });

  it("marks a disabled item and does not select it", async () => {
    // Disabled items take no pointer events; click through that on purpose.
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSelect = vi.fn();
    render(() => <Demo onSelect={onSelect} />);
    await user.click(trigger());
    const rename = await screen.findByRole("menuitem", { name: "Rename" });
    expect(rename.getAttribute("aria-disabled")).toBe("true");
    expect(rename.hasAttribute("data-disabled")).toBe(true);

    await user.click(rename);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("toggles a checkbox item and checks one radio item", async () => {
    const user = userEvent.setup();
    render(() => <Demo />);
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

    const date = screen.getByRole("menuitemradio", { name: /Date/ });
    await user.click(date);
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
    render(() => <Demo />);
    trigger().focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu", { name: /Actions/ });
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
  });

  it("names the submenu's trigger item after the Ark part", async () => {
    const user = userEvent.setup();
    render(() => <Demo />);
    await user.click(trigger());
    const share = await screen.findByRole("menuitem", { name: "Share" });
    await waitFor(() => expect(share.getAttribute("data-part")).toBe("trigger-item"));
    expect(share.getAttribute("aria-haspopup")).toBe("menu");
  });
});
