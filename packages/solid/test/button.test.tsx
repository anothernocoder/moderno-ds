import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { Button } from "../src/button.jsx";

afterEach(cleanup);

describe("Button (Solid)", () => {
  it("carries scope/part and the recipe defaults", () => {
    render(() => <Button>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn.getAttribute("data-scope")).toBe("button");
    expect(btn.getAttribute("data-part")).toBe("root");
    expect(btn.getAttribute("data-variant")).toBe("primary");
    expect(btn.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    render(() => (
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    ));
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn.getAttribute("data-variant")).toBe("destructive");
    expect(btn.getAttribute("data-size")).toBe("lg");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(() => <Button>Bare</Button>);
    const btn = screen.getByRole("button", { name: "Bare" });
    expect(btn.getAttribute("style")).toBeNull();
    expect(btn.className).toBe("");
  });

  it("defaults type to button but lets the consumer override", () => {
    render(() => <Button type="submit">Submit</Button>);
    expect(screen.getByRole("button", { name: "Submit" }).getAttribute("type")).toBe("submit");
    cleanup();
    render(() => <Button>Plain</Button>);
    expect(screen.getByRole("button", { name: "Plain" }).getAttribute("type")).toBe("button");
  });

  it("forwards native props and events", () => {
    const onClick = vi.fn();
    render(() => (
      <Button onClick={onClick} aria-label="icon">
        ×
      </Button>
    ));
    const btn = screen.getByRole("button", { name: "icon" });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
