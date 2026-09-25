import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { Chip } from "../src/chip.js";

afterEach(cleanup);

const label = { default: () => "React" };

describe("Chip (Vue)", () => {
  it("carries scope/part and the recipe defaults", () => {
    const { container } = render(Chip, { slots: label });
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-scope")).toBe("chip");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("outline");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    const { container } = render(Chip, { props: { variant: "solid", size: "sm" }, slots: label });
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-variant")).toBe("solid");
    expect(root.getAttribute("data-size")).toBe("sm");
  });

  it("wraps the default slot in the label part", () => {
    const { container } = render(Chip, { slots: label });
    const text = screen.getByText("React");
    expect(text.getAttribute("data-scope")).toBe("chip");
    expect(text.getAttribute("data-part")).toBe("label");
    expect(text.parentElement).toBe(container.firstElementChild);
  });

  it("has no remove button unless removable", () => {
    render(Chip, { slots: label });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a labelled remove trigger that emits remove", async () => {
    const { emitted } = render(Chip, {
      props: { removable: true, removeLabel: "Remove React" },
      slots: label,
    });
    const trigger = screen.getByRole("button", { name: "Remove React" });
    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("data-scope")).toBe("chip");
    expect(trigger.getAttribute("data-part")).toBe("remove-trigger");
    await fireEvent.click(trigger);
    expect(emitted().remove).toHaveLength(1);
  });

  it('names the remove trigger "Remove" by default', () => {
    render(Chip, { props: { removable: true }, slots: label });
    expect(screen.getByRole("button", { name: "Remove" })).toBeTruthy();
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(Chip, { props: { removable: true }, slots: label });
    const root = container.firstElementChild!;
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native attrs", () => {
    const { container } = render(Chip, {
      attrs: { class: "mine", "data-testid": "chip" },
      slots: label,
    });
    const root = container.firstElementChild!;
    expect(root.className).toBe("mine");
    expect(root.getAttribute("data-testid")).toBe("chip");
  });
});
