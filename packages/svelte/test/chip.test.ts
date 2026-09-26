import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import Chip from "./fixtures/ChipFixture.svelte";

afterEach(cleanup);

/** The fixture wraps the primitive, so the chip root is found by its part. */
function root(container: HTMLElement): Element {
  return container.querySelector('[data-scope="chip"][data-part="root"]')!;
}

describe("Chip (Svelte)", () => {
  it("carries scope/part and the recipe defaults", () => {
    const { container } = render(Chip);
    expect(root(container).getAttribute("data-variant")).toBe("outline");
    expect(root(container).getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    const { container } = render(Chip, { props: { variant: "solid", size: "sm" } });
    expect(root(container).getAttribute("data-variant")).toBe("solid");
    expect(root(container).getAttribute("data-size")).toBe("sm");
  });

  it("wraps the children in the label part", () => {
    const { container } = render(Chip);
    const label = screen.getByText("React");
    expect(label.getAttribute("data-scope")).toBe("chip");
    expect(label.getAttribute("data-part")).toBe("label");
    expect(label.parentElement).toBe(root(container));
  });

  it("has no remove button unless removable", () => {
    render(Chip);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a labelled remove trigger that reports the press", async () => {
    const onRemove = vi.fn();
    render(Chip, { props: { removable: true, removeLabel: "Remove React", onRemove } });
    const trigger = screen.getByRole("button", { name: "Remove React" });
    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("data-scope")).toBe("chip");
    expect(trigger.getAttribute("data-part")).toBe("remove-trigger");
    await fireEvent.click(trigger);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('names the remove trigger "Remove" by default', () => {
    render(Chip, { props: { removable: true } });
    expect(screen.getByRole("button", { name: "Remove" })).toBeTruthy();
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(Chip, { props: { removable: true } });
    expect(root(container).getAttribute("style")).toBeNull();
    expect(root(container).className).toBe("");
  });

  it("forwards native props", () => {
    const { container } = render(Chip, { props: { class: "mine", "data-testid": "chip" } });
    expect(root(container).className).toBe("mine");
    expect(root(container).getAttribute("data-testid")).toBe("chip");
  });
});
