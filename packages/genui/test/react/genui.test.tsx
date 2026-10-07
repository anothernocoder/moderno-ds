// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { confirmCard, salesCard } from "../../playground/examples.ts";
import { GenUI, type GenUIProps } from "../../src/react.ts";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function render(props: GenUIProps) {
  act(() => root.render(<GenUI {...props} />));
}

beforeEach(() => {
  container = document.body.appendChild(document.createElement("div"));
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("GenUI", () => {
  it("renders a streamed program progressively, one line at a time, without errors", () => {
    const consoleError = vi.spyOn(console, "error");
    const lines = salesCard.response.split("\n");
    const sizes: number[] = [];

    lines.forEach((_, index) => {
      render({ response: lines.slice(0, index + 1).join("\n"), isStreaming: true });
      sizes.push(container.innerHTML.length);
    });
    render({ response: salesCard.response, isStreaming: false });

    expect(consoleError).not.toHaveBeenCalled();
    expect(sizes.at(-1)).toBeGreaterThan(sizes[0]!);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(container.querySelector('[data-scope="card"] [data-part="title"]')?.textContent).toBe(
      "Sales this month",
    );
    expect(container.querySelector("svg")).not.toBeNull();
    consoleError.mockRestore();
  });

  it('spreads a Stack row apart with justify "between"', () => {
    render({
      response: [
        "root = Stack([row])",
        'row = Stack(["T-shirt x2", "$40.00"], "row", "2", "between")',
      ].join("\n"),
    });

    const row = [...container.querySelectorAll<HTMLElement>("div[style]")].find(
      (div) => div.style.flexDirection === "row",
    );
    expect(row?.textContent).toBe("T-shirt x2$40.00");
    expect(row?.style.justifyContent).toBe("space-between");
  });

  it("calls onAction with the event of a @ToAssistant button", () => {
    const onAction = vi.fn();
    render({ response: confirmCard.response, onAction });

    const confirm = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Confirm order",
    );
    act(() => confirm!.click());

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "continue_conversation",
        humanFriendlyMessage: "Confirm my order",
      }),
    );
  });
});
