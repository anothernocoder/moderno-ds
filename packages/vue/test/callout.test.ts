import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import { defineComponent, h, type PropType } from "vue";
import { Callout, type CalloutVariant } from "../src/callout.js";

afterEach(cleanup);

const Sample = defineComponent({
  props: {
    variant: { type: String as PropType<CalloutVariant>, default: undefined },
  },
  setup(props) {
    return () =>
      h(Callout.Root, { variant: props.variant }, () => [
        h(Callout.Icon, {}, () => "i"),
        h(Callout.Content, {}, () => [
          h(Callout.Title, {}, () => "Heads up"),
          h(Callout.Description, {}, () => "Exports run overnight."),
        ]),
      ]);
  },
});

describe("Callout (Vue)", () => {
  it("is a note carrying scope/part and the recipe default", () => {
    render(Sample);
    const root = screen.getByRole("note");
    expect(root.getAttribute("data-scope")).toBe("callout");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("info");
    expect(root.hasAttribute("data-size")).toBe(false);
  });

  it("maps variant to data-variant and stays a note for every status", () => {
    render(Sample, { props: { variant: "error" } });
    const root = screen.getByRole("note");
    expect(root.getAttribute("data-variant")).toBe("error");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders every part of the anatomy under the callout scope", () => {
    const { container } = render(Sample);
    const parts = [...container.querySelectorAll('[data-scope="callout"]')].map((el) =>
      el.getAttribute("data-part"),
    );
    expect(parts).toEqual(["root", "icon", "content", "title", "description"]);
  });

  it("lets the consumer override the role", () => {
    render(
      defineComponent({
        setup() {
          return () =>
            h(
              Callout.Root,
              { variant: "warning", role: "region", "aria-label": "migration" },
              () => "Breaking change",
            );
        },
      }),
    );
    expect(screen.getByRole("region", { name: "migration" }).getAttribute("data-variant")).toBe(
      "warning",
    );
  });

  it("hides the decorative icon from assistive tech", () => {
    const { container } = render(Sample);
    expect(container.querySelector('[data-part="icon"]')!.getAttribute("aria-hidden")).toBe("true");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(Sample);
    const root = screen.getByRole("note");
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native attributes to the parts", () => {
    const { container } = render(
      defineComponent({
        setup() {
          return () =>
            h(Callout.Root, { id: "export-note", "data-testid": "root" }, () =>
              h(Callout.Title, { class: "mine" }, () => "Heads up"),
            );
        },
      }),
    );
    expect(container.querySelector("#export-note")!.getAttribute("data-testid")).toBe("root");
    expect(container.querySelector('[data-part="title"]')!.className).toBe("mine");
  });
});
