// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Dialog, Portal } from "../src/dialog.js";

afterEach(cleanup);

function Demo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>Delete account</Dialog.Title>
            <Dialog.Description>This action cannot be undone.</Dialog.Description>
            <Dialog.CloseTrigger>Cancel</Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

describe("Dialog", () => {
  it("is closed by default — no accessible dialog, content marked closed", () => {
    render(<Demo />);
    // No element exposes the dialog role while closed (role queries skip hidden).
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Open dialog" })).toBeTruthy();
    // Ark keeps the content mounted but in the closed presence state.
    const content = document.querySelector('[data-scope="dialog"][data-part="content"]');
    expect(content).not.toBeNull();
    expect(content?.getAttribute("data-state")).toBe("closed");
  });

  it("opens on trigger and exposes a labelled modal dialog", async () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-scope")).toBe("dialog");
    expect(dialog.getAttribute("data-part")).toBe("content");
    // aria-labelledby / aria-describedby resolve to the Title/Description ids.
    const labelId = dialog.getAttribute("aria-labelledby");
    const descId = dialog.getAttribute("aria-describedby");
    expect(labelId && document.getElementById(labelId)?.textContent).toBe("Delete account");
    expect(descId && document.getElementById(descId)?.textContent).toBe(
      "This action cannot be undone.",
    );
  });

  it("traps focus inside the dialog once open", async () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it("closes via the close trigger", async () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
