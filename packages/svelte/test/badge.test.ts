import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import Badge from "./fixtures/BadgeFixture.svelte";

afterEach(cleanup);

/** The fixture wraps the primitive, so the badge root is found by its part. */
function root(container: HTMLElement): Element {
  return container.querySelector('[data-scope="badge"][data-part="root"]')!;
}

describe("Badge (Svelte)", () => {
  it("carries scope/part and the recipe defaults", () => {
    const { container } = render(Badge);
    expect(root(container).tagName).toBe("SPAN");
    expect(root(container).getAttribute("data-variant")).toBe("neutral");
    expect(root(container).getAttribute("data-size")).toBe("md");
    expect(root(container).textContent?.trim()).toBe("New");
  });

  it("maps variant/size props to data-attributes", () => {
    const { container } = render(Badge, { props: { variant: "success", size: "sm" } });
    expect(root(container).getAttribute("data-variant")).toBe("success");
    expect(root(container).getAttribute("data-size")).toBe("sm");
  });

  it("renders the dot part only when asked, hidden from assistive tech", () => {
    const plain = render(Badge);
    expect(plain.container.querySelector('[data-part="dot"]')).toBeNull();
    cleanup();

    const { container } = render(Badge, { props: { dot: true } });
    const dot = container.querySelector('[data-scope="badge"][data-part="dot"]')!;
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(dot.parentElement).toBe(root(container));
  });

  it("never bakes in styling (no inline style, no class)", () => {
    const { container } = render(Badge, { props: { dot: true } });
    expect(root(container).getAttribute("style")).toBeNull();
    expect(root(container).className).toBe("");
  });

  it("forwards native props", () => {
    render(Badge, { props: { class: "mine", "data-testid": "badge", title: "3 unread" } });
    const badge = screen.getByTestId("badge");
    expect(badge.className).toBe("mine");
    expect(badge.getAttribute("title")).toBe("3 unread");
  });
});
