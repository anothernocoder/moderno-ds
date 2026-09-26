import { afterEach, describe, expect, it } from "vitest";
import { createCommentVNode, defineComponent, h } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { Indicator } from "../src/indicator.js";

afterEach(cleanup);

describe("Indicator (Vue)", () => {
  it("carries scope/part and the recipe defaults, with no pulse", () => {
    const { container } = render(Indicator);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-scope")).toBe("indicator");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("neutral");
    expect(root.getAttribute("data-size")).toBe("md");
    expect(root.hasAttribute("data-pulse")).toBe(false);
  });

  it("maps variant/size/pulse props to data-attributes", () => {
    const { container } = render(Indicator, {
      props: { variant: "success", size: "sm", pulse: true },
    });
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-variant")).toBe("success");
    expect(root.getAttribute("data-size")).toBe("sm");
    expect(root.getAttribute("data-pulse")).toBe("");
  });

  it("always renders the dot, hidden from assistive tech", () => {
    const { container } = render(Indicator);
    const dot = container.querySelector('[data-scope="indicator"][data-part="dot"]')!;
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector('[data-part="label"]')).toBeNull();
  });

  it("renders the default slot as the label part, after the dot", () => {
    const { container } = render(Indicator, {
      props: { variant: "success" },
      slots: { default: () => "Online" },
    });
    const label = screen.getByText("Online");
    expect(label.getAttribute("data-part")).toBe("label");
    expect(label.previousElementSibling?.getAttribute("data-part")).toBe("dot");
    expect(label.parentElement).toBe(container.firstElementChild);
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(Indicator, { props: { pulse: true } });
    const root = container.firstElementChild!;
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native attrs", () => {
    const { container } = render(Indicator, {
      attrs: { class: "mine", "aria-label": "Online" },
    });
    const root = container.firstElementChild!;
    expect(root.className).toBe("mine");
    expect(root.getAttribute("aria-label")).toBe("Online");
  });

  it("names a bare dot through role=img, so a screen reader reads its status", () => {
    const { container } = render(Indicator, {
      props: { variant: "error" },
      attrs: { "aria-label": "Offline" },
    });
    expect(screen.getByRole("img", { name: "Offline" })).toBe(container.firstElementChild);
  });

  it("gives no role to a labelled indicator or an unnamed dot", () => {
    const labelled = render(Indicator, {
      attrs: { "aria-label": "Status" },
      slots: { default: () => "Online" },
    });
    expect(labelled.container.firstElementChild!.hasAttribute("role")).toBe(false);
    cleanup();
    const bare = render(Indicator);
    expect(bare.container.firstElementChild!.hasAttribute("role")).toBe(false);
  });

  it("lets a consumer role win", () => {
    render(Indicator, { attrs: { role: "status", "aria-label": "Offline" } });
    expect(screen.getByRole("status", { name: "Offline" })).toBeTruthy();
  });

  it("renders no label part when the slot holds only a comment or whitespace", () => {
    const ShowLabel = defineComponent({
      props: { show: Boolean },
      setup: (props) => () =>
        h(Indicator, null, {
          default: () => (props.show ? ["Online"] : [createCommentVNode("v-if")]),
        }),
    });
    const hidden = render(ShowLabel, { props: { show: false } });
    expect(hidden.container.querySelector('[data-part="label"]')).toBeNull();
    cleanup();
    const blank = render(Indicator, { slots: { default: () => "  " } });
    expect(blank.container.querySelector('[data-part="label"]')).toBeNull();
    cleanup();
    render(ShowLabel, { props: { show: true } });
    expect(screen.getByText("Online").getAttribute("data-part")).toBe("label");
  });
});
