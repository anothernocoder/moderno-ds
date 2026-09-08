import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import { defineComponent, h, type PropType } from "vue";
import { Alert } from "../src/alert.js";
import type { AlertSize, AlertVariant } from "../src/alert.js";

afterEach(cleanup);

const Sample = defineComponent({
  props: {
    variant: { type: String as PropType<AlertVariant>, default: undefined },
    size: { type: String as PropType<AlertSize>, default: undefined },
  },
  setup(props) {
    return () =>
      h(Alert.Root, { variant: props.variant, size: props.size }, () => [
        h(Alert.Icon, {}, () => "i"),
        h(Alert.Content, {}, () => [
          h(Alert.Title, {}, () => "Trial ending"),
          h(Alert.Description, {}, () => "Three days left."),
          h(Alert.Action, {}, () => h("button", { type: "button" }, "Manage plan")),
        ]),
      ]);
  },
});

describe("Alert (Vue)", () => {
  it("carries scope/part and the recipe defaults", () => {
    render(Sample);
    const root = screen.getByRole("status");
    expect(root.getAttribute("data-scope")).toBe("alert");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("info");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    render(Sample, { props: { variant: "warning", size: "sm" } });
    const root = screen.getByRole("alert");
    expect(root.getAttribute("data-variant")).toBe("warning");
    expect(root.getAttribute("data-size")).toBe("sm");
  });

  it("renders every part of the anatomy under the alert scope", () => {
    const { container } = render(Sample);
    const parts = [...container.querySelectorAll('[data-scope="alert"]')].map((el) =>
      el.getAttribute("data-part"),
    );
    expect(parts).toEqual(["root", "icon", "content", "title", "description", "action"]);
  });

  it("announces urgently only for the urgent statuses", () => {
    const { unmount } = render(Sample, { props: { variant: "error" } });
    expect(screen.getByRole("alert").textContent).toContain("Trial ending");
    unmount();
    render(Sample, { props: { variant: "success" } });
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("lets the consumer override the role", () => {
    render(
      defineComponent({
        setup() {
          return () =>
            h(
              Alert.Root,
              { variant: "error", role: "region", "aria-label": "billing" },
              () => "Payment failed",
            );
        },
      }),
    );
    expect(screen.getByRole("region", { name: "billing" }).getAttribute("data-variant")).toBe(
      "error",
    );
  });

  it("hides the decorative icon from assistive tech", () => {
    const { container } = render(Sample);
    expect(container.querySelector('[data-part="icon"]')!.getAttribute("aria-hidden")).toBe("true");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(Sample);
    const root = screen.getByRole("status");
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });
});
