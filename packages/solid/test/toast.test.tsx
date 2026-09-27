import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { Show } from "solid-js";
import {
  Toast,
  Toaster,
  createToaster,
  type CreateToasterReturn,
  type ToastSize,
} from "../src/index.jsx";

afterEach(cleanup);

describe("Toast surface (Solid)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Toast: ArkToast } = await import("@ark-ui/solid");
    for (const part of Object.keys(ArkToast)) {
      expect(Toast[part as keyof typeof Toast], `Toast.${part} missing`).toBeDefined();
    }
  });

  it("hands out Ark's Toaster and createToaster", async () => {
    const ark = await import("@ark-ui/solid");
    expect(Toaster).toBe(ark.Toaster);
    expect(createToaster).toBe(ark.createToaster);
  });
});

function Demo(props: {
  toaster: CreateToasterReturn;
  size?: ToastSize;
  rootRef?: (el: HTMLDivElement) => void;
}) {
  return (
    <Toaster toaster={props.toaster}>
      {(toast) => (
        <Toast.Root size={props.size} class="note" data-testid="toast" ref={props.rootRef}>
          <Toast.Title>{toast().title}</Toast.Title>
          <Toast.Description>{toast().description}</Toast.Description>
          <Show when={toast().action}>
            {(action) => <Toast.ActionTrigger>{action().label}</Toast.ActionTrigger>}
          </Show>
          <Toast.CloseTrigger aria-label="Dismiss">×</Toast.CloseTrigger>
        </Toast.Root>
      )}
    </Toaster>
  );
}

const toastEl = () => screen.getByTestId("toast");

describe("Toast", () => {
  it("renders the toaster as a polite live region named after its placement", () => {
    render(() => <Demo toaster={createToaster({ placement: "top-end" })} />);
    const region = screen.getByRole("region");
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.getAttribute("aria-label")).toBe("Notifications, top-end (alt+T)");
    expect(region.getAttribute("data-placement")).toBe("top-end");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows a created toast as a status labelled by its title and description", async () => {
    const toaster = createToaster({ placement: "bottom-end" });
    render(() => <Demo toaster={toaster} />);
    toaster.create({ title: "Saved", description: "Your changes are live." });
    const status = await screen.findByRole("status");
    expect(status).toBe(toastEl());
    expect(status.getAttribute("data-placement")).toBe("bottom-end");
    const labelId = status.getAttribute("aria-labelledby")!;
    const descId = status.getAttribute("aria-describedby")!;
    expect(document.getElementById(labelId)?.textContent).toBe("Saved");
    expect(document.getElementById(descId)?.textContent).toBe("Your changes are live.");
  });

  it("puts the recipe's size on the root, md by default", async () => {
    const toaster = createToaster({ placement: "bottom" });
    render(() => <Demo toaster={toaster} />);
    toaster.create({ title: "Saved" });
    expect((await screen.findByTestId("toast")).getAttribute("data-size")).toBe("md");
    cleanup();
    const small = createToaster({ placement: "bottom" });
    render(() => <Demo toaster={small} size="sm" />);
    small.create({ title: "Saved" });
    expect((await screen.findByTestId("toast")).getAttribute("data-size")).toBe("sm");
  });

  it("marks each status with Ark's data-type", async () => {
    const toaster = createToaster({ placement: "bottom", max: 5 });
    render(() => <Demo toaster={toaster} />);
    toaster.success({ title: "Done" });
    toaster.error({ title: "Failed" });
    toaster.warning({ title: "Careful" });
    toaster.info({ title: "Heads up" });
    await waitFor(() => expect(screen.getAllByRole("status")).toHaveLength(4));
    const types = screen.getAllByRole("status").map((el) => el.getAttribute("data-type"));
    expect(types.sort()).toEqual(["error", "info", "success", "warning"]);
  });

  it("forwards native props and the ref to the root", async () => {
    const toaster = createToaster({ placement: "bottom" });
    let element: HTMLDivElement | undefined;
    render(() => <Demo toaster={toaster} rootRef={(el) => (element = el)} />);
    toaster.create({ title: "Saved" });
    await screen.findByRole("status");
    expect(toastEl().classList.contains("note")).toBe(true);
    expect(element).toBe(toastEl());
  });

  it("runs the action and dismisses the toast", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const toaster = createToaster({ placement: "bottom", removeDelay: 0 });
    render(() => <Demo toaster={toaster} />);
    toaster.create({ title: "Archived", action: { label: "Undo", onClick } });
    await user.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });

  it("dismisses from the close trigger", async () => {
    const user = userEvent.setup();
    const toaster = createToaster({ placement: "bottom", removeDelay: 0 });
    render(() => <Demo toaster={toaster} />);
    toaster.create({ title: "Saved" });
    await user.click(await screen.findByRole("button", { name: "Dismiss" }));
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });

  it("dismisses from the toaster, by id", async () => {
    const toaster = createToaster({ placement: "bottom", removeDelay: 0 });
    render(() => <Demo toaster={toaster} />);
    const id = toaster.create({ title: "Uploading…", type: "loading" });
    expect((await screen.findByRole("status")).getAttribute("data-type")).toBe("loading");
    toaster.dismiss(id);
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });

  it("goes away on its own once its duration is up", async () => {
    const toaster = createToaster({ placement: "bottom", removeDelay: 0 });
    render(() => <Demo toaster={toaster} />);
    toaster.create({ title: "Saved", duration: 50 });
    await screen.findByRole("status");
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });
});
