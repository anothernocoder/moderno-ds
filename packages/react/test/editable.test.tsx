// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  Editable,
  Field,
  type EditableActivationMode,
  type EditableSize,
  type EditableValueChangeDetails,
} from "../src/index.js";

afterEach(cleanup);

describe("Editable surface (React)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Editable: ArkEditable } = await import("@ark-ui/react");
    for (const part of Object.keys(ArkEditable)) {
      expect(Editable[part as keyof typeof Editable], `Editable.${part} missing`).toBeDefined();
    }
  });
});

interface DemoProps {
  size?: EditableSize;
  value?: string;
  defaultValue?: string;
  activationMode?: EditableActivationMode;
  submitMode?: "enter" | "blur" | "both" | "none";
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  triggers?: boolean;
  onValueChange?: (details: EditableValueChangeDetails) => void;
  onValueCommit?: (details: EditableValueChangeDetails) => void;
  onValueRevert?: (details: EditableValueChangeDetails) => void;
}

function Demo({ triggers, ...props }: DemoProps) {
  return (
    <>
      <Editable.Root {...props} className="layer-name">
        <Editable.Label>Layer name</Editable.Label>
        <Editable.Area>
          <Editable.Input />
          <Editable.Preview />
        </Editable.Area>
        {triggers && (
          <Editable.Control>
            <Editable.EditTrigger>Edit</Editable.EditTrigger>
            <Editable.SubmitTrigger>Save</Editable.SubmitTrigger>
            <Editable.CancelTrigger>Cancel</Editable.CancelTrigger>
          </Editable.Control>
        )}
      </Editable.Root>
      <button type="button">Elsewhere</button>
    </>
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="editable"][data-part="${name}"]`)!;
const preview = () => part("preview");
const input = () => part("input") as HTMLInputElement;
/** The text of the elements an element's `aria-describedby` points at. */
const description = (element: HTMLElement) =>
  (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent)
    .join(" ");

/*
 * The input's new text, as one change event: user-event's own tracking of
 * an input's value loses a keystroke when Ark writes the value back into
 * the input between keys, which a browser does not.
 */
const typeText = (value: string) => fireEvent.change(input(), { target: { value } });

/** Ark focuses the input on the next frame, and it selects its text. */
async function editing() {
  await waitFor(() => expect(document.activeElement).toBe(input()));
}

async function startEditing(user: ReturnType<typeof userEvent.setup>) {
  await user.dblClick(preview());
  await editing();
}

describe("Editable", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    const { unmount } = render(<Demo />);
    expect(part("root").getAttribute("data-size")).toBe("md");
    unmount();
    render(<Demo size="lg" />);
    expect(part("root").getAttribute("data-size")).toBe("lg");
    expect(part("root").classList.contains("layer-name")).toBe(true);
  });

  it("shows the value as text, a button named by the label and the value", () => {
    render(<Demo defaultValue="Background" />);
    expect(preview().textContent).toBe("Background");
    expect(input().hidden).toBe(true);
    const text = screen.getByRole("button", { name: "Layer name Background" });
    expect(text).toBe(preview());
    expect(text.tabIndex).toBe(0);
  });

  it("turns into the input on a double click, with the whole text selected", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="Background" />);
    await user.click(preview());
    expect(input().hidden).toBe(true);
    await startEditing(user);
    expect(preview().hidden).toBe(true);
    expect(input().hidden).toBe(false);
    expect(input().value).toBe("Background");
    expect([input().selectionStart, input().selectionEnd]).toEqual([0, "Background".length]);
    expect(part("area").hasAttribute("data-focus")).toBe(true);
  });

  it("names the input by the label", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="Background" />);
    await startEditing(user);
    expect(screen.getByRole("textbox", { name: "Layer name" })).toBe(input());
  });

  it("starts on a click with activationMode click", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="Background" activationMode="click" />);
    await user.click(preview());
    await editing();
  });

  it.each(["Enter", "F2", " "])("starts from the focused text on %j", async (key) => {
    const user = userEvent.setup();
    render(<Demo defaultValue="Background" />);
    preview().focus();
    await user.keyboard(key === " " ? " " : `{${key}}`);
    await editing();
    expect(input().value).toBe("Background");
  });

  it("saves on Enter and gives focus back to the text", async () => {
    const user = userEvent.setup();
    const onValueCommit = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Demo
        defaultValue="Background"
        onValueCommit={onValueCommit}
        onValueChange={onValueChange}
      />,
    );
    await startEditing(user);
    typeText("Sky");
    await user.keyboard("{Enter}");
    expect(preview().textContent).toBe("Sky");
    expect(input().hidden).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "Sky" });
    expect(onValueCommit).toHaveBeenCalledExactlyOnceWith({ value: "Sky" });
    await waitFor(() => expect(document.activeElement).toBe(preview()));
  });

  it("cancels on Escape: the value from before the edit comes back, and focus to the text", async () => {
    const user = userEvent.setup();
    const onValueRevert = vi.fn();
    const onValueCommit = vi.fn();
    render(
      <Demo
        defaultValue="Background"
        onValueRevert={onValueRevert}
        onValueCommit={onValueCommit}
      />,
    );
    await startEditing(user);
    typeText("Sky");
    await user.keyboard("{Escape}");
    expect(preview().textContent).toBe("Background");
    expect(onValueRevert).toHaveBeenCalledExactlyOnceWith({ value: "Background" });
    expect(onValueCommit).not.toHaveBeenCalled();
    await waitFor(() => expect(document.activeElement).toBe(preview()));
  });

  it("puts back an empty value on Escape too", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo placeholder="Untitled" onValueChange={onValueChange} />);
    await startEditing(user);
    typeText("Sky");
    await user.keyboard("{Escape}");
    expect(preview().textContent).toBe("Untitled");
    expect(preview().hasAttribute("data-placeholder-shown")).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "" });
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it("saves on blur by default, and cancels on blur with submitMode enter", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Demo defaultValue="Background" />);
    await startEditing(user);
    typeText("Sky");
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(preview().textContent).toBe("Sky");
    unmount();

    render(<Demo defaultValue="Background" submitMode="enter" />);
    await startEditing(user);
    typeText("Sky");
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(preview().textContent).toBe("Background");
  });

  it("wires the edit, save and cancel buttons, named by their words", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="Background" triggers />);
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await editing();
    typeText("Sky");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(preview().textContent).toBe("Sky");
    await waitFor(() => expect(document.activeElement).toBe(preview()));

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await editing();
    typeText("Sea");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(preview().textContent).toBe("Sky");
  });

  it("starts on focus with activationMode focus, but not on the focus it gives back", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="Background" activationMode="focus" />);
    await user.tab();
    await editing();
    typeText("Sky");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement).toBe(preview()));
    // The focus given back left the text a text.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(input().hidden).toBe(true);
    expect(preview().textContent).toBe("Sky");
  });

  it("follows a controlled value, and reports each change", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [name, setName] = useState("Background");
      return (
        <>
          <Demo value={name} onValueChange={(details) => setName(details.value)} />
          <output>{name}</output>
        </>
      );
    }
    render(<Controlled />);
    await startEditing(user);
    typeText("Sky");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status").textContent).toBe("Sky");
    expect(preview().textContent).toBe("Sky");
  });

  it("keeps a controlled value the consumer does not change", async () => {
    const user = userEvent.setup();
    render(<Demo value="Background" />);
    await startEditing(user);
    typeText("Sky");
    await user.keyboard("{Enter}");
    expect(preview().textContent).toBe("Background");
  });

  it("shows the placeholder when empty, and caps the input at maxLength", async () => {
    const user = userEvent.setup();
    render(<Demo placeholder="Untitled" maxLength={4} />);
    expect(preview().textContent).toBe("Untitled");
    expect(preview().hasAttribute("data-placeholder-shown")).toBe(true);
    await startEditing(user);
    expect(input().placeholder).toBe("Untitled");
    expect(input().maxLength).toBe(4);
  });

  it("disabled: the text leaves the tab order and never turns into the input", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="Background" disabled triggers />);
    expect(preview().hasAttribute("tabindex")).toBe(false);
    expect(preview().hasAttribute("role")).toBe(false);
    expect(preview().getAttribute("data-disabled")).toBe("");
    expect((screen.getByRole("button", { name: "Edit" }) as HTMLButtonElement).disabled).toBe(true);
    await user.dblClick(preview());
    expect(input().hidden).toBe(true);
  });

  it("readOnly: the text is read-only and never turns into the input", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="Background" readOnly />);
    expect(preview().getAttribute("aria-readonly")).toBe("true");
    expect(preview().hasAttribute("tabindex")).toBe(false);
    preview().focus();
    await user.dblClick(preview());
    await user.keyboard("{Enter}");
    expect(input().hidden).toBe(true);
  });

  it("shows the full value as a tooltip only when the text is cut short", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue="A long layer name that does not fit" />);
    vi.spyOn(preview(), "clientWidth", "get").mockReturnValue(80);
    vi.spyOn(preview(), "scrollWidth", "get").mockReturnValue(240);
    await user.hover(preview());
    expect(preview().title).toBe("A long layer name that does not fit");
    await user.unhover(preview());
    vi.spyOn(preview(), "scrollWidth", "get").mockReturnValue(80);
    await user.hover(preview());
    expect(preview().hasAttribute("title")).toBe(false);
  });

  it("works inside a Field: its label names the input and the text, its helper text describes them", async () => {
    const user = userEvent.setup();
    render(
      <Field.Root invalid>
        <Field.Label>Slide title</Field.Label>
        <Editable.Root defaultValue="Intro">
          <Editable.Area>
            <Editable.Input />
            <Editable.Preview />
          </Editable.Area>
        </Editable.Root>
        <Field.HelperText>Shown in the outline.</Field.HelperText>
        <Field.ErrorText>Too short.</Field.ErrorText>
      </Field.Root>,
    );
    const text = await screen.findByRole("button", { name: "Slide title Intro" });
    await waitFor(() => expect(text.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2));
    expect(description(text)).toBe("Too short. Shown in the outline.");
    expect(text.getAttribute("aria-invalid")).toBe("true");
    await startEditing(user);
    const field = screen.getByRole("textbox", { name: "Slide title" });
    expect(field).toBe(input());
    expect(description(field)).toBe("Too short. Shown in the outline.");
    expect(field.getAttribute("aria-invalid")).toBe("true");
  });
});
