import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { PinInput, type PinInputValueChangeDetails } from "../src/index.js";

afterEach(cleanup);

const CELLS = [0, 1, 2, 3];

const Demo = defineComponent({
  props: {
    invalid: { type: Boolean, default: false },
    mask: { type: Boolean, default: false },
    onValueChange: { type: Function, default: undefined },
    onValueComplete: { type: Function, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        PinInput.Root,
        {
          count: CELLS.length,
          size: "sm",
          otp: true,
          invalid: props.invalid,
          mask: props.mask,
          onValueChange: props.onValueChange as
            | ((details: PinInputValueChangeDetails) => void)
            | undefined,
          onValueComplete: props.onValueComplete as
            | ((details: PinInputValueChangeDetails) => void)
            | undefined,
        },
        () => [
          h(PinInput.Label, {}, () => "Verification code"),
          h(PinInput.Control, {}, () =>
            CELLS.map((index) => h(PinInput.Input, { key: index, index })),
          ),
          h(PinInput.HiddenInput),
        ],
      );
  },
});

/** The visible code cells, in document order (the hidden input is aria-hidden). */
function cells(): HTMLInputElement[] {
  return Array.from(document.querySelectorAll('[data-scope="pin-input"][data-part="input"]'));
}

describe("PinInput (Vue)", () => {
  it("applies the size recipe to the root part", () => {
    const { container } = render(Demo);
    const root = container.querySelector('[data-scope="pin-input"][data-part="root"]');
    expect(root?.getAttribute("data-size")).toBe("sm");
  });

  it("renders one cell per index, labelled and marked as a one-time code", () => {
    render(Demo);
    expect(cells()).toHaveLength(CELLS.length);
    expect(screen.getByText("Verification code").getAttribute("data-part")).toBe("label");
    expect(cells()[0]!.getAttribute("autocomplete")).toBe("one-time-code");
  });

  it("advances focus as characters land and reports the completed value", async () => {
    const user = userEvent.setup();
    const onValueComplete = vi.fn();
    render(Demo, { props: { onValueComplete } });

    await user.click(cells()[0]!);
    await user.keyboard("1234");

    await waitFor(() =>
      expect(onValueComplete).toHaveBeenCalledWith(
        expect.objectContaining({ valueAsString: "1234" }),
      ),
    );
    const root = document.querySelector('[data-scope="pin-input"][data-part="root"]');
    await waitFor(() => expect(root?.hasAttribute("data-complete")).toBe(true));
    expect(cells().every((cell) => cell.hasAttribute("data-filled"))).toBe(true);
  });

  it("distributes a pasted code across the cells", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });

    await user.click(cells()[0]!);
    await user.paste("4321");

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(
        expect.objectContaining({ value: ["4", "3", "2", "1"] }),
      ),
    );
    await waitFor(() => expect(cells().map((cell) => cell.value)).toEqual(["4", "3", "2", "1"]));
  });

  it("masks the cells when asked, like a password field", async () => {
    const { rerender } = render(Demo);
    expect(cells()[0]!.getAttribute("type")).toBe("tel");
    await rerender({ mask: true });
    expect(cells().every((cell) => cell.getAttribute("type") === "password")).toBe(true);
  });

  it("mirrors invalid onto the styling hook and the accessibility tree", () => {
    const { container } = render(Demo, { props: { invalid: true } });
    const root = container.querySelector('[data-scope="pin-input"][data-part="root"]');
    expect(root?.hasAttribute("data-invalid")).toBe(true);
    for (const cell of cells()) {
      expect(cell.hasAttribute("data-invalid")).toBe(true);
      expect(cell.getAttribute("aria-invalid")).toBe("true");
    }
  });
});
