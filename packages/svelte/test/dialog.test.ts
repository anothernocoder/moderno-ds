import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import Demo from "./fixtures/DialogDemo.svelte";

afterEach(cleanup);

describe("Dialog (Svelte)", () => {
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
