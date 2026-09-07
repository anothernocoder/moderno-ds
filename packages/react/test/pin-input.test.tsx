// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PinInput, type PinInputValueChangeDetails } from "../src/index.js";

afterEach(cleanup);

describe("PinInput surface (React)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    // The spread keeps parts Ark adds in future versions (RootProvider,
    // Context, …) from silently dropping out of Moderno.
    const { PinInput: ArkPinInput } = await import("@ark-ui/react");
    for (const part of Object.keys(ArkPinInput)) {
      if (part === "Root") continue; // wrapped to inject the size recipe
      expect(
        PinInput[part as keyof typeof PinInput],
        `PinInput.${part} missing vs @ark-ui/react`,
      ).toBeDefined();
    }
  });
});

const CELLS = [0, 1, 2, 3];

function Demo(props: {
  invalid?: boolean;
  mask?: boolean;
  onValueChange?: (details: PinInputValueChangeDetails) => void;
  onValueComplete?: (details: PinInputValueChangeDetails) => void;
}) {
  return (
    <PinInput.Root
      count={CELLS.length}
      size="sm"
      otp
      invalid={props.invalid}
      mask={props.mask}
      onValueChange={props.onValueChange}
      onValueComplete={props.onValueComplete}
    >
      <PinInput.Label>Verification code</PinInput.Label>
      <PinInput.Control>
        {CELLS.map((index) => (
          <PinInput.Input key={index} index={index} />
        ))}
      </PinInput.Control>
      <PinInput.HiddenInput />
    </PinInput.Root>
  );
}

/** The visible code cells, in document order (the hidden input is aria-hidden). */
function cells(): HTMLInputElement[] {
  return Array.from(document.querySelectorAll('[data-scope="pin-input"][data-part="input"]'));
}

describe("PinInput", () => {
  it("applies the size recipe to the root part", () => {
    const { container } = render(<Demo />);
    const root = container.querySelector('[data-scope="pin-input"][data-part="root"]');
    expect(root?.getAttribute("data-size")).toBe("sm");
  });

  it("renders one cell per index, labelled and marked as a one-time code", () => {
    render(<Demo />);
    expect(cells()).toHaveLength(CELLS.length);
    expect(screen.getByText("Verification code").getAttribute("data-part")).toBe("label");
    // `otp` is what lets the platform offer the SMS code for autofill.
    expect(cells()[0]!.getAttribute("autocomplete")).toBe("one-time-code");
  });

  it("advances focus as characters land and reports the completed value", async () => {
    const user = userEvent.setup();
    const onValueComplete = vi.fn();
    render(<Demo onValueComplete={onValueComplete} />);

    await user.click(cells()[0]!);
    await user.keyboard("1234");

    await waitFor(() =>
      expect(onValueComplete).toHaveBeenCalledWith(
        expect.objectContaining({ valueAsString: "1234" }),
      ),
    );
    // Every cell holds a character, so Ark flags the root complete — the hook
    // components.css keys the "code accepted" border off.
    const root = document.querySelector('[data-scope="pin-input"][data-part="root"]');
    await waitFor(() => expect(root?.hasAttribute("data-complete")).toBe(true));
    expect(cells().every((cell) => cell.hasAttribute("data-filled"))).toBe(true);
  });

  it("distributes a pasted code across the cells", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);

    await user.click(cells()[0]!);
    await user.paste("4321");

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(
        expect.objectContaining({ value: ["4", "3", "2", "1"] }),
      ),
    );
    await waitFor(() => expect(cells().map((cell) => cell.value)).toEqual(["4", "3", "2", "1"]));
  });

  it("masks the cells when asked, like a password field", () => {
    const { rerender } = render(<Demo />);
    // Default numeric cells use tel, so a phone keypad comes up on mobile.
    expect(cells()[0]!.getAttribute("type")).toBe("tel");
    rerender(<Demo mask />);
    expect(cells().every((cell) => cell.getAttribute("type") === "password")).toBe(true);
  });

  it("mirrors invalid onto the styling hook and the accessibility tree", () => {
    const { container } = render(<Demo invalid />);
    const root = container.querySelector('[data-scope="pin-input"][data-part="root"]');
    expect(root?.hasAttribute("data-invalid")).toBe(true);
    for (const cell of cells()) {
      expect(cell.hasAttribute("data-invalid")).toBe(true);
      expect(cell.getAttribute("aria-invalid")).toBe("true");
    }
  });
});
