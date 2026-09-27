import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";
import { Toast, Toaster, createToaster } from "../src/index.js";
import Demo from "./fixtures/ToastFixture.svelte";

afterEach(cleanup);

describe("Toast surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Toast: ArkToast } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkToast)) {
      expect(Toast[part as keyof typeof Toast], `Toast.${part} missing`).toBeDefined();
    }
  });

  it("hands out Ark's Toaster and createToaster", async () => {
    const ark = await import("@ark-ui/svelte");
    expect(Toaster).toBe(ark.Toaster);
    expect(createToaster).toBe(ark.createToaster);
  });
});

/** Calls the toaster the way an app does, outside the component, then lets Svelte render. */
async function show(fn: () => unknown) {
  fn();
  await tick();
}

const toastEl = () => screen.getByTestId("toast");

describe("Toast (Svelte)", () => {
  it("renders the toaster as a polite live region named after its placement", () => {
    render(Demo, { props: { toaster: createToaster({ placement: "top-end" }) } });
    const region = screen.getByRole("region");
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.getAttribute("aria-label")).toBe("Notifications, top-end (alt+T)");
    expect(region.getAttribute("data-placement")).toBe("top-end");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows a created toast as a status labelled by its title and description", async () => {
    const toaster = createToaster({ placement: "bottom-end" });
    render(Demo, { props: { toaster } });
    await show(() => toaster.create({ title: "Saved", description: "Your changes are live." }));
    const status = await screen.findByRole("status");
    expect(status).toBe(toastEl());
    expect(status.getAttribute("data-placement")).toBe("bottom-end");
    const labelId = status.getAttribute("aria-labelledby")!;
    const descId = status.getAttribute("aria-describedby")!;
    expect(document.getElementById(labelId)?.textContent).toBe("Saved");
    expect(document.getElementById(descId)?.textContent).toBe("Your changes are live.");
  });

  it("puts the recipe's size on the root, md by default", async () => {
    const toaster = createToaster({});
    render(Demo, { props: { toaster } });
    await show(() => toaster.create({ title: "Saved" }));
    expect((await screen.findByTestId("toast")).getAttribute("data-size")).toBe("md");
    cleanup();
    const small = createToaster({});
    render(Demo, { props: { toaster: small, size: "sm" } });
    await show(() => small.create({ title: "Saved" }));
    expect((await screen.findByTestId("toast")).getAttribute("data-size")).toBe("sm");
  });

  it("marks each status with Ark's data-type", async () => {
    const toaster = createToaster({ max: 5 });
    render(Demo, { props: { toaster } });
    await show(() => {
      toaster.success({ title: "Done" });
      toaster.error({ title: "Failed" });
      toaster.warning({ title: "Careful" });
      toaster.info({ title: "Heads up" });
    });
    await waitFor(() => expect(screen.getAllByRole("status")).toHaveLength(4));
    const types = screen.getAllByRole("status").map((el) => el.getAttribute("data-type"));
    expect(types.sort()).toEqual(["error", "info", "success", "warning"]);
  });

  it("forwards native props to the root", async () => {
    const toaster = createToaster({});
    render(Demo, { props: { toaster } });
    await show(() => toaster.create({ title: "Saved" }));
    await screen.findByRole("status");
    expect(toastEl().classList.contains("note")).toBe(true);
  });

  it("runs the action and dismisses the toast", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const toaster = createToaster({ removeDelay: 0 });
    render(Demo, { props: { toaster } });
    await show(() => toaster.create({ title: "Archived", action: { label: "Undo", onClick } }));
    await user.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });

  it("dismisses from the close trigger", async () => {
    const user = userEvent.setup();
    const toaster = createToaster({ removeDelay: 0 });
    render(Demo, { props: { toaster } });
    await show(() => toaster.create({ title: "Saved" }));
    await user.click(await screen.findByRole("button", { name: "Dismiss" }));
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });

  it("dismisses from the toaster, by id", async () => {
    const toaster = createToaster({ removeDelay: 0 });
    render(Demo, { props: { toaster } });
    let id = "";
    await show(() => {
      id = toaster.create({ title: "Uploading…", type: "loading" });
    });
    expect((await screen.findByRole("status")).getAttribute("data-type")).toBe("loading");
    await show(() => toaster.dismiss(id));
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });

  it("goes away on its own once its duration is up", async () => {
    const toaster = createToaster({ removeDelay: 0 });
    render(Demo, { props: { toaster } });
    await show(() => toaster.create({ title: "Saved", duration: 50 }));
    await screen.findByRole("status");
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });
});
