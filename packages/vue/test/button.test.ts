import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { Button } from "../src/button.js";

afterEach(cleanup);

describe("Button (Vue)", () => {
  it("carries scope/part and the recipe defaults", () => {
    render(Button, { slots: { default: () => "Save" } });
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn.getAttribute("data-scope")).toBe("button");
    expect(btn.getAttribute("data-part")).toBe("root");
    expect(btn.getAttribute("data-variant")).toBe("primary");
    expect(btn.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    render(Button, {
      props: { variant: "destructive", size: "lg" },
      slots: { default: () => "Delete" },
    });
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn.getAttribute("data-variant")).toBe("destructive");
    expect(btn.getAttribute("data-size")).toBe("lg");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(Button, { slots: { default: () => "Bare" } });
    const btn = screen.getByRole("button", { name: "Bare" });
    expect(btn.getAttribute("style")).toBeNull();
    expect(btn.className).toBe("");
  });

  it("defaults type to button but lets the consumer override", async () => {
    const { rerender } = render(Button, {
      props: { type: undefined },
      slots: { default: () => "One" },
    });
    expect(screen.getByRole("button", { name: "One" }).getAttribute("type")).toBe("button");
    await rerender({ type: "submit" });
    expect(screen.getByRole("button", { name: "One" }).getAttribute("type")).toBe("submit");
  });

  it("forwards native attrs and events", async () => {
    const onClick = vi.fn();
    render(Button, {
      attrs: { onClick, "aria-label": "icon" },
      slots: { default: () => "×" },
    });
    const btn = screen.getByRole("button", { name: "icon" });
    await fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
