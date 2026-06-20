import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import Button from "./fixtures/ButtonFixture.svelte";

afterEach(cleanup);

describe("Button (Svelte)", () => {
  it("carries scope/part and the recipe defaults", () => {
    render(Button, { props: { label: "Save" } });
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn.getAttribute("data-scope")).toBe("button");
    expect(btn.getAttribute("data-part")).toBe("root");
    expect(btn.getAttribute("data-variant")).toBe("primary");
    expect(btn.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    render(Button, { props: { variant: "destructive", size: "lg", label: "Delete" } });
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn.getAttribute("data-variant")).toBe("destructive");
    expect(btn.getAttribute("data-size")).toBe("lg");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(Button, { props: { label: "Bare" } });
    const btn = screen.getByRole("button", { name: "Bare" });
    expect(btn.getAttribute("style")).toBeNull();
    expect(btn.className).toBe("");
  });

  it("defaults type to button but lets the consumer override", () => {
    const { unmount } = render(Button, { props: { label: "One" } });
    expect(screen.getByRole("button", { name: "One" }).getAttribute("type")).toBe("button");
    unmount();
    render(Button, { props: { type: "submit", label: "Two" } });
    expect(screen.getByRole("button", { name: "Two" }).getAttribute("type")).toBe("submit");
  });

  it("forwards native props and events", async () => {
    const onclick = vi.fn();
    render(Button, { props: { onclick, ariaLabel: "icon", label: "×" } });
    const btn = screen.getByRole("button", { name: "icon" });
    await fireEvent.click(btn);
    expect(onclick).toHaveBeenCalledOnce();
  });
});
