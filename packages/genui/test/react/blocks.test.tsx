// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { OpenUIError } from "../../src/react.ts";
import { GenUI } from "../../src/react.ts";

/**
 * The host's Blocks, as `moderno add` copies them. Imported by path, as
 * packages/react/test/registry-render.test.tsx does: `registry/` has no
 * `node_modules`, so only Vitest's aliases resolve the blocks' own imports.
 */
const block = async (slug: string, name: string) =>
  (
    (await import(/* @vite-ignore */ `../../../../registry/blocks/${slug}/react/${slug}.tsx`)) as {
      [name: string]: ComponentType<never>;
    }
  )[name]!;

const blocks = {
  StatRow: await block("stat-row", "StatRow"),
  OrderSummary: await block("order-summary", "OrderSummary"),
  FormLayout: await block("form-layout", "FormLayout"),
};

const program = (...lines: string[]) => lines.join("\n");

const statRow = (action = "") =>
  `stats = StatRow("Last 7 days", "Sales", [{"id": "r", "label": "Revenue", "value": "$1,200"}]${action})`;

afterEach(cleanup);

describe("a host's Blocks", () => {
  it("server-render as the real block markup, with moderno classes", () => {
    const html = renderToString(
      <GenUI
        blocks={blocks}
        response={program(
          "root = Stack([stats, order])",
          statRow(),
          'order = OrderSummary("Your order", [{"id": "t", "name": "T-shirt", "price": "$20.00", "quantity": 2}], "$40.00", [{"label": "Subtotal", "amount": "$40.00"}])',
        )}
      />,
    );

    expect(html).toContain('class="@container moderno-block-stat-row');
    expect(html).toContain("moderno-block-order-summary");
    expect(html).toContain('data-scope="card"');
    expect(html).toContain("Revenue");
    expect(html).toContain("$1,200");
    expect(html).toContain("T-shirt");
    expect(html).toContain("$40.00");
    // Its content, never the sample's: an omitted action label is no button.
    expect(html).not.toContain("Active customers");
    expect(html).not.toContain("View report");
  });

  it("fire onAction with the label, or with the block's @ToAssistant message", () => {
    const onAction = vi.fn();
    render(
      <GenUI
        blocks={blocks}
        onAction={onAction}
        response={program(
          "root = Stack([stats, more])",
          statRow(', "Open report"'),
          'more = StatRow("Last 30 days", "Customers", [{"id": "c", "label": "Customers", "value": "48"}], "Compare", Action([@ToAssistant("Compare with last year")]))',
        )}
      />,
    );

    act(() => screen.getByRole("button", { name: "Open report" }).click());
    act(() => screen.getByRole("button", { name: "Compare" }).click());

    expect(onAction.mock.calls.map(([event]) => event.humanFriendlyMessage)).toEqual([
      "Open report",
      "Compare with last year",
    ]);
  });

  it("send a form Block's values on submit", async () => {
    const onAction = vi.fn();
    render(
      <GenUI
        blocks={blocks}
        onAction={onAction}
        response={program(
          "root = Stack([form])",
          'form = FormLayout([name], "Who you are", "Profile", null, null, "Save")',
          'name = Field("Name")',
        )}
      />,
    );

    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0]![0].humanFriendlyMessage).toBe("Save — Name: Ada");
  });

  it("report a Block the host did not pass, without throwing", () => {
    const errors: OpenUIError[] = [];
    render(
      <GenUI
        blocks={{ OrderSummary: blocks.OrderSummary }}
        onError={(reported) => errors.push(...reported)}
        response={program('root = Stack(["Sales", stats])', statRow())}
      />,
    );

    expect(screen.getByText("Sales")).toBeTruthy();
    expect(document.querySelector(".moderno-block-stat-row")).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({ message: expect.stringContaining("StatRow") }),
    ]);
  });
});
