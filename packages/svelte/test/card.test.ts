import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import CardFixture from "./fixtures/CardFixture.svelte";

afterEach(cleanup);

describe("Card (Svelte)", () => {
  it("carries scope/part and the recipe defaults on the root", () => {
    render(CardFixture);
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-scope")).toBe("card");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("outline");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("gives every part the card scope and its own data-part", () => {
    render(CardFixture);
    const parts = [
      ["header", screen.getByTestId("header")],
      ["title", screen.getByRole("heading", { name: "Monthly report" })],
      ["description", screen.getByText("Revenue across every channel.")],
      ["content", screen.getByTestId("content")],
      ["footer", screen.getByTestId("footer")],
    ] as const;
    for (const [part, el] of parts) {
      expect(el.getAttribute("data-scope")).toBe("card");
      expect(el.getAttribute("data-part")).toBe(part);
    }
  });

  it("maps variant/size props to data-attributes", () => {
    render(CardFixture, { props: { variant: "muted", size: "lg" } });
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-variant")).toBe("muted");
    expect(root.getAttribute("data-size")).toBe("lg");
  });

  it("renders the title as a heading, so a card is a section not a page", () => {
    render(CardFixture);
    expect(screen.getByRole("heading", { name: "Monthly report" }).tagName).toBe("H3");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(CardFixture);
    for (const id of ["root", "header", "content", "footer"]) {
      const el = screen.getByTestId(id);
      expect(el.getAttribute("style")).toBeNull();
      expect(el.className).toBe("");
    }
  });

  it("forwards native props and events on every part", async () => {
    const onclick = vi.fn();
    render(CardFixture, { props: { ariaLabel: "report", onclick } });
    await fireEvent.click(screen.getByLabelText("report"));
    expect(onclick).toHaveBeenCalledOnce();
  });
});
