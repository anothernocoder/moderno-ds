import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Menu } from "../src/index.js";
import Demo from "./fixtures/MenuFixture.svelte";

afterEach(cleanup);

describe("Menu surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Menu: ArkMenu } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkMenu)) {
      expect(Menu[part as keyof typeof Menu], `Menu.${part} missing`).toBeDefined();
    }
  });
});

const trigger = () => screen.getByRole("button", { name: /Actions/ });

/** The size on the content that the opener labelled `label` controls, open or not. */
function menuSize(label: RegExp): string | null {
  const opener = [...document.querySelectorAll('[aria-haspopup="menu"]')].find((el) =>
    label.test(el.textContent ?? ""),
  );
  if (!opener) return null;
  return (
    document.getElementById(opener.getAttribute("aria-controls")!)?.getAttribute("data-size") ??
    null
  );
}

describe("Menu (Svelte)", () => {
  // Ark's Svelte Portal mounts its children after the first render.
  it("puts the size on the trigger and the content, md by default", async () => {
    const { unmount } = render(Demo);
    expect(trigger().getAttribute("data-size")).toBe("md");
    await waitFor(() => expect([menuSize(/Actions/), menuSize(/Share/)]).toEqual(["md", "md"]));
    unmount();

    render(Demo, { props: { size: "lg" } });
    expect(trigger().getAttribute("data-size")).toBe("lg");
    await waitFor(() => expect(menuSize(/Actions/)).toBe("lg"));
  });

  it("gives a submenu its parent's size unless it sets its own", async () => {
    const { unmount } = render(Demo, { props: { size: "sm" } });
    await waitFor(() => expect([menuSize(/Actions/), menuSize(/Share/)]).toEqual(["sm", "sm"]));
    unmount();

    render(Demo, { props: { size: "sm", submenuSize: "lg" } });
    await waitFor(() => expect([menuSize(/Actions/), menuSize(/Share/)]).toEqual(["sm", "lg"]));
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
