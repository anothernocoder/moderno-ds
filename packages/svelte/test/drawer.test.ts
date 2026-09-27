import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Drawer } from "../src/index.js";
import Demo from "./fixtures/DrawerFixture.svelte";
import ProviderDemo from "./fixtures/DrawerProviderFixture.svelte";

afterEach(cleanup);

describe("Drawer surface (Svelte)", () => {
  it("exposes every part of Ark's Dialog, not a hand-maintained subset", async () => {
    const { Dialog: ArkDialog } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkDialog)) {
      expect(Drawer[part as keyof typeof Drawer], `Drawer.${part} missing`).toBeDefined();
    }
  });
});

const trigger = () => screen.getByRole("button", { name: "Filters" });
const content = () => screen.getByTestId("filters");
const positioner = () => screen.getByTestId("positioner");

describe("Drawer (Svelte)", () => {
  it("renders every part under the drawer scope, keeping Ark's part names", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(trigger());
    await screen.findByRole("dialog");
    expect(document.querySelector('[data-scope="dialog"]')).toBeNull();
    const parts = [...document.querySelectorAll('[data-scope="drawer"]')].map((el) =>
      el.getAttribute("data-part"),
    );
    expect(new Set(parts)).toEqual(
      new Set([
        "trigger",
        "backdrop",
        "positioner",
        "content",
        "title",
        "description",
        "close-trigger",
      ]),
    );
  });

  it("puts the recipe's placement on the positioner and content, right by default", () => {
    render(Demo);
    expect(positioner().getAttribute("data-placement")).toBe("right");
    expect(content().getAttribute("data-placement")).toBe("right");
    cleanup();
    render(Demo, { props: { placement: "bottom" } });
    expect(positioner().getAttribute("data-placement")).toBe("bottom");
    expect(content().getAttribute("data-placement")).toBe("bottom");
  });

  it("forwards native props to the content", () => {
    render(Demo);
    expect(content().classList.contains("filters")).toBe(true);
  });

  it("is closed by default: the content is hidden and the trigger says so", () => {
    render(Demo);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(content().hidden).toBe(true);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().getAttribute("aria-controls")).toBe(content().id);
  });

  it("opens on the trigger as a modal dialog labelled by its title and description", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(trigger());
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBe(content());
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("data-state")).toBe("open");
    expect(screen.getByTestId("backdrop").getAttribute("data-state")).toBe("open");
    const labelId = dialog.getAttribute("aria-labelledby")!;
    const descId = dialog.getAttribute("aria-describedby")!;
    expect(document.getElementById(labelId)?.textContent).toBe("Filters");
    expect(document.getElementById(descId)?.textContent).toBe("Narrow the list of orders.");
  });

  it("moves focus in on open and back to the trigger on close", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(trigger());
    await waitFor(() => expect(content().contains(document.activeElement)).toBe(true));
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger()));
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(trigger());
    await waitFor(() => expect(content().contains(document.activeElement)).toBe(true));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("follows a bound open (bind:open) and reports every change", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(Demo, { props: { open: true, onOpenChange } });
    expect((await screen.findByRole("dialog")).getAttribute("data-state")).toBe("open");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onOpenChange).toHaveBeenCalledWith(expect.objectContaining({ open: false }));
  });

  it("takes the placement on a RootProvider driven by useDialog", () => {
    render(ProviderDemo);
    expect(positioner().getAttribute("data-placement")).toBe("left");
    expect(content().getAttribute("data-placement")).toBe("left");
  });
});
