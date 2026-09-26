// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Chip } from "../src/chip.js";

afterEach(cleanup);

describe("Chip", () => {
  it("carries scope/part and the recipe defaults", () => {
    const { container } = render(<Chip>React</Chip>);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-scope")).toBe("chip");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("outline");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    const { container } = render(
      <Chip variant="solid" size="sm">
        React
      </Chip>,
    );
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-variant")).toBe("solid");
    expect(root.getAttribute("data-size")).toBe("sm");
  });

  it("wraps the children in the label part", () => {
    const { container } = render(<Chip>React</Chip>);
    const label = screen.getByText("React");
    expect(label.getAttribute("data-scope")).toBe("chip");
    expect(label.getAttribute("data-part")).toBe("label");
    expect(label.parentElement).toBe(container.firstElementChild);
  });

  it("has no remove button unless removable", () => {
    render(<Chip>React</Chip>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a labelled remove trigger that reports the press", () => {
    const onRemove = vi.fn();
    render(
      <Chip removable removeLabel="Remove React" onRemove={onRemove}>
        React
      </Chip>,
    );
    const trigger = screen.getByRole("button", { name: "Remove React" });
    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("data-scope")).toBe("chip");
    expect(trigger.getAttribute("data-part")).toBe("remove-trigger");
    fireEvent.click(trigger);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('names the remove trigger "Remove" by default', () => {
    render(<Chip removable>React</Chip>);
    expect(screen.getByRole("button", { name: "Remove" })).toBeTruthy();
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(<Chip removable>React</Chip>);
    const root = container.firstElementChild!;
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native props", () => {
    const { container } = render(
      <Chip className="mine" data-testid="chip">
        React
      </Chip>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toBe("mine");
    expect(root.getAttribute("data-testid")).toBe("chip");
  });
});
