// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Spinner } from "../src/spinner.js";

afterEach(cleanup);

describe("Spinner", () => {
  it("is a status whose text is the label, with the recipe default", () => {
    render(<Spinner />);
    const root = screen.getByRole("status");
    expect(root.textContent).toBe("Loading");
    expect(root.tagName).toBe("SPAN");
    expect(root.getAttribute("data-scope")).toBe("spinner");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("maps size to data-size", () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole("status").getAttribute("data-size")).toBe("lg");
  });

  it("renders the ring hidden from assistive tech and the label as text", () => {
    const { container } = render(<Spinner label="Saving changes" />);
    const root = screen.getByRole("status");
    const circle = container.querySelector('[data-scope="spinner"][data-part="circle"]')!;
    const label = container.querySelector('[data-scope="spinner"][data-part="label"]')!;
    expect(circle.getAttribute("aria-hidden")).toBe("true");
    expect(circle.parentElement).toBe(root);
    expect(label.textContent).toBe("Saving changes");
    expect(label.parentElement).toBe(root);
  });

  it("lets a consumer role win over the default", () => {
    render(<Spinner role="presentation" data-testid="spinner" />);
    expect(screen.getByTestId("spinner").getAttribute("role")).toBe("presentation");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(<Spinner />);
    const root = screen.getByRole("status");
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native props", () => {
    render(<Spinner className="mine" data-testid="spinner" title="Busy" />);
    const root = screen.getByTestId("spinner");
    expect(root.className).toBe("mine");
    expect(root.getAttribute("title")).toBe("Busy");
  });
});
