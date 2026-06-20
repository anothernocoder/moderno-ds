import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/vue";
import { defineComponent, h } from "vue";
import { Dialog, Portal } from "../src/dialog.js";

afterEach(cleanup);

const Demo = defineComponent({
  setup() {
    return () =>
      h(Dialog.Root, {}, () => [
        h(Dialog.Trigger, {}, () => "Open dialog"),
        h(Portal, {}, () => [
          h(Dialog.Backdrop),
          h(Dialog.Positioner, {}, () =>
            h(Dialog.Content, {}, () => [
              h(Dialog.Title, {}, () => "Delete account"),
              h(Dialog.Description, {}, () => "This action cannot be undone."),
              h(Dialog.CloseTrigger, {}, () => "Cancel"),
            ]),
          ),
        ]),
      ]);
  },
});

describe("Dialog (Vue)", () => {
  it("is closed by default — no accessible dialog, trigger present", () => {
    render(Demo);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Open dialog" })).toBeTruthy();
  });

  it("opens on trigger and exposes a labelled modal dialog", async () => {
    render(Demo);
    await fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-scope")).toBe("dialog");
    expect(dialog.getAttribute("data-part")).toBe("content");
    const labelId = dialog.getAttribute("aria-labelledby");
    const descId = dialog.getAttribute("aria-describedby");
    expect(labelId && document.getElementById(labelId)?.textContent).toBe("Delete account");
    expect(descId && document.getElementById(descId)?.textContent).toBe(
      "This action cannot be undone.",
    );
  });

  it("traps focus inside the dialog once open", async () => {
    render(Demo);
    await fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it("closes via the close trigger", async () => {
    render(Demo);
    await fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    await screen.findByRole("dialog");
    await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
