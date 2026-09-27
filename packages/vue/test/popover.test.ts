import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref, type PropType } from "vue";
import { Popover, type PopoverOpenChangeDetails, type PopoverSize } from "../src/index.js";

afterEach(cleanup);

describe("Popover surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Popover: ArkPopover } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkPopover)) {
      expect(Popover[part as keyof typeof Popover], `Popover.${part} missing`).toBeDefined();
    }
  });
});

const Demo = defineComponent({
  props: {
    size: { type: String as PropType<PopoverSize>, default: undefined },
    open: { type: Boolean, default: undefined },
    onOpenChange: {
      type: Function as PropType<(details: PopoverOpenChangeDetails) => void>,
      default: undefined,
    },
    "onUpdate:open": { type: Function as PropType<(open: boolean) => void>, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        Popover.Root,
        {
          size: props.size,
          open: props.open,
          onOpenChange: props.onOpenChange,
          "onUpdate:open": props["onUpdate:open"],
        },
        () => [
          h(Popover.Trigger, {}, () => "Share"),
          h(Popover.Positioner, {}, () =>
            h(Popover.Content, { class: "share", "data-testid": "share" }, () => [
              h(Popover.Arrow, {}, () => h(Popover.ArrowTip)),
              h(Popover.Title, {}, () => "Share this page"),
              h(Popover.Description, {}, () => "Anyone with the link can view it."),
              h(Popover.CloseTrigger, { "aria-label": "Close" }, () => "×"),
            ]),
          ),
        ],
      );
  },
});

const trigger = () => screen.getByRole("button", { name: "Share" });
const content = () => screen.getByTestId("share");

describe("Popover (Vue)", () => {
  it("is closed by default: the content is hidden and the trigger says so", () => {
    render(Demo);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(content().hidden).toBe(true);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().getAttribute("aria-controls")).toBe(content().id);
  });

  it("puts the recipe's size on the content, md by default", () => {
    render(Demo);
    expect(content().getAttribute("data-size")).toBe("md");
    cleanup();
    render(Demo, { props: { size: "sm" } });
    expect(content().getAttribute("data-size")).toBe("sm");
  });

  it("forwards native props to the content", () => {
    render(Demo);
    expect(content().classList.contains("share")).toBe(true);
  });

  it("opens on the trigger as a dialog labelled by its title and description", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(trigger());
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBe(content());
    expect(dialog.getAttribute("data-state")).toBe("open");
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    const labelId = dialog.getAttribute("aria-labelledby")!;
    const descId = dialog.getAttribute("aria-describedby")!;
    expect(document.getElementById(labelId)?.textContent).toBe("Share this page");
    expect(document.getElementById(descId)?.textContent).toBe("Anyone with the link can view it.");
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
    await screen.findByRole("dialog");
    // Ark listens for Escape once focus has moved into the content.
    await waitFor(() => expect(content().contains(document.activeElement)).toBe(true));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("follows a controlled open (v-model:open) and reports every change", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const Controlled = defineComponent({
      setup() {
        const open = ref(true);
        return () =>
          h(Demo, {
            open: open.value,
            onOpenChange,
            "onUpdate:open": (value: boolean) => (open.value = value),
          });
      },
    });
    render(Controlled);
    expect((await screen.findByRole("dialog")).getAttribute("data-state")).toBe("open");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onOpenChange).toHaveBeenCalledWith(expect.objectContaining({ open: false }));
  });
});
