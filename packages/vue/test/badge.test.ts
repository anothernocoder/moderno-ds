import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import { Badge } from "../src/badge.js";

afterEach(cleanup);

describe("Badge (Vue)", () => {
  it("carries scope/part and the recipe defaults", () => {
    render(Badge, { slots: { default: () => "New" } });
    const root = screen.getByText("New");
    expect(root.tagName).toBe("SPAN");
    expect(root.getAttribute("data-scope")).toBe("badge");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("neutral");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    render(Badge, {
      props: { variant: "success", size: "sm" },
      slots: { default: () => "Paid" },
    });
    const root = screen.getByText("Paid");
    expect(root.getAttribute("data-variant")).toBe("success");
    expect(root.getAttribute("data-size")).toBe("sm");
  });

  it("renders the dot part only when asked, hidden from assistive tech", () => {
    const plain = render(Badge, { slots: { default: () => "Live" } });
    expect(plain.container.querySelector('[data-part="dot"]')).toBeNull();
    cleanup();

    const { container } = render(Badge, {
      props: { dot: true },
      slots: { default: () => "Live" },
    });
    const dot = container.querySelector('[data-scope="badge"][data-part="dot"]')!;
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(dot.parentElement).toBe(screen.getByText("Live"));
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(Badge, { props: { dot: true }, slots: { default: () => "New" } });
    const root = screen.getByText("New");
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native attrs", () => {
    render(Badge, {
      attrs: { class: "mine", "data-testid": "badge", title: "3 unread" },
      slots: { default: () => "3" },
    });
    const root = screen.getByTestId("badge");
    expect(root.className).toBe("mine");
    expect(root.getAttribute("title")).toBe("3 unread");
  });
});
