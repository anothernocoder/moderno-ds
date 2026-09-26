import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@solidjs/testing-library";
import { Badge } from "../src/badge.jsx";

afterEach(cleanup);

describe("Badge (Solid)", () => {
  it("carries scope/part and the recipe defaults", () => {
    render(() => <Badge>New</Badge>);
    const root = screen.getByText("New");
    expect(root.tagName).toBe("SPAN");
    expect(root.getAttribute("data-scope")).toBe("badge");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("neutral");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("maps variant/size props to data-attributes", () => {
    render(() => (
      <Badge variant="success" size="sm">
        Paid
      </Badge>
    ));
    const root = screen.getByText("Paid");
    expect(root.getAttribute("data-variant")).toBe("success");
    expect(root.getAttribute("data-size")).toBe("sm");
  });

  it("renders the dot part only when asked, hidden from assistive tech", () => {
    const plain = render(() => <Badge>Live</Badge>);
    expect(plain.container.querySelector('[data-part="dot"]')).toBeNull();
    cleanup();

    const { container } = render(() => <Badge dot>Live</Badge>);
    const dot = container.querySelector('[data-scope="badge"][data-part="dot"]')!;
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(dot.parentElement).toBe(screen.getByText("Live"));
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(() => <Badge dot>New</Badge>);
    const root = screen.getByText("New");
    expect(root.getAttribute("style")).toBeNull();
    expect(root.className).toBe("");
  });

  it("forwards native props", () => {
    render(() => (
      <Badge class="mine" data-testid="badge" title="3 unread">
        3
      </Badge>
    ));
    const root = screen.getByTestId("badge");
    expect(root.className).toBe("mine");
    expect(root.getAttribute("title")).toBe("3 unread");
  });
});
