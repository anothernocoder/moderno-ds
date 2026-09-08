import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { Card } from "../src/card.jsx";

afterEach(cleanup);

/** The full anatomy, so each test can assert one part of the same tree. */
function Sample(props: { variant?: "outline" | "muted" | "ghost"; size?: "sm" | "md" | "lg" }) {
  return (
    <Card.Root variant={props.variant} size={props.size} data-testid="root">
      <Card.Header data-testid="header">
        <Card.Title>Monthly report</Card.Title>
        <Card.Description>Revenue across every channel.</Card.Description>
      </Card.Header>
      <Card.Content data-testid="content">Up 12% on last month.</Card.Content>
      <Card.Footer data-testid="footer">Export</Card.Footer>
    </Card.Root>
  );
}

describe("Card (Solid)", () => {
  it("carries scope/part and the recipe defaults on the root", () => {
    render(() => <Sample />);
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-scope")).toBe("card");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("outline");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("gives every part the card scope and its own data-part", () => {
    render(() => <Sample />);
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
    render(() => <Sample variant="muted" size="lg" />);
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-variant")).toBe("muted");
    expect(root.getAttribute("data-size")).toBe("lg");
  });

  it("renders the title as a heading, so a card is a section not a page", () => {
    render(() => <Sample />);
    expect(screen.getByRole("heading", { name: "Monthly report" }).tagName).toBe("H3");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(() => <Sample />);
    for (const id of ["root", "header", "content", "footer"]) {
      const el = screen.getByTestId(id);
      expect(el.getAttribute("style")).toBeNull();
      expect(el.className).toBe("");
    }
  });

  it("forwards native props and events on every part", () => {
    const onClick = vi.fn();
    render(() => (
      <Card.Root aria-label="report" onClick={onClick}>
        <Card.Content>Body</Card.Content>
      </Card.Root>
    ));
    fireEvent.click(screen.getByLabelText("report"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
