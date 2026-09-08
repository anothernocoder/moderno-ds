import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { defineComponent, h } from "vue";
import { Card } from "../src/card.js";

afterEach(cleanup);

/** The full anatomy, so each test can assert one part of the same tree. */
const Sample = defineComponent({
  props: {
    variant: { type: String, default: undefined },
    size: { type: String, default: undefined },
  },
  setup(props) {
    return () =>
      h(Card.Root, { variant: props.variant, size: props.size, "data-testid": "root" }, () => [
        h(Card.Header, { "data-testid": "header" }, () => [
          h(Card.Title, {}, () => "Monthly report"),
          h(Card.Description, {}, () => "Revenue across every channel."),
        ]),
        h(Card.Content, { "data-testid": "content" }, () => "Up 12% on last month."),
        h(Card.Footer, { "data-testid": "footer" }, () => "Export"),
      ]);
  },
});

describe("Card (Vue)", () => {
  it("carries scope/part and the recipe defaults on the root", () => {
    render(Sample);
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-scope")).toBe("card");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-variant")).toBe("outline");
    expect(root.getAttribute("data-size")).toBe("md");
  });

  it("gives every part the card scope and its own data-part", () => {
    render(Sample);
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
    render(Sample, { props: { variant: "muted", size: "lg" } });
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-variant")).toBe("muted");
    expect(root.getAttribute("data-size")).toBe("lg");
  });

  it("renders the title as a heading, so a card is a section not a page", () => {
    render(Sample);
    expect(screen.getByRole("heading", { name: "Monthly report" }).tagName).toBe("H3");
  });

  it("never bakes in styling (no inline style, no class)", () => {
    render(Sample);
    for (const id of ["root", "header", "content", "footer"]) {
      const el = screen.getByTestId(id);
      expect(el.getAttribute("style")).toBeNull();
      expect(el.className).toBe("");
    }
  });

  it("forwards native props and events on every part", async () => {
    const onClick = vi.fn();
    const Clickable = defineComponent({
      setup() {
        return () =>
          h(Card.Root, { "aria-label": "report", onClick }, () =>
            h(Card.Content, {}, () => "Body"),
          );
      },
    });
    render(Clickable);
    await fireEvent.click(screen.getByLabelText("report"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
