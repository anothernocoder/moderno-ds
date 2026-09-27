import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, nextTick, ref, type PropType } from "vue";
import {
  Toast,
  Toaster,
  createToaster,
  type CreateToasterReturn,
  type ToastOptions,
  type ToastSize,
} from "../src/index.js";

afterEach(cleanup);

describe("Toast surface (Vue)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Toast: ArkToast } = await import("@ark-ui/vue");
    for (const part of Object.keys(ArkToast)) {
      expect(Toast[part as keyof typeof Toast], `Toast.${part} missing`).toBeDefined();
    }
  });

  it("hands out Ark's Toaster and createToaster", async () => {
    const ark = await import("@ark-ui/vue");
    expect(Toaster).toBe(ark.Toaster);
    expect(createToaster).toBe(ark.createToaster);
  });
});

/** The ref a test hands in, to check the root element reaches it. */
const rootRef = ref<unknown>(null);

const Demo = defineComponent({
  props: {
    toaster: { type: Object as PropType<CreateToasterReturn>, required: true },
    size: { type: String as PropType<ToastSize>, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        Toaster,
        { toaster: props.toaster },
        {
          default: (toast: ToastOptions) =>
            h(
              Toast.Root,
              { size: props.size, class: "note", "data-testid": "toast", ref: rootRef },
              () => [
                h(Toast.Title, null, () => toast.title),
                h(Toast.Description, null, () => toast.description),
                toast.action ? h(Toast.ActionTrigger, null, () => toast.action!.label) : null,
                h(Toast.CloseTrigger, { "aria-label": "Dismiss" }, () => "×"),
              ],
            ),
        },
      );
  },
});

/** Calls the toaster the way an app does, outside the component, then lets Vue render. */
async function show(fn: () => unknown) {
  fn();
  await nextTick();
}

const toastEl = () => screen.getByTestId("toast");

describe("Toast", () => {
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

  it("forwards native attributes and the ref to the root", async () => {
    const toaster = createToaster({});
    render(Demo, { props: { toaster } });
    await show(() => toaster.create({ title: "Saved" }));
    await screen.findByRole("status");
    expect(toastEl().classList.contains("note")).toBe(true);
    const exposed = rootRef.value as { $el?: Element } | Element | null;
    expect(exposed instanceof Element ? exposed : exposed?.$el).toBe(toastEl());
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
